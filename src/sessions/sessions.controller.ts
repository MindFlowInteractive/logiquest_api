import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitSolutionDto } from './dto/submit-solution.dto';
import { resolveLocale } from '../config/locale.helper';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  start(
    @Request() req,
    @Body() dto: CreateSessionDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ) {
    // Locale preference: explicit body field > Accept-Language header > 'en'.
    const locale = dto.locale ?? resolveLocale(acceptLanguage);
    return this.sessionsService.start(req.user.id, dto, locale);
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
