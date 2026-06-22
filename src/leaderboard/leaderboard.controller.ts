import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto, LeaderboardEntryDto } from './dto/leaderboard.dto';
import { Request } from 'express';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query() query: LeaderboardQueryDto): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardService.getTop(query);
  }

  @Get('me')
  async getMyRank(@Req() req: Request): Promise<LeaderboardEntryDto> {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.leaderboardService.getUserRank(userId);
  }
}
