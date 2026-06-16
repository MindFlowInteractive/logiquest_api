import { Module, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from '../events/events.enum';
import { ScoreUpdatedPayload } from '../events/event-payloads';

@Injectable()
export class ScoringListener {
  @OnEvent(EventName.ScoreUpdated)
  async handleScoreUpdated(payload: ScoreUpdatedPayload) {
    // Placeholder implementation
    console.log('ScoringListener received ScoreUpdated:', payload);
  }
}

@Module({
  providers: [ScoringListener],
})
export class ScoringModule {}
