import { Module } from '@nestjs/common';
import { HintsModule } from './hints/hints.module';
import { SessionsModule } from './sessions/sessions.module';
import { ScoringModule } from './scoring/scoring.module';

@Module({
  imports: [
    SessionsModule,
    ScoringModule,
    HintsModule,
  ],
})
export class AppModule {}
