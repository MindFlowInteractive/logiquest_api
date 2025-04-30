import { v4 as uuidv4 } from 'uuid';
import { Puzzle, PuzzleMetadata } from '../interfaces/puzzle.interface';
import { PuzzleValidator } from '../interfaces/puzzle-validator.interface';
import { PuzzleDifficultyCalculator } from '../interfaces/puzzle-difficulty-calculator.interface';

export abstract class BasePuzzle implements Puzzle {
  id: string;
  type: string;
  data: any;
  difficulty: number;
  metadata: PuzzleMetadata;
  
  protected validator: PuzzleValidator;
  protected difficultyCalculator: PuzzleDifficultyCalculator;
  
  constructor(
    type: string,
    data: any,
    validator: PuzzleValidator,
    difficultyCalculator: PuzzleDifficultyCalculator,
    metadata?: Partial<PuzzleMetadata>,
  ) {
    this.id = uuidv4();
    this.type = type;
    this.data = data;
    this.validator = validator;
    this.difficultyCalculator = difficultyCalculator;
    
    this.metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      ...metadata,
    };
    
    this.difficulty = this.calculateDifficulty();
  }
  
  validate(solution: any): boolean {
    return this.validator.validate(this.data, solution);
  }
  
  calculateDifficulty(): number {
    return this.difficultyCalculator.calculateDifficulty(this.data);
  }
  
  abstract serialize(): string;
  
  abstract getInitialState(): any;
}