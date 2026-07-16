import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEmailPreferencesDto {
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  achievementEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklySummaryEmails?: boolean;
}
