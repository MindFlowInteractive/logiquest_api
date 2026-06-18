import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppConfigModule } from './config/app-config.module';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './events/event.service';
import { ScoringModule } from './scoring/scoring.module';
import { AchievementsModule } from './achievements/achievements.module';
import { RewardsModule } from './rewards/rewards.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { SecurityModule } from './security/security.module';
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
    AuthModule,
    AnalyticsModule,
    EventEmitterModule.forRoot({ global: true }),
    ScoringModule,
    AchievementsModule,
    RewardsModule,
    NotificationsModule,
    AdminModule,
    AuditModule,
    SecurityModule,
    SessionsModule,
  ],
  providers: [EventService],
})
export class AppModule {}
