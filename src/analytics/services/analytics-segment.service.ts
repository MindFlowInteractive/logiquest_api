import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsSegment } from '../entities/analytics-segment.entity';
import { CreateAnalyticsSegmentDto } from '../dtos/create-analytics-segment.dto';

@Injectable()
export class AnalyticsSegmentService {
  constructor(
    @InjectRepository(AnalyticsSegment)
    private segmentRepository: Repository<AnalyticsSegment>,
  ) {}

  async createSegment(dto: CreateAnalyticsSegmentDto) {
    const segment = this.segmentRepository.create(dto);
    return await this.segmentRepository.save(segment);
  }

  async findAllSegments() {
    return await this.segmentRepository.find();
  }
}
