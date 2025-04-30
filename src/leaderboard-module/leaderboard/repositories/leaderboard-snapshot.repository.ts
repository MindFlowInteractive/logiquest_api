// src/leaderboard/repositories/leaderboard-snapshot.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { LeaderboardSnapshot } from '../entities/leaderboard-snapshot.entity';

@Injectable()
export class LeaderboardSnapshotRepository extends Repository<LeaderboardSnapshot> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(LeaderboardSnapshot, dataSource.createEntityManager());
  }

  async createSnapshot(
    leaderboardId: string, 
    data: Record<string, any>[], 
    snapshotType: 'daily' | 'weekly' | 'monthly' | 'manual'
  ): Promise<LeaderboardSnapshot> {
    const snapshot = this.create({
      leaderboardId,
      snapshotDate: new Date(),
      data,
      snapshotType,
    });

    return this.save(snapshot);
  }

  async findLatestSnapshot(
    leaderboardId: string,
    snapshotType?: 'daily' | 'weekly' | 'monthly' | 'manual'
  ): Promise<LeaderboardSnapshot | null> {
    const queryBuilder = this.createQueryBuilder('snapshot')
      .where('snapshot.leaderboardId = :leaderboardId', { leaderboardId })
      .orderBy('snapshot.snapshotDate', 'DESC')
      .limit(1);

    if (snapshotType) {
      queryBuilder.andWhere('snapshot.snapshotType = :snapshotType', { snapshotType });
    }

    return queryBuilder.getOne();
  }
}