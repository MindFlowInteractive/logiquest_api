// File: src/quiz/entities/quiz-answer.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { QuizQuestion } from './quiz-question.entity';
  
  @Entity('quiz_answers')
  export class QuizAnswer {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'text' })
    answerText: string;
  
    @Column({ type: 'boolean', default: false })
    isCorrect: boolean;
  
    @Column({ type: 'text', nullable: true })
    explanation: string;
  
    @Column({ type: 'int' })
    orderIndex: number;
  
    @ManyToOne(() => QuizQuestion, (question) => question.answers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_id' })
    question: QuizQuestion;
  
    @Column({ name: 'question_id' })
    questionId: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date;
  }
  
  // File: src/quiz/entities/quiz-version.entity.ts
  import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { Quiz } from './quiz.entity';
  import { User } from '../../users/entities/user.entity';
  
  @Entity('quiz_versions')
  export class QuizVersion {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Quiz, quiz => quiz.versions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quiz_id' })
    quiz: Quiz;
  
    @Column({ name: 'quiz_id' })
    quizId: string;
  
    @Column()
    versionNumber: number;
  
    @Column({ type: 'jsonb' })
    content: Record<string, any>;
  
    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'modified_by' })
    modifiedBy: User;
  
    @Column({ name: 'modified_by', nullable: true })
    modifiedById: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  }