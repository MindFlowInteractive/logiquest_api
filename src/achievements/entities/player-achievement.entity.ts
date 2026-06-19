import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Achievement } from './achievement.entity';

@Entity('player_achievements')
@Unique(['userId', 'achievementId'])
export class PlayerAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  achievementId: string;

  @ManyToOne(() => Achievement)
  @JoinColumn({ name: 'achievementId' })
  achievement: Achievement;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  unlockedAt: Date;
}
