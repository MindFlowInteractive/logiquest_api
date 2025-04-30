import { Injectable } from '@nestjs/common';
import { PuzzleDifficultyCalculator } from '../interfaces/puzzle-difficulty-calculator.interface';

@Injectable()
export class PuzzleDifficultyService {
  // Maps difficulty score ranges to labels
  private difficultyLabels = [
    { max: 0.2, label: 'Very Easy' },
    { max: 0.4, label: 'Easy' },
    { max: 0.6, label: 'Medium' },
    { max: 0.8, label: 'Hard' },
    { max: 1.0, label: 'Very Hard' },
  ];
  
  calculateNormalizedDifficulty(rawScore: number, min: number, max: number): number {
    // Normalize the difficulty score to a value between 0 and 1
    return Math.max(0, Math.min(1, (rawScore - min) / (max - min)));
  }
  
  getDifficultyLabel(difficulty: number): string {
    for (const { max, label } of this.difficultyLabels) {
      if (difficulty <= max) {
        return label;
      }
    }
    return 'Unknown';
  }
  
  registerCalculator(puzzleType: string, calculator: PuzzleDifficultyCalculator): void {
    // Register type-specific difficulty calculators
  }
}