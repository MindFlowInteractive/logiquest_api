import { Module, Injectable } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository, IsNull } from 'typeorm';

import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { Score } from './entities/score.entity';
import { EventName } from '../events/events.enum';
import { ScoreUpdatedPayload } from '../events/event-payloads';
import { LeaderboardEntry } from '../leaderboard/entities/leaderboard-entry.entity';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Injectable()
export class ScoringListener {
  constructor(
    @InjectRepository(LeaderboardEntry)
    private readonly leaderboardRepo: Repository<LeaderboardEntry>,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @OnEvent(EventName.ScoreUpdated)
  async handleScoreUpdated(payload: ScoreUpdatedPayload) {
    const { newScore } = payload;
    const playerId = (payload as any).playerId || (payload as any).userId;

    if (!playerId) {
      console.warn('ScoreUpdated payload missing playerId');
      return;
    }
    let entry = await this.leaderboardRepo.findOne({ where: { playerId, category: IsNull() } });
    if (entry) {
      entry.totalScore = newScore;
      await this.leaderboardRepo.save(entry);
    } else {
      entry = this.leaderboardRepo.create({
        playerId,
        totalScore: newScore,
        category: null,
      });
      await this.leaderboardRepo.save(entry);
    }
  }
}

import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [TypeOrmModule.forFeature([Score, LeaderboardEntry]), LeaderboardModule],
  controllers: [ScoringController],
  providers: [ScoringService, ScoringListener],
  exports: [ScoringService],
})
export class ScoringModule {}
