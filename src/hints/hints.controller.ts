import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { HintsService } from './hints.service';
import { RevealHintDto } from './dto/reveal-hint.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('hints')
export class HintsController {
  constructor(private readonly hintsService: HintsService) {}

  @Post('reveal')
  async revealHint(@Body() revealHintDto: RevealHintDto) {
    const { sessionId } = revealHintDto;
    return this.hintsService.revealNextHint(sessionId);
  }

  @UseGuards(AdminGuard)
  @Get('puzzle/:puzzleId')
  async getHintsForPuzzle(@Param('puzzleId') puzzleId: string) {
    return this.hintsService.getHintsForPuzzle(puzzleId);
  }
}
