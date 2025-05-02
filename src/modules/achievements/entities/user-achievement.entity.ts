// user-achievement.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Achievement } from './achievement.entity';
import { User } from '../../../users/entities/user.entity';

@Entity('user_achievements')
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.achievements)
  user: User;

  @ManyToOne(() => Achievement, achievement => achievement.userAchievements)
  achievement: Achievement;

  @CreateDateColumn()
  awardedAt: Date;

  @Column({ default: false })
  isNotified: boolean;
}