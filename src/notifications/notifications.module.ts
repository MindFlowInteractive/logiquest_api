import { Module, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from '../events/events.enum';
import { SessionCompletedPayload } from '../events/event-payloads';

@Injectable()
export class NotificationsListener {
  @OnEvent(EventName.SessionCompleted)
  async handleSessionCompleted(payload: SessionCompletedPayload) {
    console.log('NotificationsListener received SessionCompleted:', payload);
  }
}

@Module({
  providers: [NotificationsListener],
})
export class NotificationsModule {}
