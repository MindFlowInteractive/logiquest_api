// File: src/quiz/dto/create-quiz.dto.ts
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  ArrayNotEmpty,
  IsUUID,
  IsArray,
} from 'class-validator';
import { DifficultyLevel, QuizStatus } from '../entities/quiz.entity';
import { CreateQuizQuestionDto } from './create-quiz-question.dto';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @IsEnum(QuizStatus)
  @IsOptional()
  status?: QuizStatus;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  timeLimit?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  passPercentage?: number;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  @IsOptional()
  questions?: CreateQuizQuestionDto[];
}