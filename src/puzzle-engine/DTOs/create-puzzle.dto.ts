import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreatePuzzleDto {
  @IsString()
  @IsNotEmpty()
  type: string;
  
  @IsObject()
  @IsNotEmpty()
  data: any;
  
  @IsObject()
  @IsOptional()
  metadata?: any;
}