import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async getUserNotifications(@Request() req) {
    const userId = req.user.id;
    return this.service.findByUser(userId);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    await this.service.markAsRead(id, userId);
    return { success: true };
  }

  @Patch('read-all')
  async markAllRead(@Request() req) {
    const userId = req.user.id;
    await this.service.markAllAsRead(userId);
    return { success: true };
  }
}
