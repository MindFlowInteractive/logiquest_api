// src/leaderboard/leaderboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { LeaderboardService } from './services/leaderboard.service';
import { LeaderboardRepository } from './repositories/leaderboard.repository';
import { LeaderboardEntryRepository } from './repositories/leaderboard-entry.repository';
import { LeaderboardSnapshotRepository } from './repositories/leaderboard-snapshot.repository';
import { Leaderboard } from './entities/leaderboard.entity';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { LeaderboardHistory } from './entities/leaderboard-history.entity';
import { LeaderboardSnapshot } from './entities/leaderboard-snapshot.entity';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Leaderboard,
      LeaderboardEntry,
      LeaderboardHistory,
      LeaderboardSnapshot,
    ]),
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        ttl: 300, // Default TTL: 5 minutes
      }),
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [LeaderboardController],
  providers: [
    LeaderboardService,
    LeaderboardRepository,
    LeaderboardEntryRepository,
    LeaderboardSnapshotRepository,
  ],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}