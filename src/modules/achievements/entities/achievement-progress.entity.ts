// achievement-progress.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('achievement_progress')
export class AchievementProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.achievementProgresses)
  user: User;

  @Column()
  achievementType: string;

  @Column('json')
  progressData: Record<string, any>;

  @Column({ default: 0 })
  currentValue: number;

  @Column()
  targetValue: number;

  @Column({ default: 0 })
  percentageComplete: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}