import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsService } from './achievements.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { PlayerAchievement } from './entities/player-achievement.entity';

describe('AchievementsService', () => {
  let service: AchievementsService;
  const mockAchievementRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockPlayerAchRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        { provide: getRepositoryToken(Achievement), useValue: mockAchievementRepo },
        { provide: getRepositoryToken(PlayerAchievement), useValue: mockPlayerAchRepo },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should unlock achievement when condition satisfied', async () => {
    const ach: Achievement = {
      id: 'a1',
      name: 'First Win',
      description: '',
      conditionType: 'puzzles_solved',
      threshold: 1,
      rarity: 'common',
    } as any;
    mockAchievementRepo.find.mockResolvedValue([ach]);
    mockPlayerAchRepo.findOne.mockResolvedValue(undefined);
    mockPlayerAchRepo.create.mockReturnValue({ userId: 'u1', achievementId: 'a1' });
    mockPlayerAchRepo.save.mockResolvedValue({});

    await service.evaluate('u1', { puzzlesSolved: 1 });
    expect(mockPlayerAchRepo.save).toHaveBeenCalled();
  });

  it('should not unlock when already unlocked', async () => {
    const ach: Achievement = {
      id: 'a1',
      name: 'First Win',
      description: '',
      conditionType: 'puzzles_solved',
      threshold: 1,
      rarity: 'common',
    } as any;
    mockAchievementRepo.find.mockResolvedValue([ach]);
    mockPlayerAchRepo.findOne.mockResolvedValue({}); // already exists
    await service.evaluate('u1', { puzzlesSolved: 5 });
    expect(mockPlayerAchRepo.save).not.toHaveBeenCalled();
  });

  it('should retrieve user achievements', async () => {
    const pa: PlayerAchievement = { id: 'pa1', userId: 'u1', achievementId: 'a1', unlockedAt: new Date(), achievement: {} as any } as any;
    mockPlayerAchRepo.find.mockResolvedValue([pa]);
    const result = await service.getForUser('u1');
    expect(result).toEqual([pa]);
  });
});
