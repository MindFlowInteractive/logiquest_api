import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Puzzle } from '../../puzzles/entities/puzzle.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Puzzle, (puzzle) => puzzle.category)
  puzzles!: Puzzle[];
}
