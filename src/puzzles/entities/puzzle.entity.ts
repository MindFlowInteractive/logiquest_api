import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}


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

  @Column({ type: 'enum', enum: SubmissionStatus, default: SubmissionStatus.APPROVED })
  submissionStatus!: SubmissionStatus;

  @Column({ nullable: true })
  rejectionReason!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
