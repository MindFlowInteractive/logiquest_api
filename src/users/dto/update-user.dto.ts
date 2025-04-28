import { IsEmail, IsOptional, Length, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @Length(2, 50)
  firstName?: string;

  @IsOptional()
  @Length(2, 50)
  lastName?: string;

  @IsOptional()
  @Length(8, 100)
  password?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  gameProfile?: {
    level: number;
    experience: number;
    rank: string;
    achievements: string[];
  };

  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;
}
