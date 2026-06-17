import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { Score } from './entities/score.entity';
import { EventBusService } from '../common/events/event-bus.service';

@Module({
  imports: [TypeOrmModule.forFeature([Score])],
  providers: [ScoringService, EventBusService],
  controllers: [ScoringController],
  exports: [ScoringService],
})
export class ScoringModule {}
