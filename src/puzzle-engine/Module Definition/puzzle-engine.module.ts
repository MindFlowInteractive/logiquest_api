import { Module, DynamicModule } from '@nestjs/common';
import { PuzzleFactory } from './factories/puzzle.factory';
import { PuzzleManagerService } from './services/puzzle-manager.service';
import { PuzzleSerializationService } from './services/puzzle-serialization.service';
import { PuzzleDifficultyService } from './services/puzzle-difficulty.service';

@Module({
  providers: [
    PuzzleFactory,
    PuzzleManagerService,
    PuzzleSerializationService,
    PuzzleDifficultyService,
  ],
  exports: [
    PuzzleFactory,
    PuzzleManagerService,
    PuzzleSerializationService,
    PuzzleDifficultyService,
  ],
})
export class PuzzleEngineModule {
  static register(options?: any): DynamicModule {
    return {
      module: PuzzleEngineModule,
      providers: [
        {
          provide: 'PUZZLE_ENGINE_OPTIONS',
          useValue: options || {},
        },
      ],
    };
  }
}