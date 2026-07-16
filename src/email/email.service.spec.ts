import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { EMAIL_QUEUE, EmailJobType, MAX_EMAIL_RETRIES } from './constants/email.constants';

describe('EmailService', () => {
  let service: EmailService;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken(EMAIL_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcome', () => {
    it('should enqueue a welcome email job with correct options', async () => {
      await service.sendWelcome('user@example.com', {
        username: 'Alice',
        loginUrl: 'https://logiquest.app/login',
      });

      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalledWith(
        EmailJobType.SEND_WELCOME,
        {
          to: 'user@example.com',
          type: EmailJobType.SEND_WELCOME,
          context: { username: 'Alice', loginUrl: 'https://logiquest.app/login' },
        },
        expect.objectContaining({
          attempts: MAX_EMAIL_RETRIES,
          backoff: { type: 'exponential', delay: 5000 },
        }),
      );
    });
  });

  describe('sendPasswordReset', () => {
    it('should enqueue a password-reset email job', async () => {
      await service.sendPasswordReset('user@example.com', {
        username: 'Bob',
        resetUrl: 'https://logiquest.app/reset?token=xyz',
        expiresInMinutes: 30,
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        EmailJobType.SEND_PASSWORD_RESET,
        expect.objectContaining({ type: EmailJobType.SEND_PASSWORD_RESET }),
        expect.anything(),
      );
    });
  });

  describe('sendAchievementUnlocked', () => {
    it('should enqueue an achievement-unlocked email job', async () => {
      await service.sendAchievementUnlocked('user@example.com', {
        username: 'Carol',
        achievementTitle: 'First Blood',
        achievementDescription: 'Solved first puzzle',
        profileUrl: 'https://logiquest.app/profile',
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        EmailJobType.SEND_ACHIEVEMENT_UNLOCKED,
        expect.objectContaining({ type: EmailJobType.SEND_ACHIEVEMENT_UNLOCKED }),
        expect.anything(),
      );
    });
  });

  describe('sendWeeklySummary', () => {
    it('should enqueue a weekly-summary email job', async () => {
      await service.sendWeeklySummary('user@example.com', {
        username: 'Dave',
        weekStartDate: '2026-07-07',
        weekEndDate: '2026-07-13',
        puzzlesSolved: 5,
        totalScore: 2000,
        rank: 10,
        dashboardUrl: 'https://logiquest.app/dashboard',
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        EmailJobType.SEND_WEEKLY_SUMMARY,
        expect.objectContaining({ type: EmailJobType.SEND_WEEKLY_SUMMARY }),
        expect.anything(),
      );
    });
  });

  describe('sendTestEmail', () => {
    it('should enqueue a test email job', async () => {
      await service.sendTestEmail('admin@example.com');

      expect(mockQueue.add).toHaveBeenCalledWith(
        EmailJobType.SEND_TEST,
        expect.objectContaining({
          to: 'admin@example.com',
          type: EmailJobType.SEND_TEST,
        }),
        expect.anything(),
      );
    });
  });

  describe('retry logic', () => {
    it('should configure MAX_EMAIL_RETRIES attempts on every queued job', async () => {
      await service.sendWelcome('user@example.com', {
        username: 'Test',
        loginUrl: 'https://logiquest.app',
      });

      const callArgs = mockQueue.add.mock.calls[0];
      const jobOptions = callArgs[2];
      expect(jobOptions.attempts).toBe(MAX_EMAIL_RETRIES);
      expect(jobOptions.backoff.type).toBe('exponential');
    });
  });
});
