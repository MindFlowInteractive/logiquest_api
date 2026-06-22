import { Controller, Get, Param } from '@nestjs/common';
import { ScoringService } from './scoring.service';

/**
 * Controller exposing scoring information.
 */
@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get('player/:userId')
  async getPlayerScore(@Param('userId') userId: string) {
    return this.scoringService.getPlayerScoreSummary(userId);
  }
}
