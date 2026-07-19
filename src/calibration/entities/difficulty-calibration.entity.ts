import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Puzzle } from '../../puzzles/entities/puzzle.entity';

export enum CalibrationStatus {
  PENDING = 'pending',
  APPLIED = 'applied',
  DISMISSED = 'dismissed',
}

@Entity('difficulty_calibrations')
export class DifficultyCalibration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => Puzzle, { onDelete: 'CASCADE' })
  puzzle!: Puzzle;

  @Column()
  puzzleId!: string;

  @Column({ type: 'int', default: 0 })
  totalSessions!: number;

  @Column({ type: 'int', default: 0 })
  completedSessions!: number;

  @Column({ type: 'int', default: 0 })
  abandonedSessions!: number;

  @Column({ type: 'float', default: 0 })
  solveRate!: number;

  @Column({ type: 'float', default: 0 })
  abandonRate!: number;

  @Column({ type: 'float', default: 0 })
  avgDurationSeconds!: number;

  @Column({ type: 'float', default: 0 })
  avgHintsUsed!: number;

  @Column({ type: 'float', default: 0 })
  calibrationScore!: number;

  @Column()
  currentDifficulty!: string;

  @Column()
  recommendedDifficulty!: string;

  @Column({
    type: 'enum',
    enum: CalibrationStatus,
    default: CalibrationStatus.PENDING,
  })
  status!: CalibrationStatus;

  @CreateDateColumn()
  evaluatedAt!: Date;
}
