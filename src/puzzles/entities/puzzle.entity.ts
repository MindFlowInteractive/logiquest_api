import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('puzzles')
export class Puzzle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  difficulty!: string;

  @ManyToOne(() => Category, (category) => category.puzzles, { nullable: true, onDelete: 'SET NULL' })
  category!: Category | null;

  @Column({ type: 'json', nullable: true })
  conditions!: any;

  @Column({ type: 'json', nullable: true })
  effects!: any;

  @Column()
  authorId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
