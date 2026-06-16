import { Module } from '@nestjs/common';
import { HintsService } from './hints.service';
import { HintsController } from './hints.controller';

@Module({
  providers: [HintsService],
  controllers: [HintsController],
  exports: [HintsService],
})
export class HintsModule {}
