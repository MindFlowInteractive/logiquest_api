// src/leaderboard/dtos/create-leaderboard.dto.ts
import { IsString, IsEnum, IsBoolean, IsNumber, IsOptional, IsObject, Max, Min, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScoringModel, ResetPeriod } from '../entities/leaderboard.entity';

export class CreateLeaderboardDto {
  @ApiProperty({ description: 'Name of the leaderboard', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ description: 'Description of the leaderboard', maxLength: 500 })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ enum: ScoringModel, default: ScoringModel.HIGHEST_SCORE })
  @IsEnum(ScoringModel)
  @IsOptional()
  scoringModel?: ScoringModel = ScoringModel.HIGHEST_SCORE;

  @ApiProperty({ enum: ResetPeriod, default: ResetPeriod.NEVER })
  @IsEnum(ResetPeriod)
  @IsOptional()
  resetPeriod?: ResetPeriod = ResetPeriod.NEVER;

  @ApiPropertyOptional({ description: 'Category of the leaderboard', maxLength: 50 })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  category?: string;

  @ApiPropertyOptional({ description: 'Whether the leaderboard is public', default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = true;

  @ApiPropertyOptional({ description: 'Maximum number of entries to display', default: 100 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10000)
  maxEntries?: number = 100;

  @ApiPropertyOptional({ description: 'Number of entries allowed per user', default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  entryLimitPerUser?: number = 1;

  @ApiPropertyOptional({ description: 'Minimum score threshold to be included', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumScoreThreshold?: number = 0;

  @ApiPropertyOptional({ description: 'Additional metadata as key-value pairs' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any> = {};
}