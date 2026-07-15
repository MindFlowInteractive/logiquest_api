import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { CalibrationService } from './calibration.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin/calibration')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CalibrationController {
  constructor(private readonly calibrationService: CalibrationService) {}

  @Get()
  getCalibrations() {
    return this.calibrationService.findAll();
  }

  @Patch(':puzzleId/apply')
  applyRecommendation(@Param('puzzleId') puzzleId: string) {
    return this.calibrationService.applyRecommendation(puzzleId);
  }

  @Patch(':puzzleId/dismiss')
  dismissRecommendation(@Param('puzzleId') puzzleId: string) {
    return this.calibrationService.dismissRecommendation(puzzleId);
  }
}
