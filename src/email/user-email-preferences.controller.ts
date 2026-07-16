import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailPreferencesService } from '../email-preferences.service';
import { UpdateEmailPreferencesDto } from '../dto/update-email-preferences.dto';
import { EmailPreference } from '../entities/email-preference.entity';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UserEmailPreferencesController {
  constructor(private readonly preferencesService: EmailPreferencesService) {}

  @Get('email-preferences')
  async getPreferences(@Request() req): Promise<EmailPreference> {
    return this.preferencesService.getOrCreate(req.user.id);
  }

  @Patch('email-preferences')
  @HttpCode(HttpStatus.OK)
  async updatePreferences(
    @Request() req,
    @Body() dto: UpdateEmailPreferencesDto,
  ): Promise<EmailPreference> {
    return this.preferencesService.update(req.user.id, dto);
  }
}
