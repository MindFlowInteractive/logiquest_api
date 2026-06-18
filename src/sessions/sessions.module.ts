import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsScheduler } from './sessions.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), ScheduleModule.forRoot()],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsScheduler],
  exports: [SessionsService],
})
export class SessionsModule {}
