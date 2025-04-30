// File: src/quiz/dto/create-quiz-question.dto.ts
import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
  IsOptional,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';
import { QuestionType } from '../entities/quiz-question.entity';
import { CreateQuizAnswerDto } from './create-quiz-answer.dto';

export class CreateQuizQuestionDto {
  @IsString()
  questionText: string;

  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  points?: number;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => CreateQuizAnswerDto)
  answers: CreateQuizAnswerDto[];
}

