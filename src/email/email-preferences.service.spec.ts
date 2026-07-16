import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailPreferencesService } from './email-preferences.service';
import { EmailPreference } from './entities/email-preference.entity';

describe('EmailPreferencesService', () => {
  let service: EmailPreferencesService;

  const defaultPrefs: EmailPreference = {
    id: 'pref-1',
    userId: 'user-1',
    marketingEmails: true,
    achievementEmails: true,
    weeklySummaryEmails: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: undefined as any,
  };

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => ({ ...defaultPrefs, ...dto })),
    save: jest.fn().mockImplementation((prefs) => Promise.resolve({ ...defaultPrefs, ...prefs })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailPreferencesService,
        {
          provide: getRepositoryToken(EmailPreference),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<EmailPreferencesService>(EmailPreferencesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreate', () => {
    it('should return existing prefs if they exist', async () => {
      mockRepo.findOne.mockResolvedValue(defaultPrefs);

      const result = await service.getOrCreate('user-1');

      expect(result).toEqual(defaultPrefs);
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('should create and save default prefs if none exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.getOrCreate('new-user');

      expect(mockRepo.create).toHaveBeenCalledWith({ userId: 'new-user' });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.userId).toBe('new-user');
    });
  });

  describe('update', () => {
    it('should update specific preference fields', async () => {
      mockRepo.findOne.mockResolvedValue({ ...defaultPrefs });
      mockRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.update('user-1', {
        weeklySummaryEmails: false,
        achievementEmails: false,
      });

      expect(result.weeklySummaryEmails).toBe(false);
      expect(result.achievementEmails).toBe(false);
      expect(result.marketingEmails).toBe(true); // unchanged
    });

    it('should persist the updated prefs to the repository', async () => {
      mockRepo.findOne.mockResolvedValue({ ...defaultPrefs });

      await service.update('user-1', { marketingEmails: false });

      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ marketingEmails: false }),
      );
    });
  });

  describe('opt-out enforcement', () => {
    it('canReceiveAchievementEmails returns false when achievementEmails is false', async () => {
      mockRepo.findOne.mockResolvedValue({ ...defaultPrefs, achievementEmails: false });

      const result = await service.canReceiveAchievementEmails('user-1');
      expect(result).toBe(false);
    });

    it('canReceiveAchievementEmails returns true when achievementEmails is true', async () => {
      mockRepo.findOne.mockResolvedValue({ ...defaultPrefs, achievementEmails: true });

      const result = await service.canReceiveAchievementEmails('user-1');
      expect(result).toBe(true);
    });

    it('canReceiveAchievementEmails defaults to true when no prefs exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.canReceiveAchievementEmails('unknown-user');
      expect(result).toBe(true);
    });

    it('canReceiveWeeklySummaryEmails returns false when weeklySummaryEmails is false', async () => {
      mockRepo.findOne.mockResolvedValue({ ...defaultPrefs, weeklySummaryEmails: false });

      const result = await service.canReceiveWeeklySummaryEmails('user-1');
      expect(result).toBe(false);
    });

    it('canReceiveWeeklySummaryEmails defaults to true when no prefs exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.canReceiveWeeklySummaryEmails('unknown-user');
      expect(result).toBe(true);
    });

    it('canReceiveMarketingEmails returns false when marketingEmails is false', async () => {
      mockRepo.findOne.mockResolvedValue({ ...defaultPrefs, marketingEmails: false });

      const result = await service.canReceiveMarketingEmails('user-1');
      expect(result).toBe(false);
    });

    it('canReceiveMarketingEmails defaults to true when no prefs exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.canReceiveMarketingEmails('unknown-user');
      expect(result).toBe(true);
    });
  });
});
