import { IsOptional, IsNumber, IsString } from 'class-validator';

export class MetadataQueryDto {
  @IsOptional()
  @IsNumber()
  version?: number;

  @IsOptional()
  @IsString()
  format?: 'json' | 'preview';
}