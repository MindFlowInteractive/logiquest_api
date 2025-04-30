// src/leaderboard/entities/leaderboard.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
  } from 'typeorm';
  import { LeaderboardEntry } from './leaderboard-entry.entity';
  import { LeaderboardSnapshot } from './leaderboard-snapshot.entity';
  
  export enum ScoringModel {
    HIGHEST_SCORE = 'highest_score',
    FASTEST_COMPLETION = 'fastest_completion',
    LOWEST_ATTEMPTS = 'lowest_attempts',
    HIGHEST_ACCURACY = 'highest_accuracy',
  }
  
  export enum ResetPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    NEVER = 'never',
  }
  
  @Entity('leaderboards')
  export class Leaderboard {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 100 })
    @Index()
    name: string;
  
    @Column({ length: 500, nullable: true })
    description: string;
  
    @Column({ type: 'enum', enum: ScoringModel, default: ScoringModel.HIGHEST_SCORE })
    scoringModel: ScoringModel;
  
    @Column({ type: 'enum', enum: ResetPeriod, default: ResetPeriod.NEVER })
    resetPeriod: ResetPeriod;
  
    @Column({ length: 50, nullable: true })
    @Index()
    category: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column({ default: false })
    isPublic: boolean;
  
    @Column({ default: false })
    isArchived: boolean;
  
    @Column({ type: 'jsonb', default: {} })
    metadata: Record<string, any>;
  
    @Column({ default: 100 })
    maxEntries: number;
  
    @Column({ default: 1 })
    entryLimitPerUser: number;
  
    @Column({ default: 0 })
    minimumScoreThreshold: number;
  
    @Column({ nullable: true })
    lastResetDate: Date;
  
    @Column({ nullable: true })
    nextResetDate: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @OneToMany(() => LeaderboardEntry, (entry) => entry.leaderboard)
    entries: LeaderboardEntry[];
  
    @OneToMany(() => LeaderboardSnapshot, (snapshot) => snapshot.leaderboard)
    snapshots: LeaderboardSnapshot[];
  }
  
 