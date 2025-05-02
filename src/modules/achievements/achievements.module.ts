// achievements.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { AchievementProgress } from './entities/achievement-progress.entity';
import { AchievementStatistic } from './entities/achievement-statistic.entity';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './services/achievements.service';
import { AchievementTriggerService } from './services/achievement-trigger.service';
import { AchievementProgressService } from './services/achievement-progress.service';
import { AchievementStatisticsService } from './services/achievement-statistics.service';
import { AchievementNotificationService } from './services/achievement-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Achievement,
      UserAchievement,
      AchievementProgress,
      AchievementStatistic,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AchievementsController],
  providers: [
    AchievementsService,
    AchievementTriggerService,
    AchievementProgressService,
    AchievementStatisticsService,
    AchievementNotificationService,
  ],
  exports: [
    AchievementsService,
    AchievementTriggerService,
    AchievementProgressService,
  ],
})
export class AchievementsModule {}