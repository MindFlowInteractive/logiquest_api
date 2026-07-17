// src/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60, // default 60 seconds, can be configured via env later
      isGlobal: false,
    }),
    SessionsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
