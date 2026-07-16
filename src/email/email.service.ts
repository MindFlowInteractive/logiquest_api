import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  EMAIL_QUEUE,
  EmailJobType,
  MAX_EMAIL_RETRIES,
} from './constants/email.constants';
import {
  WelcomeEmailContext,
  PasswordResetEmailContext,
  AchievementUnlockedEmailContext,
  WeeklySummaryEmailContext,
  EmailJobPayload,
} from './interfaces/email.interfaces';

/**
 * EmailService exposes a simple API to queue transactional emails.
 * The actual sending is handled by EmailProcessor asynchronously.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue<EmailJobPayload>,
  ) {}

  async sendWelcome(to: string, context: WelcomeEmailContext): Promise<void> {
    await this.enqueue(to, EmailJobType.SEND_WELCOME, context as unknown as Record<string, unknown>);
  }

  async sendPasswordReset(
    to: string,
    context: PasswordResetEmailContext,
  ): Promise<void> {
    await this.enqueue(to, EmailJobType.SEND_PASSWORD_RESET, context as unknown as Record<string, unknown>);
  }

  async sendAchievementUnlocked(
    to: string,
    context: AchievementUnlockedEmailContext,
  ): Promise<void> {
    await this.enqueue(to, EmailJobType.SEND_ACHIEVEMENT_UNLOCKED, context as unknown as Record<string, unknown>);
  }

  async sendWeeklySummary(
    to: string,
    context: WeeklySummaryEmailContext,
  ): Promise<void> {
    await this.enqueue(to, EmailJobType.SEND_WEEKLY_SUMMARY, context as unknown as Record<string, unknown>);
  }

  async sendTestEmail(to: string): Promise<void> {
    await this.enqueue(to, EmailJobType.SEND_TEST, {
      timestamp: new Date().toISOString(),
    });
  }

  private async enqueue(
    to: string,
    type: EmailJobType,
    context: Record<string, unknown>,
  ): Promise<void> {
    const payload: EmailJobPayload = { to, type, context };
    await this.emailQueue.add(type, payload, {
      attempts: MAX_EMAIL_RETRIES,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5 s base → 5 s, 10 s, 20 s
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
    this.logger.log(`Queued email job "${type}" to ${to}`);
  }
}
