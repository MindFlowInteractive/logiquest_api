
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { UserAchievement } from '../entities/user-achievement.entity';
import { Achievement } from '../entities/achievement.entity';

@Injectable()
export class AchievementNotificationService {
  constructor(
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  @OnEvent('achievement.awarded')
  async handleAchievementAwarded(payload: {
    userId: string;
    achievementId: string;
    userAchievementId: string;
  }): Promise<void> {
    const { userId, achievementId, userAchievementId } = payload;
    
    // Get achievement details
    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
    });
    
    if (!achievement) {
      return;
    }
    
    // Create notification payload
    const notificationPayload = {
      type: 'achievement',
      userId,
      title: 'New Achievement Unlocked!',
      message: `Congratulations! You've earned the "${achievement.name}" achievement.`,
      data: {
        achievementId,
        achievementName: achievement.name,
        icon: achievement.icon,
        points: achievement.points,
      },
    };
    
    // Send notification (this would integrate with your notification system)
    await this.sendNotification(notificationPayload);
    
    // Mark achievement as notified
    await this.userAchievementRepository.update(
      { id: userAchievementId },
      { isNotified: true },
    );
  }

  private async sendNotification(payload: any): Promise<void> {
    // Integration with your notification system
    // This could be a WebSocket, push notification, email, etc.
    
    console.log('Sending achievement notification:', payload);
    
    // Example: Emit WebSocket event
    // this.wsGateway.server.to(payload.userId).emit('notification', payload);
    
    // Example: Send push notification
    // await this.pushNotificationService.send(payload);
  }
}