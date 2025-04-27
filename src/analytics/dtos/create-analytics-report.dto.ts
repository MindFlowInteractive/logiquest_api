import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAnalyticsReportDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  config: any;
}
