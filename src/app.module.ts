import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { EventService } from './events/event.service';
import { ScoringModule } from './scoring/scoring.module';
import { AchievementsModule } from './achievements/achievements.module';
import { RewardsModule } from './rewards/rewards.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRY: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
    }),
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
