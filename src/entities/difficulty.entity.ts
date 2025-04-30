import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Puzzle } from './puzzle.entity';

@Entity('difficulties')
export class Difficulty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Puzzle, puzzle => puzzle.difficulty)
  puzzles: Puzzle[];
}