export interface PuzzleGeneratorOptions {
    difficulty?: number;
    constraints?: any;
    seed?: string;
  }
  
  export interface PuzzleGenerator {
    generate(options?: PuzzleGeneratorOptions): Promise<any>;
    validateGeneratedPuzzle(puzzle: any): boolean;
    estimateDifficulty(puzzle: any): number;
  }