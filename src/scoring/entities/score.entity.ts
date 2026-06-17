import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  sessionId: string;

  @Column()
  puzzleId: string;

  @Column({ type: 'int' })
  baseScore: number;

  @Column({ type: 'int', default: 0 })
  timeBonus: number;

  @Column({ type: 'int', default: 0 })
  hintPenalty: number;

  @Column({ type: 'int' })
  finalScore: number;

  @CreateDateColumn()
  createdAt: Date;
}
