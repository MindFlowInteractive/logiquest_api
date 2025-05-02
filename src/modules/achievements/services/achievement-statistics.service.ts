// services/achievement-statistics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { AchievementStatistic } from '../entities/achievement-statistic.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { Achievement } from '../entities/achievement.entity';

@Injectable()
export class AchievementStatisticsService {
  constructor(
    @InjectRepository(AchievementStatistic)
    private statisticsRepository: Repository<AchievementStatistic>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  @OnEvent('achievement.awarded')
  async handleAchievementAwarded(payload: {
    achievementId: string;
  }): Promise<void> {
    await this.incrementAchievementCount(payload.achievementId);
  }

  private async incrementAchievementCount(achievementId: string): Promise<void> {
    let statistic = await this.statisticsRepository.findOne({
      where: { achievement: { id: achievementId } },
    });
    
    if (!statistic) {
      statistic = this.statisticsRepository.create({
        achievement: { id: achievementId } as Achievement,
        totalAwarded: 0,
      });
    }
    
    statistic.totalAwarded += 1;
    await this.statisticsRepository.save(statistic);
  }

  @Cron('0 0 * * *') // Run daily at midnight
  async updateAllStatistics(): Promise<void> {
    const achievements = await this.achievementRepository.find();
    const totalUsers = await this.getTotalUserCount();
    
    for (const achievement of achievements) {
      const userAchievementCount = await this.userAchievementRepository.count({
        where: { achievement: { id: achievement.id } },
      });
      
      const averageTimeToComplete = await this.calculateAverageTimeToComplete(achievement.id);
      
      let statistic = await this.statisticsRepository.findOne({
        where: { achievement: { id: achievement.id } },
      });
      
      if (!statistic) {
        statistic = this.statisticsRepository.create({
          achievement: achievement,
        });
      }
      
      statistic.totalAwarded = userAchievementCount;
      statistic.percentageOfUsersAwarded = totalUsers > 0
        ? (userAchievementCount / totalUsers) * 100
        : 0;
      statistic.averageTimeToComplete = averageTimeToComplete;
      
      await this.statisticsRepository.save(statistic);
    }
  }

  private async getTotalUserCount(): Promise<number> {
    // This would need to be implemented based on your user repository
    return 100; // Placeholder value
  }

  private async calculateAverageTimeToComplete(achievementId: string): Promise<number> {
    // This would calculate the average time between user creation and achievement award
    // Simplified implementation for this example
    return 5.5; // Placeholder value in days
  }

  async getTopAchievements(limit: number = 10): Promise<AchievementStatistic[]> {
    return this.statisticsRepository.find({
      relations: ['achievement'],
      order: { totalAwarded: 'DESC' },
      take: limit,
    });
  }

  async getRarestAchievements(limit: number = 10): Promise<AchievementStatistic[]> {
    return this.statisticsRepository.find({
      relations: ['achievement'],
      order: { percentageOfUsersAwarded: 'ASC' },
      take: limit,
    });
  }
}
