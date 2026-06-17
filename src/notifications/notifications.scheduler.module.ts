import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsScheduler } from './notifications.scheduler';

@Module({
  providers: [NotificationsScheduler, NotificationsService],
})
export class NotificationsSchedulerModule {}
