import { Controller, Post, Body, Get } from '@nestjs/common';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { CreateAnalyticsEventDto } from '../dtos/create-analytics-event.dto';

@Controller('analytics/events')
export class AnalyticsEventController {
  constructor(private readonly eventService: AnalyticsEventService) {}

  @Post()
  create(@Body() createEventDto: CreateAnalyticsEventDto) {
    return this.eventService.createEvent(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventService.findAllEvents();
  }
}
