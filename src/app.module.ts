import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppConfigModule } from './config/app-config.module';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './events/event.service';

import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { SecurityModule } from './security/security.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RewardsModule } from './rewards/rewards.module';
import { AchievementsModule } from './achievements/achievements.module';

import { ScoringModule } from './scoring/scoring.module';
import { HintsModule } from './hints/hints.module';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    EventEmitterModule.forRoot({ global: true }),

    AuthModule,
    AnalyticsModule,
    ScoringModule,
    AchievementsModule,
    RewardsModule,
    NotificationsModule,
    AdminModule,
    AuditModule,
    SecurityModule,

    // From feat/users-module
    UsersModule,
    SessionsModule,
    HintsModule,
  ],
  providers: [EventService],
})
export class AppModule {}
})
export class AppModule {}
