import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyAchievements(@Request() req) {
    const userId = req.user.sub; // adapt to JWT payload
    return this.service.getForUser(userId);
  }
}
