import { Module } from '@nestjs/common';
import { PuzzleEngineModule } from '../puzzle-engine.module';
import { SudokuType } from './models/sudoku-type';
import { SudokuValidator } from './validators/sudoku.validator';
import { SudokuDifficultyCalculator } from './validators/sudoku-difficulty.calculator';
import { SudokuGenerator } from './generators/sudoku.generator';

@Module({
  imports: [PuzzleEngineModule],
  providers: [
    SudokuType,
    SudokuValidator,
    SudokuDifficultyCalculator,
    SudokuGenerator,
  ],
  exports: [SudokuType],
})
export class SudokuModule {
  constructor(
    private sudokuType: SudokuType,
    private puzzleFactory: PuzzleFactory,
  ) {
    // Register this puzzle type with the factory
    this.puzzleFactory.registerPuzzleType(this.sudokuType);
  }
}