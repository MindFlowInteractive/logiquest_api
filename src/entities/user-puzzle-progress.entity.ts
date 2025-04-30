import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('user_puzzle_progress')
@Index(['userId', 'puzzleId'], { unique: true })
export class UserPuzzleProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'puzzle_id' })
  puzzleId: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'int', nullable: true })
  attemptCount: number;

  @Column({ type: 'jsonb', nullable: true })
  currentProgress: Record<string, any>;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  userRating: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
