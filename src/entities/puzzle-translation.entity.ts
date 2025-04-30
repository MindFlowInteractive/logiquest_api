import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Puzzle } from './puzzle.entity';

@Entity('puzzle_translations')
@Index(['puzzleId', 'languageCode'])
export class PuzzleTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'puzzle_id' })
  puzzleId: string;

  @ManyToOne(() => Puzzle, puzzle => puzzle.translations)
  puzzle: Puzzle;

  @Column({ name: 'language_code', length: 10 })
  languageCode: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'translator_id', nullable: true })
  translatorId: string;
}