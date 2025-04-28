import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnalyticsSegmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  criteria: any;
}
