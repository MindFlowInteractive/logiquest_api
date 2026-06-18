import { Test, TestingModule } from '@nestjs/testing';
import { RewardsService } from '../src/rewards/rewards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reward, RewardType } from '../src/rewards/entities/reward.entity';
import { Repository } from 'typeorm';
import { PuzzleInstance } from '../src/puzzle-engine/models/puzzle-instance.model';

describe('RewardsService', () => {
  let service: RewardsService;
  let repo: Repository<Reward>;

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  } as any;

  const mockPuzzleInstance = (id: string, difficulty: number, moves: number, userId = 'user1') => {
    const instance = new PuzzleInstance({
      id: 'puzzle1',
      type: 'test',
      data: {},
      difficulty,
      metadata: { createdAt: new Date(), updatedAt: new Date() },
    } as any, userId);
    // simulate moves
    for (let i = 0; i < moves; i++) {
      instance['moves'].push({ move: i, timestamp: new Date() });
    }
    instance.isCompleted = true;
    return instance;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardsService, { provide: getRepositoryToken(Reward), useValue: mockRepo }],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
    repo = module.get<Repository<Reward>>(getRepositoryToken(Reward));
  });

  it('should grant reward with amount based on difficulty and score', async () => {
    const instance = mockPuzzleInstance('sess1', 2, 3);
    mockRepo.findOne.mockResolvedValue(undefined);
    mockRepo.create.mockImplementation((obj) => obj);
    mockRepo.save.mockImplementation(async (obj) => ({ id: 'r1', ...obj }));

    const reward = await service.grantReward(instance);
    expect(reward).toBeDefined();
    // base=10, difficulty=2, score=moves=3 => amount=60
    expect(reward.amount).toBe(60);
    expect(reward.userId).toBe('user1');
    expect(reward.sessionId).toBe('sess1');
    expect(reward.type).toBe(RewardType.STELLA);
  });

  it('should prevent duplicate rewards for same session', async () => {
    const instance = mockPuzzleInstance('sess2', 1, 1);
    const existing = { id: 'r2', userId: 'user1', sessionId: 'sess2', amount: 10, type: RewardType.STELLA } as Reward;
    mockRepo.findOne.mockResolvedValue(existing);
    const reward = await service.grantReward(instance);
    expect(reward).toBe(existing);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should calculate total balance correctly', async () => {
    const rewards = [
      { amount: 10 } as Reward,
      { amount: 20 } as Reward,
    ];
    mockRepo.find.mockResolvedValue(rewards);
    const total = await service.getTotalBalance('user1');
    expect(total).toBe(30);
  });
});
