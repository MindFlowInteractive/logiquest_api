import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent } from '../entities/analytics-event.entity';
import { CreateAnalyticsEventDto } from '../dtos/create-analytics-event.dto';

@Injectable()
export class AnalyticsEventService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private eventRepository: Repository<AnalyticsEvent>,
  ) {}

  async createEvent(dto: CreateAnalyticsEventDto) {
    const event = this.eventRepository.create(dto);
    return await this.eventRepository.save(event);
  }

  async findAllEvents() {
    return await this.eventRepository.find();
  }
}
