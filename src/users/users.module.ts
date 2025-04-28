import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { UserPreferenceRepository } from './repositories/user-preference.repository';
import { User } from './entities/user.entity';
import { UserPreference } from './entities/user-preference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPreference]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserPreferenceRepository],
  exports: [UserService],
})
export class UsersModule {}