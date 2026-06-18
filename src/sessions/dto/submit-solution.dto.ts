import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class SubmitSolutionDto {
  @IsString()
  @IsNotEmpty()
  solution!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  hintsUsed?: number;
}
