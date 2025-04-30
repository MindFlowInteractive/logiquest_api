// src/leaderboard/dtos/submit-score.dto.ts
import { IsNumber, IsOptional, IsObject, IsUUID, Min, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitScoreDto {
  @ApiProperty({ description: 'Score value' })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ description: 'Completion time in milliseconds' })
  @IsNumber()
  @IsOptional()
  @Min(0)  
  completionTime?: number;

  @ApiPropertyOptional({ description: 'Additional metadata for anti-cheat verification' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any> = {};
}
