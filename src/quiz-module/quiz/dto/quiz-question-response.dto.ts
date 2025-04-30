// File: src/quiz/dto/quiz-question-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { QuizQuestion, QuestionType } from '../entities/quiz-question.entity';
import { QuizAnswerResponseDto } from './quiz-answer-response.dto';

@Exclude()
export class QuizQuestionResponseDto {
  @Expose()
  id: string;

  @Expose()
  questionText: string;

  @Expose()
  questionType: QuestionType;

  @Expose()
  orderIndex: number;

  @Expose()
  points: number;

  @Expose()
  explanation: string;

  @Expose()
  @Type(() => QuizAnswerResponseDto)
  answers: QuizAnswerResponseDto[];

  constructor(partial: Partial<QuizQuestion>) {
    Object.assign(this, partial);
  }
}