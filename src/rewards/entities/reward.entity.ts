import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

export enum RewardType {
  STELLA = 'stella',
}

@Entity('reward')
@Index(['sessionId'], { unique: true })
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'session_id' })
  sessionId: string; // corresponds to puzzle instance id

  @Column({ type: 'enum', enum: RewardType, default: RewardType.STELLA })
  type: RewardType;

  @Column({ type: 'int' })
  amount: number;

  @CreateDateColumn({ name: 'granted_at' })
  grantedAt: Date;
}
