import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { CalibrationService } from './calibration.service';
import { DifficultyCalibration, CalibrationStatus } from './entities/difficulty-calibration.entity';
import { Puzzle } from '../puzzles/entities/puzzle.entity';
import { Session, SessionStatus } from '../sessions/entities/session.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

describe('CalibrationService', () => {
  let service: CalibrationService;

  const mockCalibrationRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPuzzleRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockSessionRepo = {
    find: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalibrationService,
        { provide: getRepositoryToken(DifficultyCalibration), useValue: mockCalibrationRepo },
        { provide: getRepositoryToken(Puzzle), useValue: mockPuzzleRepo },
        { provide: getRepositoryToken(Session), useValue: mockSessionRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CalibrationService>(CalibrationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('computeCalibrationScore', () => {
    it('returns 0 for perfect performance (100% solve, 0% abandon, 0 hints)', () => {
      const score = service.computeCalibrationScore(1.0, 0, 0);
      expect(score).toBe(0);
    });

    it('returns high score for poor performance (low solve, high abandon, many hints)', () => {
      const score = service.computeCalibrationScore(0.0, 1.0, 3);
      expect(score).toBe(100);
    });

    it('weights solve rate at 40%, abandon rate at 35%, hints at 25%', () => {
      const score = service.computeCalibrationScore(0.5, 0.5, 1.5);
      const expected = Math.round(((0.5 * 40) + (0.5 * 35) + (0.5 * 25)) * 100) / 100;
      expect(score).toBe(expected);
    });

    it('caps hint contribution at 1.0 when avgHintsUsed exceeds 3', () => {
      const score3 = service.computeCalibrationScore(0.5, 0.5, 3);
      const score5 = service.computeCalibrationScore(0.5, 0.5, 5);
      expect(score3).toBe(score5);
    });

    it('returns 15 for a mostly solving puzzle with no hints', () => {
      const score = service.computeCalibrationScore(0.8, 0.2, 0);
      expect(score).toBe(15);
    });

    it('returns 50 for an equal split scenario with moderate hints', () => {
      const score = service.computeCalibrationScore(0.5, 0.5, 1.5);
      expect(score).toBe(50);
    });
  });

  describe('recommendDifficulty', () => {
    it('recommends Easy for score below 35', () => {
      expect(service.recommendDifficulty(0)).toBe('Easy');
      expect(service.recommendDifficulty(10)).toBe('Easy');
      expect(service.recommendDifficulty(34)).toBe('Easy');
    });

    it('recommends Medium for score between 35 and 64', () => {
      expect(service.recommendDifficulty(35)).toBe('Medium');
      expect(service.recommendDifficulty(50)).toBe('Medium');
      expect(service.recommendDifficulty(64)).toBe('Medium');
    });

    it('recommends Hard for score 65 and above', () => {
      expect(service.recommendDifficulty(65)).toBe('Hard');
      expect(service.recommendDifficulty(80)).toBe('Hard');
      expect(service.recommendDifficulty(100)).toBe('Hard');
    });

    it('boundary: 34 -> Easy, 35 -> Medium', () => {
      expect(service.recommendDifficulty(34)).toBe('Easy');
      expect(service.recommendDifficulty(35)).toBe('Medium');
    });

    it('boundary: 64 -> Medium, 65 -> Hard', () => {
      expect(service.recommendDifficulty(64)).toBe('Medium');
      expect(service.recommendDifficulty(65)).toBe('Hard');
    });
  });

  describe('normalizeDifficulty', () => {
    it('normalizes case-insensitive strings', () => {
      expect(service.normalizeDifficulty('easy')).toBe('Easy');
      expect(service.normalizeDifficulty('EASY')).toBe('Easy');
      expect(service.normalizeDifficulty('Medium')).toBe('Medium');
      expect(service.normalizeDifficulty('hard')).toBe('Hard');
      expect(service.normalizeDifficulty('HARD')).toBe('Hard');
    });

    it('defaults to Medium for unrecognized values', () => {
      expect(service.normalizeDifficulty('impossible')).toBe('Medium');
      expect(service.normalizeDifficulty('')).toBe('Medium');
      expect(service.normalizeDifficulty('trivial')).toBe('Medium');
    });

    it('trims whitespace', () => {
      expect(service.normalizeDifficulty('  easy  ')).toBe('Easy');
    });
  });

  describe('runCalibration', () => {
    it('skips puzzles with fewer than 5 sessions', async () => {
      const puzzles = [{ id: 'p1', title: 'Test', difficulty: 'easy' }];
      mockPuzzleRepo.find.mockResolvedValue(puzzles);
      mockSessionRepo.find.mockResolvedValue([{ id: 's1' }, { id: 's2' }]);

      const results = await service.runCalibration();

      expect(results).toEqual([]);
      expect(mockCalibrationRepo.create).not.toHaveBeenCalled();
    });

    it('calibrates puzzles with enough sessions', async () => {
      const puzzles = [{ id: 'p1', title: 'Test', difficulty: 'easy', authorId: 'a1' }];
      mockPuzzleRepo.find.mockResolvedValue(puzzles);
      mockSessionRepo.find.mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({
          id: `s${i}`,
          status: SessionStatus.COMPLETED,
          hintsUsed: 0,
          startedAt: new Date(Date.now() - 300000),
          completedAt: new Date(Date.now() - 240000),
        })),
      );
      mockCalibrationRepo.create.mockImplementation((c) => c);
      mockCalibrationRepo.save.mockImplementation((c) => Promise.resolve({ ...c, id: 'cal1' }));

      const results = await service.runCalibration();

      expect(results).toHaveLength(1);
      expect(mockCalibrationRepo.save).toHaveBeenCalled();
    });

    it('sends notification when difficulty diverges', async () => {
      const puzzles = [{ id: 'p1', title: 'Hard Puzzle', difficulty: 'hard', authorId: 'a1' }];
      mockPuzzleRepo.find.mockResolvedValue(puzzles);
      const now = Date.now();
      mockSessionRepo.find.mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({
          id: `s${i}`,
          status: SessionStatus.COMPLETED,
          hintsUsed: 0,
          startedAt: new Date(now - 600000),
          completedAt: new Date(now - 590000),
        })),
      );
      mockCalibrationRepo.create.mockImplementation((c) => c);
      mockCalibrationRepo.save.mockImplementation((c) => Promise.resolve({ ...c, id: 'cal1' }));
      mockConfigService.get.mockReturnValue('false');

      await service.runCalibration();

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.DIFFICULTY_RECALIBRATED,
        }),
      );
    });

    it('auto-applies when CALIBRATION_AUTO_APPLY is true', async () => {
      const puzzles = [{ id: 'p1', title: 'Hard Puzzle', difficulty: 'hard', authorId: 'a1' }];
      mockPuzzleRepo.find.mockResolvedValue(puzzles);
      const now = Date.now();
      mockSessionRepo.find.mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({
          id: `s${i}`,
          status: SessionStatus.COMPLETED,
          hintsUsed: 0,
          startedAt: new Date(now - 600000),
          completedAt: new Date(now - 590000),
        })),
      );

      const calibration = {
        id: 'cal1',
        puzzleId: 'p1',
        recommendedDifficulty: 'Medium',
        currentDifficulty: 'Hard',
        status: CalibrationStatus.PENDING,
      };
      const puzzle = { id: 'p1', difficulty: 'hard', title: 'Hard Puzzle' };

      mockCalibrationRepo.create.mockImplementation((c) => c);
      mockCalibrationRepo.save.mockImplementation((c) => Promise.resolve({ ...c, id: 'cal1' }));
      mockCalibrationRepo.findOne.mockResolvedValue(calibration);
      mockPuzzleRepo.findOne.mockResolvedValue(puzzle);
      mockPuzzleRepo.save.mockImplementation((p) => Promise.resolve(p));
      mockConfigService.get.mockReturnValue('true');

      await service.runCalibration();

      expect(mockPuzzleRepo.save).toHaveBeenCalled();
      expect(puzzle.difficulty).toBe('Medium');
    });
  });

  describe('findAll', () => {
    it('returns all calibration records ordered by evaluatedAt DESC', async () => {
      const records = [{ id: 'c1' }, { id: 'c2' }];
      mockCalibrationRepo.find.mockResolvedValue(records);

      const result = await service.findAll();

      expect(result).toEqual(records);
      expect(mockCalibrationRepo.find).toHaveBeenCalledWith({
        order: { evaluatedAt: 'DESC' },
        relations: { puzzle: true },
      });
    });
  });

  describe('findByPuzzleId', () => {
    it('returns calibration for a given puzzle', async () => {
      const record = { id: 'c1', puzzleId: 'p1' };
      mockCalibrationRepo.findOne.mockResolvedValue(record);

      const result = await service.findByPuzzleId('p1');

      expect(result).toEqual(record);
    });

    it('throws NotFoundException when no record exists', async () => {
      mockCalibrationRepo.findOne.mockResolvedValue(null);

      await expect(service.findByPuzzleId('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('applyRecommendation', () => {
    it('updates puzzle difficulty and marks calibration as applied', async () => {
      const calibration = {
        id: 'c1',
        puzzleId: 'p1',
        recommendedDifficulty: 'Medium',
        currentDifficulty: 'Easy',
        status: CalibrationStatus.PENDING,
      };
      const puzzle = { id: 'p1', difficulty: 'easy', title: 'Test' };

      mockCalibrationRepo.findOne.mockResolvedValue(calibration);
      mockPuzzleRepo.findOne.mockResolvedValue(puzzle);
      mockCalibrationRepo.save.mockImplementation((c) => Promise.resolve(c));
      mockPuzzleRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.applyRecommendation('p1');

      expect(result.difficulty).toBe('Medium');
      expect(calibration.status).toBe(CalibrationStatus.APPLIED);
    });

    it('throws NotFoundException when no pending calibration exists', async () => {
      mockCalibrationRepo.findOne.mockResolvedValue(null);

      await expect(service.applyRecommendation('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('dismissRecommendation', () => {
    it('marks calibration as dismissed', async () => {
      const calibration = {
        id: 'c1',
        puzzleId: 'p1',
        status: CalibrationStatus.PENDING,
      };
      mockCalibrationRepo.findOne.mockResolvedValue(calibration);
      mockCalibrationRepo.save.mockImplementation((c) => Promise.resolve(c));

      const result = await service.dismissRecommendation('p1');

      expect(result.status).toBe(CalibrationStatus.DISMISSED);
    });

    it('throws NotFoundException when no pending calibration exists', async () => {
      mockCalibrationRepo.findOne.mockResolvedValue(null);

      await expect(service.dismissRecommendation('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('edge cases', () => {
    it('handles puzzle with zero completed sessions', async () => {
      const score = service.computeCalibrationScore(0, 1.0, 2);
      expect(score).toBeGreaterThan(0);
    });

    it('handles sessions where all are abandoned', async () => {
      const puzzles = [{ id: 'p1', title: 'Abandoned', difficulty: 'easy', authorId: 'a1' }];
      mockPuzzleRepo.find.mockResolvedValue(puzzles);
      mockSessionRepo.find.mockResolvedValue(
        Array.from({ length: 5 }, (_, i) => ({
          id: `s${i}`,
          status: SessionStatus.ABANDONED,
          hintsUsed: 0,
          startedAt: new Date(),
          completedAt: null,
        })),
      );
      mockCalibrationRepo.create.mockImplementation((c) => c);
      mockCalibrationRepo.save.mockImplementation((c) => Promise.resolve({ ...c, id: 'cal1' }));
      mockConfigService.get.mockReturnValue('false');

      const results = await service.runCalibration();

      expect(results).toHaveLength(1);
      expect(results[0].abandonRate).toBe(1);
      expect(results[0].solveRate).toBe(0);
    });

    it('handles sessions with no completed duration (all abandoned)', async () => {
      const puzzles = [{ id: 'p1', title: 'No Duration', difficulty: 'medium', authorId: 'a1' }];
      mockPuzzleRepo.find.mockResolvedValue(puzzles);
      mockSessionRepo.find.mockResolvedValue(
        Array.from({ length: 6 }, (_, i) => ({
          id: `s${i}`,
          status: SessionStatus.ABANDONED,
          hintsUsed: 1,
          startedAt: new Date(),
          completedAt: null,
        })),
      );
      mockCalibrationRepo.create.mockImplementation((c) => c);
      mockCalibrationRepo.save.mockImplementation((c) => Promise.resolve({ ...c, id: 'cal1' }));
      mockConfigService.get.mockReturnValue('false');

      const results = await service.runCalibration();

      expect(results).toHaveLength(1);
      expect(results[0].avgDurationSeconds).toBe(0);
    });
  });
});
