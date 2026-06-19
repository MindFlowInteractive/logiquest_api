import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './entities/score.entity';
import { EventBusService } from '../common/events/event-bus.service';

/**
 * Service responsible for calculating, persisting and retrieving player scores.
 * It also emits an internal event after a score update so the leaderboard module
 * can react without a direct dependency.
 */
@Injectable()
export class ScoringService {
  // In‑memory fast access for active sessions (optional cache)
  private sessionScores: Map<string, number> = new Map(); // sessionId → finalScore

  constructor(
    @InjectRepository(Score)
    private readonly scoreRepo: Repository<Score>,
    private readonly eventBus: EventBusService,
  ) {}

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

  /**
   * Compute the base score based on puzzle difficulty.
   */
  private getBaseScore(difficulty: 'Easy' | 'Medium' | 'Hard'): number {
    const map: Record<string, number> = { Easy: 100, Medium: 250, Hard: 500 };
    return map[difficulty] ?? 0;
  }

  /**
   * Apply a time bonus if the completion time is below the configured threshold.
   * The multiplier is configurable via environment variables; defaults to 1.2.
   */
  private applyTimeBonus(
    base: number,
    elapsedSeconds: number,
    thresholdSeconds: number = Number(process.env.TIME_BONUS_THRESHOLD ?? 300),
    multiplier: number = Number(process.env.TIME_BONUS_MULTIPLIER ?? 1.2),
  ): number {
    if (elapsedSeconds <= thresholdSeconds) {
      return Math.round(base * multiplier);
    }
    return base;
  }

  /**
   * Apply a penalty for hint usage.
   */
  private applyHintPenalty(
    score: number,
    hintCount: number,
    penaltyPerHint: number = Number(process.env.HINT_PENALTY ?? 50),
  ): number {
    return Math.max(0, score - hintCount * penaltyPerHint);
  }

  /**
   * Public API – record a completed puzzle session.
   * It calculates the final score, persists it and updates the in‑memory cache.
   */
  async recordScore(params: {
    userId: string;
    sessionId: string;
    puzzleId: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    elapsedSeconds: number;
    hintCount: number;
  }): Promise<Score> {
    const { userId, sessionId, puzzleId, difficulty, elapsedSeconds, hintCount } = params;
    const base = this.getBaseScore(difficulty);
    const withBonus = this.applyTimeBonus(base, elapsedSeconds);
    const finalScore = this.applyHintPenalty(withBonus, hintCount);

    const score = this.scoreRepo.create({
      user: { id: userId } as any,
      sessionId,
      puzzleId,
      baseScore: base,
      timeBonus: withBonus - base,
      hintPenalty: hintCount * Number(process.env.HINT_PENALTY ?? 50),
      finalScore,
    });
    const saved = await this.scoreRepo.save(score);
    this.sessionScores.set(sessionId, finalScore);

    // Emit event for leaderboard recalculation
    const total = await this.getTotalScore(userId);
    this.eventBus.emit('score.updated', { userId, newTotal: total });
    return saved;
  }

  /**
   * Retrieve total cumulative score for a player.
   */
  async getTotalScore(userId: string): Promise<number> {
    const { sum } = await this.scoreRepo
      .createQueryBuilder('score')
      .select('SUM(score.finalScore)', 'sum')
      .where('score.userId = :userId', { userId })
      .getRawOne();
    return Number(sum ?? 0);
  }

  /**
   * Retrieve a per‑puzzle breakdown for a player.
   */
  async getScoreBreakdown(userId: string) {
    return this.scoreRepo.find({ where: { user: { id: userId } as any } });
  }

  /**
   * Helper used by the controller to compose the response payload.
   */
  async getPlayerScoreSummary(userId: string) {
    const total = await this.getTotalScore(userId);
    const breakdown = await this.getScoreBreakdown(userId);
    return { totalScore: total, puzzles: breakdown };
  }
}
