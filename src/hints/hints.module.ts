import { Module } from '@nestjs/common';
import { HintsService } from './hints.service';
import { HintsController } from './hints.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [SessionsModule, ScoringModule],
  providers: [HintsService],
  controllers: [HintsController],
  exports: [HintsService],
})
export class HintsModule {}
