import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsService } from './sessions.service';

@Injectable()
export class SessionsScheduler {
  private readonly logger = new Logger(SessionsScheduler.name);

  constructor(private readonly sessionsService: SessionsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoAbandon(): Promise<void> {
    const count = await this.sessionsService.autoAbandonStaleSessions();
    if (count > 0) {
      this.logger.log(`Auto-abandoned ${count} stale session(s)`);
    }
  }
}
