
// File: src/quiz/dto/quiz-answer-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { QuizAnswer } from '../entities/quiz-answer.entity';

@Exclude()
export class QuizAnswerResponseDto {
  @Expose()
  id: string;

  @Expose()
  answerText: string;

  @Expose()
  isCorrect: boolean;

  @Expose()
  explanation: string;

  @Expose()
  orderIndex: number;

  constructor(partial: Partial<QuizAnswer>) {
    Object.assign(this, partial);
  }
}