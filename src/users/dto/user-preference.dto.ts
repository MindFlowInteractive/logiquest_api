import { IsNotEmpty, IsString } from 'class-validator';

export class UserPreferenceDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;
}
