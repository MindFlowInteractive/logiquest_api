export interface PuzzleValidator {
    validate(puzzle: any, solution: any): boolean;
    validateStep(puzzle: any, step: any, currentState: any): boolean;
    getPossibleMoves(puzzle: any, currentState: any): any[];
  }