// services/achievement-progress.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AchievementProgress } from '../entities/achievement-progress.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AchievementProgressService {
  constructor(
    @InjectRepository(AchievementProgress)
    private progressRepository: Repository<AchievementProgress>,
  ) {}

  async getProgress(userId: string, progressType: string): Promise<AchievementProgress> {
    return this.progressRepository.findOne({
      where: {
        user: { id: userId },
        achievementType: progressType,
      },
    });
  }

  async updateProgress(
    userId: string,
    action: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    // Map of action types to the progress types they affect
    const actionToProgressMapping = {
      'quiz.completed': ['quizzes_completed', 'quiz_score_total'],
      'problem.solved': ['problems_solved', 'streak_days'],
      'lesson.completed': ['lessons_completed', 'learning_time'],
      // Add more mappings as needed
    };

    // Get progress types affected by this action
    const progressTypes = actionToProgressMapping[action] || [];

    // Update each relevant progress type
    for (const progressType of progressTypes) {
      let progress = await this.getProgress(userId, progressType);
      
      // If no progress record exists, create one
      if (!progress) {
        progress = this.progressRepository.create({
          user: { id: userId } as User,
          achievementType: progressType,
          progressData: {},
          currentValue: 0,
          targetValue: this.getTargetValueForProgressType(progressType),
          percentageComplete: 0,
        });
      }
      
      // Update the progress based on the action
      const incrementValue = this.calculateIncrementValue(progressType, metadata);
      progress.currentValue += incrementValue;
      
      // Update percentage complete
      progress.percentageComplete = Math.min(
        100,
        Math.floor((progress.currentValue / progress.targetValue) * 100),
      );
      
      // Store any additional metadata if needed
      progress.progressData = {
        ...progress.progressData,
        lastUpdate: new Date().toISOString(),
        lastAction: action,
      };
      
      await this.progressRepository.save(progress);
    }
  }

  private getTargetValueForProgressType(progressType: string): number {
    // Define target values for different progress types
    const targetValues = {
      'quizzes_completed': 50,
      'quiz_score_total': 1000,
      'problems_solved': 100,
      'streak_days': 30,
      'lessons_completed': 25,
      'learning_time': 3600, // in minutes
      // Add more as needed
    };
    
    return targetValues[progressType] || 100; // Default to 100
  }

  private calculateIncrementValue(
    progressType: string,
    metadata: Record<string, any>,
  ): number {
    // Different progress types may increment differently based on the action
    switch (progressType) {
      case 'quizzes_completed':
        return 1; // Increment by 1 for each completed quiz
      
      case 'quiz_score_total':
        return metadata.score || 0;
      
      case 'problems_solved':
        return metadata.problemCount || 1;
      
      case 'learning_time':
        return metadata.timeSpent || 0;
      
      default:
        return 1;
    }
  }
}