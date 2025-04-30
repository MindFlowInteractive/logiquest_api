import { Injectable } from '@nestjs/common';
import { Puzzle } from '../interfaces/puzzle.interface';

@Injectable()
export class PuzzleSerializationService {
  serializePuzzle(puzzle: Puzzle): string {
    return puzzle.serialize();
  }
  
  serializePuzzles(puzzles: Puzzle[]): string {
    return JSON.stringify(puzzles.map(p => JSON.parse(p.serialize())));
  }
}