// src/leaderboard/entities/leaderboard-history.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
  } from 'typeorm';
  
  @Entity('leaderboard_history')
  export class LeaderboardHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    @Index()
    leaderboardId: string;
  
    @Column({ type: 'uuid' })
    @Index()
    userId: string;
  
    @Column({ type: 'float' })
    score: number;
  
    @Column()
    rank: number;
  
    @Column({ type: 'float' })
    percentile: number;
  
    @Column({ type: 'date' })
    @Index()
    recordDate: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  }