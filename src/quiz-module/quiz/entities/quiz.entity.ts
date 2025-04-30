// File: src/quiz/entities/quiz.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
    ManyToMany,
    JoinTable,
    VersionColumn,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  import { Category } from '../../categories/entities/category.entity';
  import { QuizQuestion } from './quiz-question.entity';
  import { QuizVersion } from './quiz-version.entity';
  
  export enum DifficultyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert',
  }
  
  export enum QuizStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
  }
  
  @Entity('quizzes')
  export class Quiz {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 255 })
    title: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({
      type: 'enum',
      enum: DifficultyLevel,
      default: DifficultyLevel.INTERMEDIATE,
    })
    difficultyLevel: DifficultyLevel;
  
    @Column({
      type: 'enum',
      enum: QuizStatus,
      default: QuizStatus.DRAFT,
    })
    status: QuizStatus;
  
    @Column({ type: 'boolean', default: false })
    isPublic: boolean;
  
    @Column({ type: 'int', default: 0 })
    timeLimit: number; // Time limit in seconds, 0 means no limit
  
    @Column({ type: 'int', default: 0 })
    passPercentage: number; // Percentage needed to pass the quiz
  
    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'creator_id' })
    creator: User;
  
    @Column({ name: 'creator_id', nullable: true })
    creatorId: string;
  
    @ManyToMany(() => Category)
    @JoinTable({
      name: 'quiz_categories',
      joinColumn: { name: 'quiz_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
    })
    categories: Category[];
  
    @OneToMany(() => QuizQuestion, (question) => question.quiz, { cascade: true })
    questions: QuizQuestion[];
  
    @OneToMany(() => QuizVersion, (version) => version.quiz)
    versions: QuizVersion[];
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;
  
    @VersionColumn()
    version: number;
  }