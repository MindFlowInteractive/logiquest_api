// src/leaderboard/entities/leaderboard-entry.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('leaderboard_entry')
@Index(['playerId', 'category'], { unique: true })
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string; // reference to User.id

  @Column({ nullable: true })
  category: string; // e.g., 'logic', null for global

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date; // earliest score achievement used for tie‑breaking

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
