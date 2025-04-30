 // src/leaderboard/entities/leaderboard-entry.entity.ts
 import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index,
    Check,
    Unique,
  } from 'typeorm';
  import { Leaderboard } from './leaderboard.entity';
  
  @Entity('leaderboard_entries')
  @Unique(['leaderboardId', 'userId']) // A user can have only one entry per leaderboard
  @Check('"score" >= 0') // Score must be non-negative
  export class LeaderboardEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    @Index()
    leaderboardId: string;
  
    @ManyToOne(() => Leaderboard, (leaderboard) => leaderboard.entries, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'leaderboardId' })
    leaderboard: Leaderboard;
  
    @Column({ type: 'uuid' })
    @Index()
    userId: string;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    username: string;
  
    @Column({ type: 'float' })
    score: number;
  
    @Column({ default: 0 })
    rank: number;
  
    @Column({ type: 'float', default: 0 })
    percentile: number;
  
    @Column({ type: 'jsonb', default: {} })
    metadata: Record<string, any>;
    
    @Column({ nullable: true })
    completionTime: number; // In milliseconds, for time-based scoring
  
    @Column({ default: false })
    isVerified: boolean;
  
    @Column({ nullable: true })
    verifiedAt: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }