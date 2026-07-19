import { Controller, Get, Patch, Param, Query, UseGuards, Request, Body, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { PaginationDto } from './dto/pagination.dto';
import { SessionFilterDto } from './dto/session-filter.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Query() dto: PaginationDto) {
    return this.adminService.getUsers(dto);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string, @Request() req) {
    const adminId = req.user.id;
    return this.adminService.banUser(adminId, id);
  }

  @Get('sessions')
  getSessions(@Query() dto: SessionFilterDto) {
    return this.adminService.getSessions(dto);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('submissions')
  getPendingSubmissions() {
    return this.adminService.getPendingSubmissions();
  }

  @Patch('submissions/:id/approve')
  approveSubmission(@Param('id') id: string, @Request() req) {
    const adminId = req.user.id;
    return this.adminService.approveSubmission(adminId, id);
  }

  @Patch('submissions/:id/reject')
  rejectSubmission(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
    if (!reason) {
      throw new BadRequestException('Rejection reason is required');
    }
    const adminId = req.user.id;
    return this.adminService.rejectSubmission(adminId, id, reason);
  }
}
