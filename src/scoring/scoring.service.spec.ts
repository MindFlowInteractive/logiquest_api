import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Score } from './entities/score.entity';
import { EventBusService } from '../common/events/event-bus.service';
import { Repository } from 'typeorm';

describe('ScoringService', () => {
  let service: ScoringService;
  let scoreRepo: jest.Mocked<Repository<Score>>;
  let eventBus: jest.Mocked<EventBusService>;

  const mockScoreRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEventBus = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        {
          provide: getRepositoryToken(Score),
          useValue: mockScoreRepo,
        },
        {
          provide: EventBusService,
          useValue: mockEventBus,
        },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
    scoreRepo = module.get(getRepositoryToken(Score));
    eventBus = module.get(EventBusService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Base Score Calculations', () => {
    it('should calculate base score according to difficulty', async () => {
      // Setup mock repository save to return whatever it was created with
      mockScoreRepo.create.mockImplementation((dto) => dto);
      mockScoreRepo.save.mockImplementation(async (entity) => ({ id: '1', ...entity }));
      
      // Mock getTotalScore inside recordScore
      mockScoreRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: 100 }),
      } as any);

      // Easy (100)
      let score = await service.recordScore({
        userId: 'user-1',
        sessionId: 'session-1',
        puzzleId: 'puzzle-easy',
        difficulty: 'Easy',
        elapsedSeconds: 9999, // Slow completion (no time bonus)
        hintCount: 0,
      });
      expect(score.baseScore).toBe(100);
      expect(score.finalScore).toBe(100);

      // Medium (250)
      score = await service.recordScore({
        userId: 'user-1',
        sessionId: 'session-2',
        puzzleId: 'puzzle-medium',
        difficulty: 'Medium',
        elapsedSeconds: 9999,
        hintCount: 0,
      });
      expect(score.baseScore).toBe(250);
      expect(score.finalScore).toBe(250);

      // Hard (500)
      score = await service.recordScore({
        userId: 'user-1',
        sessionId: 'session-3',
        puzzleId: 'puzzle-hard',
        difficulty: 'Hard',
        elapsedSeconds: 9999,
        hintCount: 0,
      });
      expect(score.baseScore).toBe(500);
      expect(score.finalScore).toBe(500);
    });
  });

  describe('Time Bonus Calculations', () => {
    beforeEach(() => {
      process.env.TIME_BONUS_THRESHOLD = '300';
      process.env.TIME_BONUS_MULTIPLIER = '1.2';
      
      mockScoreRepo.create.mockImplementation((dto) => dto);
      mockScoreRepo.save.mockImplementation(async (entity) => ({ id: '1', ...entity }));
      mockScoreRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: 120 }),
      } as any);
    });

    it('should apply time bonus for completions at or under the threshold', async () => {
      // Under threshold: 100 * 1.2 = 120
      const score = await service.recordScore({
        userId: 'user-1',
        sessionId: 'session-1',
        puzzleId: 'puzzle-1',
        difficulty: 'Easy',
        elapsedSeconds: 120, // fast
        hintCount: 0,
      });
      expect(score.timeBonus).toBe(20);
      expect(score.finalScore).toBe(120);
    });

    it('should NOT apply time bonus for completions over the threshold', async () => {
      // Over threshold: 100 * 1.0 = 100
      const score = await service.recordScore({
        userId: 'user-1',
        sessionId: 'session-1',
        puzzleId: 'puzzle-1',
        difficulty: 'Easy',
        elapsedSeconds: 301, // slow
        hintCount: 0,
      });
      expect(score.timeBonus).toBe(0);
      expect(score.finalScore).toBe(100);
    });
  });

  describe('Hint Penalties', () => {
    beforeEach(() => {
      process.env.HINT_PENALTY = '50';
      
      mockScoreRepo.create.mockImplementation((dto) => dto);
      mockScoreRepo.save.mockImplementation(async (entity) => ({ id: '1', ...entity }));
      mockScoreRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: 150 }),
      } as any);
    });

    it('should reduce the score by configured penalty per hint', async () => {
      // Hard: 500 base score
      // 2 hints used -> penalty = 2 * 50 = 100
      // Final: 400
      const score = await service.recordScore({
        userId: 'user-1',
        sessionId: 'session-1',
        puzzleId: 'puzzle-1',
        difficulty: 'Hard',
        elapsedSeconds: 9999, // slow
        hintCount: 2,
      });
      expect(score.hintPenalty).toBe(100);
      expect(score.finalScore).toBe(400);
    });

    it('should not allow final score to go below 0 due to penalties', async () => {
      // Easy: 100 base score
      // 3 hints used -> penalty = 3 * 50 = 150
      // Final: Math.max(0, 100 - 150) = 0
      const score = await service.recordScore({
        userId: 'user-1',
        sessionId: 'session-1',
        puzzleId: 'puzzle-1',
        difficulty: 'Easy',
        elapsedSeconds: 9999,
        hintCount: 3,
      });
      expect(score.finalScore).toBe(0);
    });
  });

  describe('Event Emission', () => {
    it('should emit score.updated event with correct payload after recording', async () => {
      mockScoreRepo.create.mockImplementation((dto) => dto);
      mockScoreRepo.save.mockImplementation(async (entity) => ({ id: '1', ...entity }));
      mockScoreRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: 350 }),
      } as any);

      await service.recordScore({
        userId: 'user-event-test',
        sessionId: 'session-1',
        puzzleId: 'puzzle-1',
        difficulty: 'Medium',
        elapsedSeconds: 9999,
        hintCount: 0,
      });

      expect(mockEventBus.emit).toHaveBeenCalledWith('score.updated', {
        userId: 'user-event-test',
        newTotal: 350,
      });
    });
  });

  describe('Get Player Score Summary', () => {
    it('should return total score and breakdown', async () => {
      const mockBreakdown = [
        { id: '1', puzzleId: 'p1', finalScore: 100 },
        { id: '2', puzzleId: 'p2', finalScore: 150 },
      ];

      mockScoreRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: 250 }),
      } as any);

      mockScoreRepo.find.mockResolvedValue(mockBreakdown as any);

      const summary = await service.getPlayerScoreSummary('user-1');
      expect(summary.totalScore).toBe(250);
      expect(summary.puzzles).toEqual(mockBreakdown);
      expect(mockScoreRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } },
      });
    });
  });
});
