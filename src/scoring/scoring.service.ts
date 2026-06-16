import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoringService {
  private sessionScores: Map<string, number> = new Map(); // sessionId -> score

  penalize(sessionId: string, points: number): void {
    const currentScore = this.sessionScores.get(sessionId) || 100; // start score at 100
    this.sessionScores.set(sessionId, Math.max(0, currentScore - points));
  }

  getScore(sessionId: string): number {
    return this.sessionScores.get(sessionId) ?? 100;
  }

  setScore(sessionId: string, score: number): void {
    this.sessionScores.set(sessionId, score);
  }
}
