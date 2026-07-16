import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE, EmailJobType } from './constants/email.constants';
import { EmailJobPayload } from './interfaces/email.interfaces';
import { EmailTemplateService } from './email-template.service';
import { EmailProviderService } from './email-provider.service';

const SUBJECT_MAP: Record<EmailJobType, string> = {
  [EmailJobType.SEND_WELCOME]: '🧩 Welcome to LogiQuest!',
  [EmailJobType.SEND_PASSWORD_RESET]: '🔒 Reset Your LogiQuest Password',
  [EmailJobType.SEND_ACHIEVEMENT_UNLOCKED]: '🏆 Achievement Unlocked!',
  [EmailJobType.SEND_WEEKLY_SUMMARY]: '📊 Your Weekly LogiQuest Summary',
  [EmailJobType.SEND_TEST]: '✅ LogiQuest Test Email',
};

const TEMPLATE_MAP: Record<EmailJobType, string> = {
  [EmailJobType.SEND_WELCOME]: 'welcome',
  [EmailJobType.SEND_PASSWORD_RESET]: 'password-reset',
  [EmailJobType.SEND_ACHIEVEMENT_UNLOCKED]: 'achievement-unlocked',
  [EmailJobType.SEND_WEEKLY_SUMMARY]: 'weekly-summary',
  [EmailJobType.SEND_TEST]: 'test',
};

/**
 * EmailProcessor consumes jobs from the email queue and sends them.
 * BullMQ handles retry logic (3 attempts, exponential backoff) automatically
 * based on the job options set in EmailService.enqueue().
 */
@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly templateService: EmailTemplateService,
    private readonly providerService: EmailProviderService,
  ) {
    super();
  }

  async process(job: Job<EmailJobPayload>): Promise<void> {
    const { to, type, context } = job.data;
    this.logger.log(
      `Processing email job "${type}" (id=${job.id}, attempt=${job.attemptsMade + 1}) → ${to}`,
    );

    try {
      const templateName = TEMPLATE_MAP[type];
      const subject = SUBJECT_MAP[type];
      const html = this.templateService.compile(templateName, context);

      await this.providerService.send({ to, subject, html });
      this.logger.log(`Email job "${type}" delivered to ${to}`);
    } catch (error) {
      const remaining = (job.opts.attempts ?? 1) - (job.attemptsMade + 1);
      this.logger.error(
        `Email job "${type}" failed (${remaining} retries remaining): ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Re-throwing causes BullMQ to retry based on job.opts.attempts + backoff
      throw error;
    }
  }
}
