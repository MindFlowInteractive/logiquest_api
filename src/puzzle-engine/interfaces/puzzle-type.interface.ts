import { Puzzle } from './puzzle.interface';
import { PuzzleValidator } from './puzzle-validator.interface';
import { PuzzleDifficultyCalculator } from './puzzle-difficulty-calculator.interface';
import { PuzzleGenerator } from './puzzle-generator.interface';

export interface PuzzleType {
  readonly type: string;
  readonly displayName: string;
  readonly description: string;
  
  createPuzzle(data: any, metadata?: any): Puzzle;
  getValidator(): PuzzleValidator;
  getDifficultyCalculator(): PuzzleDifficultyCalculator;
  getGenerator(): PuzzleGenerator;
  deserialize(serialized: string): Puzzle;
}