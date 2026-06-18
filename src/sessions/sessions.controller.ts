import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitSolutionDto } from './dto/submit-solution.dto';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  start(@Request() req, @Body() dto: CreateSessionDto) {
    return this.sessionsService.start(req.user.id, dto);
  }

  @Patch(':id/submit')
  submit(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: SubmitSolutionDto,
  ) {
    return this.sessionsService.submit(req.user.id, id, dto);
  }

  @Patch(':id/abandon')
  abandon(@Request() req, @Param('id') id: string) {
    return this.sessionsService.abandon(req.user.id, id);
  }

  @Get(':id')
  getById(@Request() req, @Param('id') id: string) {
    return this.sessionsService.getById(req.user.id, id);
  }
}
