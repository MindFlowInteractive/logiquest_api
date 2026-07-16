import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';

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

  @ManyToMany(() => Tag, (tag) => tag.puzzles)
  @JoinTable({
    name: 'puzzle_tags',
    joinColumn: { name: 'puzzleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  @CreateDateColumn()
  createdAt!: Date;
}
