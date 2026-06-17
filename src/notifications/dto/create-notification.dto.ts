import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { NotificationType } from '../notification.entity';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  message: string;
}
