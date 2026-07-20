import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ReplayEventType } from '../entities/session-replay-event.entity';

export class RecordReplayEventDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  puzzleId!: string;

  @IsInt()
  @Min(1)
  sequence!: number;

  @IsEnum(ReplayEventType)
  eventType!: ReplayEventType;

  @IsObject()
  @IsOptional()
  payload?: Record<string, unknown>;
}
