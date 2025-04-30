import { Injectable } from '@nestjs/common';
import { Puzzle } from '../interfaces/puzzle.interface';
import { PuzzleType } from '../interfaces/puzzle-type.interface';

@Injectable()
export class PuzzleFactory {
  private puzzleTypes: Map<string, PuzzleType> = new Map();
  
  registerPuzzleType(puzzleType: PuzzleType): void {
    this.puzzleTypes.set(puzzleType.type, puzzleType);
  }
  
  createPuzzle(type: string, data: any, metadata?: any): Puzzle {
    const puzzleType = this.puzzleTypes.get(type);
    
    if (!puzzleType) {
      throw new Error(`Unknown puzzle type: ${type}`);
    }
    
    return puzzleType.createPuzzle(data, metadata);
  }
  
  getPuzzleType(type: string): PuzzleType {
    const puzzleType = this.puzzleTypes.get(type);
    
    if (!puzzleType) {
      throw new Error(`Unknown puzzle type: ${type}`);
    }
    
    return puzzleType;
  }
  
  getAllPuzzleTypes(): PuzzleType[] {
    return Array.from(this.puzzleTypes.values());
  }
  
  deserializePuzzle(type: string, serialized: string): Puzzle {
    const puzzleType = this.puzzleTypes.get(type);
    
    if (!puzzleType) {
      throw new Error(`Unknown puzzle type: ${type}`);
    }
    
    return puzzleType.deserialize(serialized);
  }
}