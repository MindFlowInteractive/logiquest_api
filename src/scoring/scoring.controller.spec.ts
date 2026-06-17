import { Test, TestingModule } from '@nestjs/testing';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

describe('ScoringController', () => {
  let controller: ScoringController;
  let service: jest.Mocked<ScoringService>;

  const mockScoringService = {
    getPlayerScoreSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoringController],
      providers: [
        {
          provide: ScoringService,
          useValue: mockScoringService,
        },
      ],
    }).compile();

    controller = module.get<ScoringController>(ScoringController);
    service = module.get(ScoringService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPlayerScore', () => {
    it('should return the score summary for a user', async () => {
      const mockSummary = {
        totalScore: 250,
        puzzles: [
          { puzzleId: 'p1', finalScore: 100 } as any,
          { puzzleId: 'p2', finalScore: 150 } as any,
        ],
      };

      mockScoringService.getPlayerScoreSummary.mockResolvedValue(mockSummary);

      const result = await controller.getPlayerScore('user-1');
      expect(result).toEqual(mockSummary);
      expect(mockScoringService.getPlayerScoreSummary).toHaveBeenCalledWith('user-1');
    });
  });
});
