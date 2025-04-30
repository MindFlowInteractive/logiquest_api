// File: src/quiz/dto/create-quiz-answer.dto.ts
import {
    IsString,
    IsBoolean,
    IsInt,
    Min,
    IsOptional,
  } from 'class-validator';
  
  export class CreateQuizAnswerDto {
    @IsString()
    answerText: string;
  
    @IsBoolean()
    isCorrect: boolean;
  
    @IsString()
    @IsOptional()
    explanation?: string;
  
    @IsInt()
    @Min(0)
    orderIndex: number;
  }