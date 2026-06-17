// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

export interface PuzzleAnalyticsDto {
  solveRate: number; // fraction of completed attempts
  averageTime: number; // seconds
  averageScore: number;
  hintUsageRate: number; // average hints per attempt
}

export interface PlayerAnalyticsDto {
  sessionsPlayed: number;
  puzzlesSolved: number;
  averageScore: number;
}

export interface OverviewAnalyticsDto {
  totalSessions: number;
  totalCompleted: number;
  overallSolveRate: number;
  overallAverageTime: number;
  overallAverageScore: number;
  overallHintUsageRate: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  // Helper to apply optional date range filtering
  private applyDateFilters(
    qb: ReturnType<Repository<Session>['createQueryBuilder']>,
    query: AnalyticsQueryDto,
  ) {
    if (query.from) {
      qb.andWhere('session.completedAt >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('session.completedAt <= :to', { to: query.to });
    }
    return qb;
  }

  async getPuzzleAnalytics(
    puzzleId: string,
    query: AnalyticsQueryDto,
  ): Promise<PuzzleAnalyticsDto> {
    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .where('session.puzzleId = :puzzleId', { puzzleId });
    this.applyDateFilters(qb, query);
    const sessions = await qb.getMany();
    const total = sessions.length;
    const completed = sessions.filter((s) => s.completed);
    const completedCount = completed.length;

    const solveRate = total ? completedCount / total : 0;
    const averageTime = completedCount
      ? completed.reduce((sum, s) => sum + s.duration, 0) / completedCount
      : 0;
    const averageScore = completedCount
      ? completed.reduce((sum, s) => sum + s.score, 0) / completedCount
      : 0;
    const hintUsageRate = total
      ? sessions.reduce((sum, s) => sum + s.hintsUsed, 0) / total
      : 0;

    return {
      solveRate,
      averageTime,
      averageScore,
      hintUsageRate,
    };
  }

  async getPlayerAnalytics(
    userId: string,
    query: AnalyticsQueryDto,
  ): Promise<PlayerAnalyticsDto> {
    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId });
    this.applyDateFilters(qb, query);
    const sessions = await qb.getMany();
    const total = sessions.length;
    const completed = sessions.filter((s) => s.completed);
    const completedCount = completed.length;

    const averageScore = completedCount
      ? completed.reduce((sum, s) => sum + s.score, 0) / completedCount
      : 0;

    return {
      sessionsPlayed: total,
      puzzlesSolved: completedCount,
      averageScore,
    };
  }

  async getOverview(query: AnalyticsQueryDto): Promise<OverviewAnalyticsDto> {
    const qb = this.sessionRepo.createQueryBuilder('session');
    this.applyDateFilters(qb, query);
    const sessions = await qb.getMany();
    const total = sessions.length;
    const completed = sessions.filter((s) => s.completed);
    const completedCount = completed.length;

    const overallSolveRate = total ? completedCount / total : 0;
    const overallAverageTime = completedCount
      ? completed.reduce((sum, s) => sum + s.duration, 0) / completedCount
      : 0;
    const overallAverageScore = completedCount
      ? completed.reduce((sum, s) => sum + s.score, 0) / completedCount
      : 0;
    const overallHintUsageRate = total
      ? sessions.reduce((sum, s) => sum + s.hintsUsed, 0) / total
      : 0;

    return {
      totalSessions: total,
      totalCompleted: completedCount,
      overallSolveRate,
      overallAverageTime,
      overallAverageScore,
      overallHintUsageRate,
    };
  }
}
