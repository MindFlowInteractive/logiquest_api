// File: src/quiz/dto/quiz-filter.dto.ts
import { IsOptional, IsEnum, IsUUID, IsString, IsBoolean } from 'class-validator';
import { DifficultyLevel, QuizStatus } from '../entities/quiz.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QuizFilterDto extends PaginationDto {
  @IsOptional()
  @IsUUID(undefined, { each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficultyLevel?: DifficultyLevel;

  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  creatorId?: string;
}