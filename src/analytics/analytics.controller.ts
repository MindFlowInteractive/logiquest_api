// src/analytics/analytics.controller.ts
import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

import { AdminGuard } from '../common/guards/admin.guard';

@Controller('analytics')
@UseInterceptors(CacheInterceptor)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('puzzles/:id')
  async getPuzzleAnalytics(
    @Param('id') id: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getPuzzleAnalytics(id, query);
  }

  @Get('player/:userId')
  async getPlayerAnalytics(
    @Param('userId') userId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getPlayerAnalytics(userId, query);
  }

  @UseGuards(AdminGuard)
  @Get('overview')
  async getOverview(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getOverview(query);
  }
}
