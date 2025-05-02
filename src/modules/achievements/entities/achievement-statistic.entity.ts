// achievement-statistic.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Achievement } from './achievement.entity';

@Entity('achievement_statistics')
export class AchievementStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Achievement)
  achievement: Achievement;

  @Column({ default: 0 })
  totalAwarded: number;

  @Column({ default: 0 })
  percentageOfUsersAwarded: number;

  @Column({ type: 'float', default: 0 })
  averageTimeToComplete: number; // in days

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}