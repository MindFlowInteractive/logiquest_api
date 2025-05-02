// services/achievements.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { User } from '../entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<Achievement[]> {
    return this.achievementRepository.find({ where: { isActive: true } });
  }

  async findById(id: string): Promise<Achievement> {
    return this.achievementRepository.findOneOrFail({ where: { id } });
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievementRepository.find({
      where: { user: { id: userId } },
      relations: ['achievement'],
    });
  }

  async awardAchievement(user: User, achievement: Achievement): Promise<UserAchievement> {
    // Check if user already has this achievement
    const existingAchievement = await this.userAchievementRepository.findOne({
      where: {
        user: { id: user.id },
        achievement: { id: achievement.id },
      },
    });

    if (existingAchievement) {
      return existingAchievement;
    }

    // Create new user achievement
    const userAchievement = this.userAchievementRepository.create({
      user,
      achievement,
      isNotified: false,
    });

    await this.userAchievementRepository.save(userAchievement);

    // Emit event for new achievement
    this.eventEmitter.emit('achievement.awarded', {
      userId: user.id,
      achievementId: achievement.id,
      userAchievementId: userAchievement.id,
    });

    return userAchievement;
  }
}