import { IsNotEmpty, IsString, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreatePuzzleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  difficulty!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsObject()
  @IsNotEmpty()
  conditions!: any;

  @IsObject()
  @IsNotEmpty()
  effects!: any;
}
