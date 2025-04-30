// src/leaderboard/repositories/leaderboard.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Leaderboard, ResetPeriod } from '../entities/leaderboard.entity';
import { LeaderboardEntry } from '../entities/leaderboard-entry.entity';
import { startOfDay, startOfWeek, startOfMonth, addDays, addWeeks, addMonths } from 'date-fns';

@Injectable()
export class LeaderboardRepository extends Repository<Leaderboard> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Leaderboard, dataSource.createEntityManager());
  }

  async findActiveLeaderboards(page = 1, limit = 10, category?: string): Promise<[Leaderboard[], number]> {
    const queryBuilder = this.createQueryBuilder('leaderboard')
      .where('leaderboard.isActive = :isActive', { isActive: true })
      .andWhere('leaderboard.isArchived = :isArchived', { isArchived: false });

    if (category) {
      queryBuilder.andWhere('leaderboard.category = :category', { category });
    }

    queryBuilder
      .orderBy('leaderboard.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }

  async scheduleLeaderboardResets(): Promise<void> {
    const now = new Date();
    const tomorrow = addDays(now, 1);
    const nextWeek = addWeeks(now, 1);
    const nextMonth = addMonths(now, 1);

    // Daily resets
    await this.update(
      {
        resetPeriod: ResetPeriod.DAILY,
        isActive: true,
        nextResetDate: LessThanOrEqual(now),
      },
      {
        lastResetDate: now,
        nextResetDate: startOfDay(tomorrow),
      }
    );

    // Weekly resets
    await this.update(
      {
        resetPeriod: ResetPeriod.WEEKLY,
        isActive: true,
        nextResetDate: LessThanOrEqual(now),
      },
      {
        lastResetDate: now,
        nextResetDate: startOfWeek(nextWeek),
      }
    );

    // Monthly resets
    await this.update(
      {
        resetPeriod: ResetPeriod.MONTHLY,
        isActive: true,
        nextResetDate: LessThanOrEqual(now),
      },
      {
        lastResetDate: now,
        nextResetDate: startOfMonth(nextMonth),
      }
    );
  }
}