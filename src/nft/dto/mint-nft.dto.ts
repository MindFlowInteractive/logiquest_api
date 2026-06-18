import { IsNotEmpty, IsString } from 'class-validator';

export class MintNftDto {
  @IsString()
  @IsNotEmpty()
  achievementId!: string;
}
