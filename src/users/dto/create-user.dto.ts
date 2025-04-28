import { IsEmail, IsNotEmpty, Length, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(2, 50)
  firstName: string;

  @IsNotEmpty()
  @Length(2, 50)
  lastName: string;

  @IsNotEmpty()
  @Length(8, 100)
  password: string;

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
