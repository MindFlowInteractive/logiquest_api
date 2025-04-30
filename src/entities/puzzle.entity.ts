import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, Index } from 'typeorm';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { Difficulty } from './difficulty.entity';
import { PuzzleVersion } from './puzzle-version.entity';
import { PuzzleTranslation } from './puzzle-translation.entity';
import { SolutionValidation } from './solution-validation.entity';

@Entity('puzzles')
@Index(['categoryId', 'isActive'])
@Index(['difficultyId', 'isActive'])
export class Puzzle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, category => category.puzzles)
  category: Category;

  @Column({ name: 'difficulty_id' })
  difficultyId: number;

  @ManyToOne(() => Difficulty, difficulty => difficulty.puzzles)
  difficulty: Difficulty;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  totalSolves: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  currentVersion: number;

  @ManyToMany(() => Tag, tag => tag.puzzles)
  @JoinTable({
    name: 'puzzle_tags',
    joinColumn: { name: 'puzzle_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
  tags: Tag[];

  @OneToMany(() => PuzzleVersion, version => version.puzzle)
  versions: PuzzleVersion[];

  @OneToMany(() => PuzzleTranslation, translation => translation.puzzle)
  translations: PuzzleTranslation[];

  @OneToMany(() => SolutionValidation, validation => validation.puzzle)
  solutionValidations: SolutionValidation[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

// src/entities/puzzle-version.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Puzzle } from './puzzle.entity';

@Entity('puzzle_versions')
@Index(['puzzleId', 'versionNumber'])
export class PuzzleVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'puzzle_id' })
  puzzleId: string;

  @ManyToOne(() => Puzzle, puzzle => puzzle.versions)
  puzzle: Puzzle;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  changeNotes: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'created_by', length: 255, nullable: true })
  createdBy: string;
}
