// src/analytics/analytics.module.ts
import { Module, CacheModule } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60, // default 60 seconds, can be configured via env later
      isGlobal: false,
    }),
    TypeOrmModule.forFeature([Session]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
