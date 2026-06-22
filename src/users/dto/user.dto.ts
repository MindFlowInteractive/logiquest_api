import { UserRole } from '../entities/user.entity';

export class UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
