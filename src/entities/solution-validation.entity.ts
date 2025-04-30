import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Puzzle } from './puzzle.entity';

@Entity('solution_validations')
@Index(['puzzleId'])
export class SolutionValidation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'puzzle_id' })
  puzzleId: string;

  @ManyToOne(() => Puzzle, puzzle => puzzle.solutionValidations)
  puzzle: Puzzle;

  @Column({ type: 'enum', enum: ['TEXT', 'MULTIPLE_CHOICE', 'PATTERN', 'EXACT_MATCH', 'CUSTOM'] })
  validationType: 'TEXT' | 'MULTIPLE_CHOICE' | 'PATTERN' | 'EXACT_MATCH' | 'CUSTOM';

  @Column({ type: 'jsonb' })
  validationData: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
