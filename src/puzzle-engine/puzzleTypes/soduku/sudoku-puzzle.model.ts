import { BasePuzzle } from '../../models/base-puzzle.model';
import { PuzzleValidator } from '../../interfaces/puzzle-validator.interface';
import { PuzzleDifficultyCalculator } from '../../interfaces/puzzle-difficulty-calculator.interface';

export class SudokuPuzzle extends BasePuzzle {
  constructor(
    data: number[][],
    validator: PuzzleValidator,
    difficultyCalculator: PuzzleDifficultyCalculator,
    metadata?: any,
  ) {
    super('sudoku', data, validator, difficultyCalculator, metadata);
  }
  
  serialize(): string {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      data: this.data,
      difficulty: this.difficulty,
      metadata: this.metadata,
    });
  }
  
  getInitialState(): number[][] {
    // Create a deep copy of the initial board
    return JSON.parse(JSON.stringify(this.data));
  }
}