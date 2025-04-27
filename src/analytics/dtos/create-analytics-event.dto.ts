import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAnalyticsEventDto {
  @IsString()
  @IsNotEmpty()
  eventType: string;

  payload: any;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
