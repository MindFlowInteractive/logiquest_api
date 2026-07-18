import { Module, Injectable } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from '../events/events.enum';
import { SessionCompletedPayload } from '../events/event-payloads';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsListener {
  @OnEvent(EventName.SessionCompleted)
  async handleSessionCompleted(payload: SessionCompletedPayload) {
    console.log('NotificationsListener received SessionCompleted:', payload);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationsService, NotificationsListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
