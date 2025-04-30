// src/leaderboard/entities/leaderboard-snapshot.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    Index,
  } from 'typeorm';
  import { Leaderboard } from './leaderboard.entity';
  
  @Entity('leaderboard_snapshots')
  export class LeaderboardSnapshot {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    @Index()
    leaderboardId: string;
  
    @ManyToOne(() => Leaderboard, (leaderboard) => leaderboard.snapshots, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'leaderboardId' })
    leaderboard: Leaderboard;
  
    @Column({ type: 'date' })
    @Index()
    snapshotDate: Date;
  
    @Column({ type: 'jsonb' })
    data: Record<string, any>[];
  
    @Column({ type: 'enum', enum: ['daily', 'weekly', 'monthly', 'manual'] })
    snapshotType: string;
  
    @CreateDateColumn()
    createdAt: Date;
  }