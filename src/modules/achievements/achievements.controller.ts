// achievements.controller.ts
import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User as UserDecorator } from '../decorators/user.decorator';
import { AchievementTriggerService } from './services/achievement-trigger.service';
import { AchievementProgressService } from './services/achievement-progress.service';

import { AchievementsService } from './services/achievements.service';
import { AchievementStatisticsService } from './services/achievement-statistics.service';
import { User } from '../../users/entities/user.entity';

@Controller('achievements')
export class AchievementsController {
  constructor(
    private achievementsService: AchievementsService,
    private triggerService: AchievementTriggerService,
    private progressService: AchievementProgressService,
    private statisticsService: AchievementStatisticsService,
  ) {}

  @Get()
  async findAll() {
    return this.achievementsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.achievementsService.findById(id);
  }

  @Get('user/me')
  @UseGuards(AuthGuard('jwt'))
  async getMyAchievements(@UserDecorator() user: User) {
    return this.achievementsService.getUserAchievements(user.id);
  }

  @Get('user/:userId')
  async getUserAchievements(@Param('userId') userId: string) {
    return this.achievementsService.getUserAchievements(userId);
  }

  @Get('progress/me')
  @UseGuards(AuthGuard('jwt'))
  async getMyProgress(@UserDecorator() user: User) {
    // This would get all progress records for the user
    // Implement based on your specific requirements
    return { message: 'Not implemented yet' };
  }

  @Get('statistics/top')
  async getTopAchievements() {
    return this.statisticsService.getTopAchievements();
  }

  @Get('statistics/rare')
  async getRarestAchievements() {
    return this.statisticsService.getRarestAchievements();
  }

  // This endpoint is for testing purposes
  @Post('trigger')
  @UseGuards(AuthGuard('jwt'))
  async triggerAction(
    @UserDecorator() user: User,
    @Body() payload: { action: string; metadata: Record<string, any> },
  ) {
    await this.triggerService.processUserAction(
      user.id,
      payload.action,
      payload.metadata,
    );
    return { success: true };
  }
}