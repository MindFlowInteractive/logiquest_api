// src/leaderboard/dtos/query-leaderboard.dto.ts
import { IsEnum, IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum LeaderboardTimeFrame {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  ALL_TIME = 'all_time',
}

export class QueryLeaderboardDto {
  @ApiPropertyOptional({ enum: LeaderboardTimeFrame })
  @IsEnum(LeaderboardTimeFrame)
  @IsOptional()
  timeFrame?: LeaderboardTimeFrame;

  @ApiPropertyOptional({ description: 'Category filter' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}