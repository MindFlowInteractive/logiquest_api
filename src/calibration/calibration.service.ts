import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DifficultyCalibration, CalibrationStatus } from './entities/difficulty-calibration.entity';
import { Puzzle } from '../puzzles/entities/puzzle.entity';
import { Session, SessionStatus } from '../sessions/entities/session.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

const CALIBRATION_THRESHOLDS: Record<DifficultyLevel, { maxSolveRate: number; maxAvgHints: number; minAbandonRate: number }> = {
  Easy: { maxSolveRate: 0.6, maxAvgHints: 0.3, minAbandonRate: 0.4 },
  Medium: { maxSolveRate: 0.4, maxAvgHints: 0.6, minAbandonRate: 0.5 },
  Hard: { maxSolveRate: 0.2, maxAvgHints: 1.0, minAbandonRate: 0.6 },
};

const MIN_SESSIONS_FOR_CALIBRATION = 5;

@Injectable()
export class CalibrationService {
  private readonly logger = new Logger(CalibrationService.name);

  constructor(
    @InjectRepository(DifficultyCalibration)
    private readonly calibrationRepo: Repository<DifficultyCalibration>,
    @InjectRepository(Puzzle)
    private readonly puzzleRepo: Repository<Puzzle>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  computeCalibrationScore(
    solveRate: number,
    abandonRate: number,
    avgHintsUsed: number,
  ): number {
    const solveComponent = (1 - solveRate) * 40;
    const abandonComponent = abandonRate * 35;
    const hintComponent = Math.min(avgHintsUsed / 3, 1) * 25;
    return Math.round((solveComponent + abandonComponent + hintComponent) * 100) / 100;
  }

  recommendDifficulty(score: number): DifficultyLevel {
    if (score < 35) return 'Easy';
    if (score < 65) return 'Medium';
    return 'Hard';
  }

  normalizeDifficulty(raw: string): DifficultyLevel {
    const lower = raw.toLowerCase().trim();
    if (lower === 'easy') return 'Easy';
    if (lower === 'medium') return 'Medium';
    if (lower === 'hard') return 'Hard';
    return 'Medium';
  }

  async runCalibration(): Promise<DifficultyCalibration[]> {
    const puzzles = await this.puzzleRepo.find();
    const results: DifficultyCalibration[] = [];
    const autoApply = this.configService.get<string>('CALIBRATION_AUTO_APPLY', 'false') === 'true';

    for (const puzzle of puzzles) {
      const result = await this.calibratePuzzle(puzzle, autoApply);
      if (result) results.push(result);
    }

    this.logger.log(`Calibration complete: ${results.length} puzzle(s) evaluated`);
    return results;
  }

  async calibratePuzzle(puzzle: Puzzle, autoApply = false): Promise<DifficultyCalibration | null> {
    const sessions = await this.sessionRepo.find({
      where: { puzzleId: puzzle.id },
    });

    if (sessions.length < MIN_SESSIONS_FOR_CALIBRATION) {
      return null;
    }

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === SessionStatus.COMPLETED).length;
    const abandonedSessions = sessions.filter((s) => s.status === SessionStatus.ABANDONED).length;

    const solveRate = completedSessions / totalSessions;
    const abandonRate = abandonedSessions / totalSessions;

    const completedWithDuration = sessions.filter(
      (s) => s.status === SessionStatus.COMPLETED && s.completedAt,
    );
    const avgDurationSeconds =
      completedWithDuration.length > 0
        ? completedWithDuration.reduce(
            (sum, s) => sum + (s.completedAt!.getTime() - s.startedAt.getTime()) / 1000,
            0,
          ) / completedWithDuration.length
        : 0;

    const avgHintsUsed = sessions.reduce((sum, s) => sum + s.hintsUsed, 0) / totalSessions;

    const calibrationScore = this.computeCalibrationScore(solveRate, abandonRate, avgHintsUsed);
    const currentDifficulty = this.normalizeDifficulty(puzzle.difficulty);
    const recommendedDifficulty = this.recommendDifficulty(calibrationScore);

    const calibration = this.calibrationRepo.create({
      puzzleId: puzzle.id,
      totalSessions,
      completedSessions,
      abandonedSessions,
      solveRate: Math.round(solveRate * 10000) / 10000,
      abandonRate: Math.round(abandonRate * 10000) / 10000,
      avgDurationSeconds: Math.round(avgDurationSeconds * 100) / 100,
      avgHintsUsed: Math.round(avgHintsUsed * 100) / 100,
      calibrationScore,
      currentDifficulty,
      recommendedDifficulty,
      status: CalibrationStatus.PENDING,
    });

    const saved = await this.calibrationRepo.save(calibration);

    if (currentDifficulty !== recommendedDifficulty) {
      this.logger.warn(
        `Puzzle "${puzzle.title}" (${puzzle.id}): tagged "${currentDifficulty}" but data suggests "${recommendedDifficulty}" (score: ${calibrationScore})`,
      );

      await this.sendDivergenceNotification(puzzle, currentDifficulty, recommendedDifficulty, calibrationScore);

      if (autoApply) {
        await this.applyRecommendation(puzzle.id);
      }
    }

    return saved;
  }

  async findAll(): Promise<DifficultyCalibration[]> {
    return this.calibrationRepo.find({
      order: { evaluatedAt: 'DESC' },
      relations: { puzzle: true },
    });
  }

  async findByPuzzleId(puzzleId: string): Promise<DifficultyCalibration> {
    const calibration = await this.calibrationRepo.findOne({
      where: { puzzleId },
      order: { evaluatedAt: 'DESC' },
      relations: { puzzle: true },
    });
    if (!calibration) {
      throw new NotFoundException(`No calibration record found for puzzle ${puzzleId}`);
    }
    return calibration;
  }

  async applyRecommendation(puzzleId: string): Promise<Puzzle> {
    const calibration = await this.calibrationRepo.findOne({
      where: { puzzleId, status: CalibrationStatus.PENDING },
      order: { evaluatedAt: 'DESC' },
    });

    if (!calibration) {
      throw new NotFoundException(`No pending calibration found for puzzle ${puzzleId}`);
    }

    const puzzle = await this.puzzleRepo.findOne({ where: { id: puzzleId } });
    if (!puzzle) {
      throw new NotFoundException(`Puzzle ${puzzleId} not found`);
    }

    puzzle.difficulty = calibration.recommendedDifficulty;
    await this.puzzleRepo.save(puzzle);

    calibration.status = CalibrationStatus.APPLIED;
    await this.calibrationRepo.save(calibration);

    this.logger.log(
      `Applied difficulty change for "${puzzle.title}": "${calibration.currentDifficulty}" -> "${calibration.recommendedDifficulty}"`,
    );

    return puzzle;
  }

  async dismissRecommendation(puzzleId: string): Promise<DifficultyCalibration> {
    const calibration = await this.calibrationRepo.findOne({
      where: { puzzleId, status: CalibrationStatus.PENDING },
      order: { evaluatedAt: 'DESC' },
    });

    if (!calibration) {
      throw new NotFoundException(`No pending calibration found for puzzle ${puzzleId}`);
    }

    calibration.status = CalibrationStatus.DISMISSED;
    return this.calibrationRepo.save(calibration);
  }

  private async sendDivergenceNotification(
    puzzle: Puzzle,
    currentDifficulty: string,
    recommendedDifficulty: string,
    score: number,
  ): Promise<void> {
    try {
      const message =
        `Difficulty recalibration alert: Puzzle "${puzzle.title}" is tagged "${currentDifficulty}" ` +
        `but player data suggests "${recommendedDifficulty}" (calibration score: ${score}). ` +
        `Review at GET /admin/calibration.`;

      await this.notificationsService.create({
        userId: puzzle.authorId,
        type: NotificationType.DIFFICULTY_RECALIBRATED,
        message,
      });
    } catch (err) {
      this.logger.error('Failed to send calibration notification', err);
    }
  }
}
