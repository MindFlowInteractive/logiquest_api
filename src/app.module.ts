import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventService } from './events/event.service';
import { ScoringModule } from './scoring/scoring.module';
import { AchievementsModule } from './achievements/achievements.module';
import { RewardsModule } from './rewards/rewards.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // global: true ensures EventEmitter2 is available app-wide
      global: true,
    }),
    ScoringModule,
    AchievementsModule,
    RewardsModule,
    NotificationsModule,
  ],
  providers: [EventService],
})
export class AppModule {}
