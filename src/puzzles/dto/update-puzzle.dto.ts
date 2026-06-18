import { IsOptional, IsString, IsNotEmpty, IsUUID, IsObject } from 'class-validator';

export class UpdatePuzzleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  difficulty?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @IsOptional()
  @IsObject()
  @IsNotEmpty()
  conditions?: any;

  @IsOptional()
  @IsObject()
  @IsNotEmpty()
  effects?: any;
}
