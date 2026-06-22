import { IsInt, Min, IsOptional, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPuzzlesFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
