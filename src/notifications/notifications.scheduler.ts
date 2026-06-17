import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  constructor(private readonly service: NotificationsService) {}

  // Runs daily at 02:00 am
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCleanup() {
    await this.service.cleanupOld();
  }
}
