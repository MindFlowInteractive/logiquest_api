// src/leaderboard/repositories/leaderboard-entry.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource, Between, LessThan, MoreThan } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { LeaderboardEntry } from '../entities/leaderboard-entry.entity';
import { ScoringModel } from '../entities/leaderboard.entity';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

@Injectable()
export class LeaderboardEntryRepository extends Repository<LeaderboardEntry> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(LeaderboardEntry, dataSource.createEntityManager());
  }

  async findTopRankings(
    leaderboardId: string,
    limit: number,
    scoringModel: ScoringModel,
    fromDate?: Date
  ): Promise<LeaderboardEntry[]> {
    const queryBuilder = this.createQueryBuilder('entry')
      .where('entry.leaderboardId = :leaderboardId', { leaderboardId });

    if (fromDate) {
      queryBuilder.andWhere('entry.createdAt >= :fromDate', { fromDate });
    }

    // Order by score based on scoring model
    if (scoringModel === ScoringModel.HIGHEST_SCORE || scoringModel === ScoringModel.HIGHEST_ACCURACY) {
      queryBuilder.orderBy('entry.score', 'DESC');
    } else {
      // For FASTEST_COMPLETION and LOWEST_ATTEMPTS, lower is better
      queryBuilder.orderBy('entry.score', 'ASC');
    }

    return queryBuilder.take(limit).getMany();
  }

  async findUserPosition(
    leaderboardId: string,
    userId: string,
    scoringModel: ScoringModel
  ): Promise<{ rank: number; percentile: number; total: number }> {
    const entry = await this.findOne({
      where: { leaderboardId, userId }
    });

    if (!entry) {
      return { rank: 0, percentile: 0, total: 0 };
    }

    const total = await this.count({ where: { leaderboardId } });
    
    // No need to calculate if there's only one entry or no entries
    if (total <= 1) {
      return { rank: 1, percentile: 100, total };
    }

    const queryBuilder = this.createQueryBuilder('entry')
      .where('entry.leaderboardId = :leaderboardId', { leaderboardId });

    // Count entries with better scores
    if (scoringModel === ScoringModel.HIGHEST_SCORE || scoringModel === ScoringModel.HIGHEST_ACCURACY) {
      queryBuilder.andWhere('entry.score > :score', { score: entry.score });
    } else {
      // For FASTEST_COMPLETION and LOWEST_ATTEMPTS, lower is better
      queryBuilder.andWhere('entry.score < :score', { score: entry.score });
    }

    const betterScores = await queryBuilder.getCount();
    const rank = betterScores + 1; // +1 because rank starts at 1
    const percentile = ((total - rank) / total) * 100;

    return { rank, percentile, total };
  }

  async findRankingsAroundUser(
    leaderboardId: string,
    userId: string,
    scoringModel: ScoringModel,
    range: number = 5
  ): Promise<LeaderboardEntry[]> {
    // First, get the user's current rank
    const { rank } = await this.findUserPosition(leaderboardId, userId, scoringModel);
    
    if (rank === 0) {
      return [];
    }

    // Calculate the range of ranks to retrieve
    const startRank = Math.max(1, rank - range);
    const endRank = rank + range;

    // Get entries within the rank range
    const entries = await this.createQueryBuilder('entry')
      .where('entry.leaderboardId = :leaderboardId', { leaderboardId })
      .orderBy(
        scoringModel === ScoringModel.HIGHEST_SCORE || scoringModel === ScoringModel.HIGHEST_ACCURACY 
          ? 'entry.score DESC' 
          : 'entry.score ASC'
      )
      .skip(startRank - 1)
      .take(range * 2 + 1)
      .getMany();

    return entries;
  }

  async updateRankings(leaderboardId: string, scoringModel: ScoringModel): Promise<void> {
    // Get all entries for this leaderboard ordered by score
    const orderDirection = 
      scoringModel === ScoringModel.HIGHEST_SCORE || scoringModel === ScoringModel.HIGHEST_ACCURACY
        ? 'DESC'
        : 'ASC';

    const entries = await this.createQueryBuilder('entry')
      .where('entry.leaderboardId = :leaderboardId', { leaderboardId })
      .orderBy('entry.score', orderDirection)
      .getMany();

    const total = entries.length;

    // Update ranks and percentiles
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const rank = i + 1;
      const percentile = ((total - rank) / total) * 100;

      await this.update(entry.id, { rank, percentile });
    }
  }
}

