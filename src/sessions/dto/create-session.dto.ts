import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  puzzleId!: string;

  /**
   * Optional BCP-47 locale tag to record against this session.
   * If omitted, the locale is inferred from the request's Accept-Language header.
   */
  @IsOptional()
  @IsString()
  locale?: string;
}
