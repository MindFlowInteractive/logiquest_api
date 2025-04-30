import { IsNotEmpty } from 'class-validator';

export class SolvePuzzleDto {
  @IsNotEmpty()
  solution: any;
}