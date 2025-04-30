import { v4 as uuidv4 } from 'uuid';
import { Puzzle } from '../interfaces/puzzle.interface';

export class PuzzleInstance {
  id: string;
  puzzleId: string;
  puzzle: Puzzle;
  currentState: any;
  moves: any[];
  startedAt: Date;
  lastUpdatedAt: Date;
  userId?: string;
  isCompleted: boolean;
  completedAt?: Date;
  
  constructor(puzzle: Puzzle, userId?: string) {
    this.id = uuidv4();
    this.puzzleId = puzzle.id;
    this.puzzle = puzzle;
    this.currentState = puzzle.getInitialState();
    this.moves = [];
    this.startedAt = new Date();
    this.lastUpdatedAt = new Date();
    this.userId = userId;
    this.isCompleted = false;
  }
  
  makeMove(move: any): boolean {
    if (this.isCompleted) {
      return false;
    }
    
    const validator = this.puzzle.getValidator();
    if (validator.validateStep(this.puzzle.data, move, this.currentState)) {
      this.moves.push({
        move,
        timestamp: new Date(),
      });
      
      // Update state based on move (implementation depends on puzzle type)
      this.applyMove(move);
      
      this.lastUpdatedAt = new Date();
      
      // Check if puzzle is solved
      if (this.checkCompletion()) {
        this.isCompleted = true;
        this.completedAt = new Date();
      }
      
      return true;
    }
    
    return false;
  }
  
  protected applyMove(move: any): void {
    // To be implemented by specific puzzle instance types
    // Updates this.currentState based on the move
  }
  
  checkCompletion(): boolean {
    // To be implemented by specific puzzle instance types
    // Checks if the current state represents a solution
    return false;
  }
  
  getTimeElapsed(): number {
    const endTime = this.completedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }
  
  reset(): void {
    this.currentState = this.puzzle.getInitialState();
    this.moves = [];
    this.lastUpdatedAt = new Date();
    this.isCompleted = false;
    this.completedAt = undefined;
  }
  
  serialize(): string {
    return JSON.stringify({
      id: this.id,
      puzzleId: this.puzzleId,
      puzzle: this.puzzle.serialize(),
      currentState: this.currentState,
      moves: this.moves,
      startedAt: this.startedAt,
      lastUpdatedAt: this.lastUpdatedAt,
      userId: this.userId,
      isCompleted: this.isCompleted,
      completedAt: this.completedAt,
    });
  }
}