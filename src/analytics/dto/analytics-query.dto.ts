// src/analytics/dto/analytics-query.dto.ts
import { IsOptional, IsString, IsISO8601 } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsISO8601()
  readonly from?: string; // ISO date string

  @IsOptional()
  @IsISO8601()
  readonly to?: string; // ISO date string
}
