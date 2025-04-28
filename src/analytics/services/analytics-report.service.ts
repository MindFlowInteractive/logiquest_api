import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsReport } from '../entities/analytics-report.entity';
import { CreateAnalyticsReportDto } from '../dtos/create-analytics-report.dto';
import { UpdateAnalyticsReportDto } from '../dtos/update-analytics-report.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AnalyticsReportService {
  constructor(
    @InjectRepository(AnalyticsReport)
    private reportRepository: Repository<AnalyticsReport>,
  ) {}

  async createReport(dto: CreateAnalyticsReportDto) {
    const report = this.reportRepository.create(dto);
    return await this.reportRepository.save(report);
  }

  async findAllReports() {
    return await this.reportRepository.find();
  }

  async findOne(id: string) {
    return await this.reportRepository.findOneBy({ id });
  }

  async updateReport(id: string, dto: UpdateAnalyticsReportDto) {
    await this.reportRepository.update(id, dto);
    return this.findOne(id);
  }

  async deleteReport(id: string) {
    return await this.reportRepository.delete(id);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateScheduledReports() {
    console.log('Generating scheduled reports...');
  }
}
