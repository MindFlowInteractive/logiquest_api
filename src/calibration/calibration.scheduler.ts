import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalibrationService } from './calibration.service';

@Injectable()
export class CalibrationScheduler {
  private readonly logger = new Logger(CalibrationScheduler.name);

  constructor(private readonly calibrationService: CalibrationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyCalibration(): Promise<void> {
    this.logger.log('Starting daily difficulty calibration...');
    const results = await this.calibrationService.runCalibration();
    const divergent = results.filter((r) => r.currentDifficulty !== r.recommendedDifficulty);
    this.logger.log(
      `Calibration complete: ${results.length} evaluated, ${divergent.length} divergence(s) detected`,
    );
  }
}
