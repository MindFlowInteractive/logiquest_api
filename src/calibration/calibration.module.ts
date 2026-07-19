import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DifficultyCalibration } from './entities/difficulty-calibration.entity';
import { CalibrationService } from './calibration.service';
import { CalibrationScheduler } from './calibration.scheduler';
import { CalibrationController } from './calibration.controller';
import { Puzzle } from '../puzzles/entities/puzzle.entity';
import { Session } from '../sessions/entities/session.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DifficultyCalibration, Puzzle, Session]),
    NotificationsModule,
  ],
  controllers: [CalibrationController],
  providers: [CalibrationService, CalibrationScheduler],
  exports: [CalibrationService],
})
export class CalibrationModule {}
