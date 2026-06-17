import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppConfigModule } from './config/app-config.module';
import { EventService } from './events/event.service';
import { ScoringModule } from './scoring/scoring.module';
import { AchievementsModule } from './achievements/achievements.module';
import { RewardsModule } from './rewards/rewards.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AppConfigModule,
    EventEmitterModule.forRoot({
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
