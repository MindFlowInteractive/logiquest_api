import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuzzlesService } from './puzzles.service';
import { PuzzlesController } from './puzzles.controller';
import { Puzzle } from './entities/puzzle.entity';
import { PuzzleTranslation } from './entities/puzzle-translation.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Puzzle, PuzzleTranslation, Category])],
  controllers: [PuzzlesController],
  providers: [PuzzlesService],
  exports: [PuzzlesService, TypeOrmModule],
})
export class PuzzlesModule {}
