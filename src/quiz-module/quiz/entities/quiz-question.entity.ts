// File: src/quiz/entities/quiz-question.entity.ts
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
  } from 'typeorm';
  import { Quiz } from './quiz.entity';
  import { QuizAnswer } from './quiz-answer.entity';
  
  export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    SINGLE_CHOICE = 'single_choice',
    TRUE_FALSE = 'true_false',
    SHORT_ANSWER = 'short_answer',
    ESSAY = 'essay',
    MATCHING = 'matching',
    FILL_BLANK = 'fill_blank',
  }
  
  @Entity('quiz_questions')
  export class QuizQuestion {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'text' })
    questionText: string;
    
    @Column({ 
      type: 'enum', 
      enum: QuestionType, 
      default: QuestionType.MULTIPLE_CHOICE 
    })
    questionType: QuestionType;
  
    @Column({ type: 'int' })
    orderIndex: number;
  
    @Column({ type: 'int', default: 1 })
    points: number;
  
    @Column({ type: 'text', nullable: true })
    explanation: string;
  
    @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quiz_id' })
    quiz: Quiz;
  
    @Column({ name: 'quiz_id' })
    quizId: string;
  
    @OneToMany(() => QuizAnswer, (answer) => answer.question, { cascade: true })
    answers: QuizAnswer[];
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date;
  }
  