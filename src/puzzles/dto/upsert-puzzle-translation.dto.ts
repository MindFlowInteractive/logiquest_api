import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HintItemDto {
  @IsInt()
  @Min(1)
  order!: number;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class UpsertPuzzleTranslationDto {
  @IsString()
  @IsNotEmpty()
  locale!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HintItemDto)
  hints?: HintItemDto[] | null;
}
