import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from '../events/events.enum';
import { SessionCompletedPayload } from '../events/event-payloads';
import { AchievementsService } from './achievements.service';

@Injectable()
export class AchievementsListener {
  constructor(private readonly service: AchievementsService) {}

  @OnEvent(EventName.SessionCompleted)
  async handleSessionCompleted(payload: SessionCompletedPayload) {
    // Pass the payload to the service for evaluation.
    await this.service.evaluate(payload.userId, payload as any);
  }
}
