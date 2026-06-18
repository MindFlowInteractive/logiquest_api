import { Module, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from '../events/events.enum';
import { AchievementUnlockedPayload } from '../events/event-payloads';

@Injectable()
export class AchievementsListener {
  @OnEvent(EventName.AchievementUnlocked)
  async handleAchievementUnlocked(payload: AchievementUnlockedPayload) {
    console.log('AchievementsListener received AchievementUnlocked:', payload);
  }
}

@Module({
  providers: [AchievementsListener],
})
export class AchievementsModule {}
