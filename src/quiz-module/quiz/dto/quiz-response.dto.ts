// File: src/quiz/dto/quiz-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { Quiz, DifficultyLevel, QuizStatus } from '../entities/quiz.entity';
import { QuizQuestionResponseDto } from './quiz-question-response.dto';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

@Exclude()
export class QuizResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  difficultyLevel: DifficultyLevel;

  @Expose()
  status: QuizStatus;

  @Expose()
  isPublic: boolean;

  @Expose()
  timeLimit: number;

  @Expose()
  passPercentage: number;

  @Expose()
  creatorId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  version: number;

  @Expose()
  @Type(() => QuizQuestionResponseDto)
  questions: QuizQuestionResponseDto[];

  @Expose()
  @Type(() => CategoryResponseDto)
  categories: CategoryResponseDto[];

  constructor(partial: Partial<Quiz>) {
    Object.assign(this, partial);
  }
}
