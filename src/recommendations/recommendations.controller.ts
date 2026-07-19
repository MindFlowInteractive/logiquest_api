import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  async getRecommendations(
    @Request() req: any,
    @Query('mode') mode?: string,
  ) {
    // Determine user ID depending on how the JWT strategy attaches it
    const userId = req.user.id || req.user.userId;
    return this.recommendationsService.getRecommendations(userId, mode);
  }
}
