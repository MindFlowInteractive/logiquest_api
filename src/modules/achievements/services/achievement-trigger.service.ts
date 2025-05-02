
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Achievement } from '../entities/achievement.entity';
import { AchievementsService } from './achievements.service';
import { AchievementProgressService } from './achievement-progress.service';
import { User } from '../../../users/entities/user.entity';


@Injectable()
export class AchievementTriggerService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    private achievementsService: AchievementsService,
    private progressService: AchievementProgressService,
  ) {}

  /**
   * Process a user action that might trigger an achievement
   * @param userId The user ID
   * @param action The action type
   * @param metadata Additional data about the action
   */
  async processUserAction(userId: string, action: string, metadata: Record<string, any>): Promise<void> {
    // 1. Update progress for relevant achievements
    await this.progressService.updateProgress(userId, action, metadata);
    
    // 2. Find achievements that might be triggered by this action
    const relevantAchievements = await this.achievementRepository.find({
      where: { isActive: true },
    });
    
    // 3. Check each achievement to see if it should be awarded
    for (const achievement of relevantAchievements) {
      const shouldAward = await this.evaluateTriggerConditions(
        userId,
        achievement,
        action,
        metadata,
      );
      
      if (shouldAward) {
        const user = { id: userId } as User; // Simplified user object
        await this.achievementsService.awardAchievement(user, achievement);
      }
    }
  }
  
  /**
   * Evaluate if an achievement's trigger conditions are met
   */
  private async evaluateTriggerConditions(
    userId: string,
    achievement: Achievement,
    action: string,
    metadata: Record<string, any>,
  ): Promise<boolean> {
    const { triggerConditions } = achievement;
    
    // Check if this achievement is relevant for the current action
    if (triggerConditions.actionType !== action) {
      return false;
    }
    
    // For achievements based on progress counters
    if (triggerConditions.type === 'counter') {
      const progress = await this.progressService.getProgress(
        userId,
        triggerConditions.progressKey,
      );
      
      return progress && progress.currentValue >= triggerConditions.targetValue;
    }
    
    // For achievements based on specific conditions
    if (triggerConditions.type === 'condition') {
      // Evaluate each condition
      for (const condition of triggerConditions.conditions) {
        const metadataValue = metadata[condition.field];
        const targetValue = condition.value;
        
        // Check if condition is met based on operator
        switch (condition.operator) {
          case 'equals':
            if (metadataValue !== targetValue) return false;
            break;
          case 'greaterThan':
            if (metadataValue <= targetValue) return false;
            break;
          case 'lessThan':
            if (metadataValue >= targetValue) return false;
            break;
          // Add more operators as needed
        }
      }
      
      // All conditions passed
      return true;
    }
    
    // For achievements based on specific event sequences
    if (triggerConditions.type === 'sequence') {
      // Implementation would track event history and check sequences
      // This would require more complex state tracking
      return false; // Simplified for this example
    }
    
    return false;
  }
  
  // Listen for system events and trigger relevant achievements
  @OnEvent('user.levelUp')
  handleUserLevelUp(payload: { userId: string; level: number }) {
    this.processUserAction(payload.userId, 'levelUp', { level: payload.level });
  }
  
  @OnEvent('quiz.completed')
  handleQuizCompleted(payload: { userId: string; quizId: string; score: number }) {
    this.processUserAction(payload.userId, 'quizCompleted', { 
      quizId: payload.quizId, 
      score: payload.score 
    });
  }
  
  // Add more event handlers for other trackable actions
}