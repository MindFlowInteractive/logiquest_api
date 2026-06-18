import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { AchievementsListener } from './achievements.listener';
import { Achievement } from './entities/achievement.entity';
import { PlayerAchievement } from './entities/player-achievement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement, PlayerAchievement])],
  controllers: [AchievementsController],
  providers: [AchievementsService, AchievementsListener],
  exports: [AchievementsService],
})
export class AchievementsModule {}
