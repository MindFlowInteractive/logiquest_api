import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { AnalyticsReportService } from '../services/analytics-report.service';
import { CreateAnalyticsReportDto } from '../dtos/create-analytics-report.dto';
import { UpdateAnalyticsReportDto } from '../dtos/update-analytics-report.dto';

@Controller('analytics/reports')
export class AnalyticsReportController {
  constructor(private readonly reportService: AnalyticsReportService) {}

  @Post()
  create(@Body() createDto: CreateAnalyticsReportDto) {
    return this.reportService.createReport(createDto);
  }

  @Get()
  findAll() {
    return this.reportService.findAllReports();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAnalyticsReportDto) {
    return this.reportService.updateReport(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportService.deleteReport(id);
  }
}
