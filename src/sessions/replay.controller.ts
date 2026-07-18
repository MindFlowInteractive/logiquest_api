import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReplayService } from './replay.service';
import { RecordReplayEventDto } from './dto/record-replay-event.dto';

/**
 * Provides endpoints for the Player Replay System.
 *
 * GET  /sessions/replays            – list all replayable (completed) sessions for the current user
 * GET  /sessions/:id/replay         – fetch the full event timeline for a specific completed session
 * POST /sessions/replay/event       – record an individual replay event (internal/service-to-service use)
 */
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class ReplayController {
  constructor(private readonly replayService: ReplayService) {}

  /**
   * List all completed sessions for the authenticated user that have replay data.
   */
  @Get('replays')
  listReplays(@Request() req) {
    return this.replayService.listReplays(req.user.id);
  }

  /**
   * Retrieve the full replay event timeline for a completed session.
   * Only the session owner can view the replay.
   */
  @Get(':id/replay')
  getReplay(@Request() req, @Param('id') id: string) {
    return this.replayService.getReplay(req.user.id, id);
  }

  /**
   * Record a single replay event for a session.
   * Intended for internal services or trusted consumers.
   */
  @Post('replay/event')
  recordEvent(@Body() dto: RecordReplayEventDto) {
    return this.replayService.recordEvent(dto);
  }
}
