import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';
import { EmailTemplateService } from './email-template.service';
import { EmailProviderService } from './email-provider.service';
import { EmailJobType } from './constants/email.constants';
import { EmailJobPayload } from './interfaces/email.interfaces';
import { Job } from 'bullmq';

function makeJob(
  type: EmailJobType,
  to: string,
  context: Record<string, unknown>,
  attemptsMade = 0,
  totalAttempts = 3,
): Partial<Job<EmailJobPayload>> {
  return {
    id: 'job-test-1',
    data: { to, type, context },
    attemptsMade,
    opts: { attempts: totalAttempts },
  };
}

describe('EmailProcessor', () => {
  let processor: EmailProcessor;

  const mockTemplateService = {
    compile: jest.fn().mockReturnValue('<html>Email body</html>'),
  };

  const mockProviderService = {
    send: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        { provide: EmailTemplateService, useValue: mockTemplateService },
        { provide: EmailProviderService, useValue: mockProviderService },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should compile the correct template and send the email', async () => {
      const job = makeJob(
        EmailJobType.SEND_WELCOME,
        'user@example.com',
        { username: 'Alice', loginUrl: 'https://logiquest.app' },
      ) as Job<EmailJobPayload>;

      await processor.process(job);

      expect(mockTemplateService.compile).toHaveBeenCalledWith(
        'welcome',
        { username: 'Alice', loginUrl: 'https://logiquest.app' },
      );
      expect(mockProviderService.send).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: '🧩 Welcome to LogiQuest!',
        html: '<html>Email body</html>',
      });
    });

    it('should use the password-reset template for SEND_PASSWORD_RESET jobs', async () => {
      const job = makeJob(
        EmailJobType.SEND_PASSWORD_RESET,
        'user@example.com',
        { username: 'Bob', resetUrl: 'https://logiquest.app/reset', expiresInMinutes: 30 },
      ) as Job<EmailJobPayload>;

      await processor.process(job);

      expect(mockTemplateService.compile).toHaveBeenCalledWith(
        'password-reset',
        expect.objectContaining({ username: 'Bob' }),
      );
      expect(mockProviderService.send).toHaveBeenCalledWith(
        expect.objectContaining({ subject: '🔒 Reset Your LogiQuest Password' }),
      );
    });

    it('should use the achievement-unlocked template for SEND_ACHIEVEMENT_UNLOCKED jobs', async () => {
      const job = makeJob(
        EmailJobType.SEND_ACHIEVEMENT_UNLOCKED,
        'user@example.com',
        { username: 'Carol', achievementTitle: 'First Blood', achievementDescription: 'Desc', profileUrl: 'https://logiquest.app' },
      ) as Job<EmailJobPayload>;

      await processor.process(job);

      expect(mockTemplateService.compile).toHaveBeenCalledWith(
        'achievement-unlocked',
        expect.objectContaining({ username: 'Carol' }),
      );
      expect(mockProviderService.send).toHaveBeenCalledWith(
        expect.objectContaining({ subject: '🏆 Achievement Unlocked!' }),
      );
    });

    it('should use the weekly-summary template for SEND_WEEKLY_SUMMARY jobs', async () => {
      const job = makeJob(
        EmailJobType.SEND_WEEKLY_SUMMARY,
        'user@example.com',
        {
          username: 'Dave',
          weekStartDate: '2026-07-07',
          weekEndDate: '2026-07-13',
          puzzlesSolved: 5,
          totalScore: 2000,
          rank: 10,
          dashboardUrl: 'https://logiquest.app/dashboard',
        },
      ) as Job<EmailJobPayload>;

      await processor.process(job);

      expect(mockTemplateService.compile).toHaveBeenCalledWith(
        'weekly-summary',
        expect.objectContaining({ username: 'Dave' }),
      );
      expect(mockProviderService.send).toHaveBeenCalledWith(
        expect.objectContaining({ subject: '📊 Your Weekly LogiQuest Summary' }),
      );
    });
  });

  describe('retry logic (error propagation)', () => {
    it('should rethrow errors so BullMQ can apply retry + backoff', async () => {
      const sendError = new Error('SMTP connection refused');
      mockProviderService.send.mockRejectedValueOnce(sendError);

      const job = makeJob(
        EmailJobType.SEND_WELCOME,
        'fail@example.com',
        { username: 'Fail', loginUrl: 'https://logiquest.app' },
        0, // first attempt
        3,
      ) as Job<EmailJobPayload>;

      await expect(processor.process(job)).rejects.toThrow('SMTP connection refused');
    });

    it('should also rethrow errors on the final attempt', async () => {
      mockProviderService.send.mockRejectedValueOnce(new Error('Final failure'));

      const job = makeJob(
        EmailJobType.SEND_WELCOME,
        'fail@example.com',
        { username: 'Fail', loginUrl: 'https://logiquest.app' },
        2, // third/final attempt
        3,
      ) as Job<EmailJobPayload>;

      await expect(processor.process(job)).rejects.toThrow('Final failure');
    });
  });
});
