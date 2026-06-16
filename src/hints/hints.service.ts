import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Hint } from './entities/hint.entity';
import { v4 as uuidv4 } from 'uuid';
// Placeholder for scoring integration
interface ScoringService {
  penalize(sessionId: string, points: number): void;
}

@Injectable()
export class HintsService {
  private hints: Hint[] = [];
  private sessionHints: Map<string, Set<number>> = new Map(); // sessionId -> set of revealed orders
  private scoringService: ScoringService; // Assume injected elsewhere or set later

  constructor() {
    // Initialize with sample hints (in real app, would be persisted)
    this.hints = [
      new Hint(uuidv4(), 'puzzle1', 1, 'First hint for puzzle 1'),
      new Hint(uuidv4(), 'puzzle1', 2, 'Second hint for puzzle 1'),
      new Hint(uuidv4(), 'puzzle1', 3, 'Third hint for puzzle 1'),
    ];
  }

  setScoringService(service: ScoringService) {
    this.scoringService = service;
  }

  getHintsForPuzzle(puzzleId: string): Hint[] {
    return this.hints.filter(h => h.puzzleId === puzzleId).sort((a, b) => a.order - b.order);
  }

  revealNextHint(sessionId: string, puzzleId: string): Hint {
    if (this.isSessionCompletedOrAbandoned(sessionId)) {
      throw new BadRequestException('Cannot reveal hints for completed or abandoned session');
    }
    const revealed = this.sessionHints.get(sessionId) || new Set<number>();
    const puzzleHints = this.getHintsForPuzzle(puzzleId);
    const nextHint = puzzleHints.find(h => !revealed.has(h.order));
    if (!nextHint) {
      throw new BadRequestException('All hints already revealed');
    }
    // Track reveal
    revealed.add(nextHint.order);
    this.sessionHints.set(sessionId, revealed);
    // Apply penalty (example: 10 points per hint)
    if (this.scoringService) {
      this.scoringService.penalize(sessionId, 10);
    }
    return nextHint;
  }

  private isSessionCompletedOrAbandoned(sessionId: string): boolean {
    // Placeholder logic; integrate with actual session service
    return false;
  }
}
