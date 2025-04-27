import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsReport } from './entities/analytics-report.entity';
import { AnalyticsConfig } from './entities/analytics-config.entity';
import { AnalyticsSegment } from './entities/analytics-segment.entity';

import { AnalyticsEventService } from './services/analytics-event.service';
import { AnalyticsReportService } from './services/analytics-report.service';
import { AnalyticsSegmentService } from './services/analytics-segment.service';

import { AnalyticsEventController } from './controllers/analytics-event.controller';
import { AnalyticsReportController } from './controllers/analytics-report.controller';
import { AnalyticsSegmentController } from './controllers/analytics-segment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      AnalyticsReport,
      AnalyticsConfig,
      AnalyticsSegment,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AnalyticsEventController,
    AnalyticsReportController,
    AnalyticsSegmentController,
  ],
  providers: [
    AnalyticsEventService,
    AnalyticsReportService,
    AnalyticsSegmentService,
  ],
})
export class AnalyticsModule {}
