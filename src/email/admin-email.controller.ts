import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { EmailService } from '../email.service';
import { SendTestEmailDto } from '../dto/send-test-email.dto';

/**
 * Admin-only endpoint for testing the email delivery pipeline.
 * Queues a test email to the specified address.
 */
@Controller('admin/email')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminEmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendTestEmail(@Body() dto: SendTestEmailDto): Promise<{ message: string }> {
    await this.emailService.sendTestEmail(dto.to);
    return { message: `Test email queued for ${dto.to}` };
  }
}
