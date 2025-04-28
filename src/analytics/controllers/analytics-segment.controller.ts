import { Controller, Post, Get, Body } from '@nestjs/common';
import { AnalyticsSegmentService } from '../services/analytics-segment.service';
import { CreateAnalyticsSegmentDto } from '../dtos/create-analytics-segment.dto';

@Controller('analytics/segments')
export class AnalyticsSegmentController {
  constructor(private readonly segmentService: AnalyticsSegmentService) {}

  @Post()
  create(@Body() createDto: CreateAnalyticsSegmentDto) {
    return this.segmentService.createSegment(createDto);
  }

  @Get()
  findAll() {
    return this.segmentService.findAllSegments();
  }
}
