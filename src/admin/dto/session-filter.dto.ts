import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class SessionFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
