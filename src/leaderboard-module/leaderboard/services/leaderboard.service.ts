// src/leaderboard/services/leaderboard.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { LeaderboardRepository } from '../repositories/leaderboard.repository';
import { LeaderboardEntryRepository } from '../repositories/leaderboard-entry.repository';
import { LeaderboardSnapshotRepository } from '../repositories/leaderboard-snapshot.repository';
import { Leaderboard, ScoringModel, ResetPeriod } from '../entities/leaderboard.entity';
import { LeaderboardEntry } from '../entities/leaderboard-entry.entity';
import { LeaderboardSnapshot } from '../entities/leaderboard-snapshot.entity';
import { CreateLeaderboardDto } from '../dtos/create-leaderboard.dto';
import { UpdateLeaderboardDto } from '../dtos/update-leaderboard.dto';
import { SubmitScoreDto } from '../dtos/submit-score.dto';
import { QueryLeaderboardDto, LeaderboardTimeFrame } from '../dtos/query-leaderboard.dto';
import { Cron } from '@nestjs/schedule';
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(LeaderboardRepository)
    private leaderboardRepository: LeaderboardRepository,
    @InjectRepository(LeaderboardEntryRepository)
    private entryRepository: LeaderboardEntryRepository,
    @InjectRepository(LeaderboardSnapshotRepository)
    private snapshotRepository: LeaderboardSnapshotRepository,
    private connection: Connection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Create a new leaderboard
  async createLeaderboard(dto: CreateLeaderboardDto): Promise<Leaderboard> {
    const leaderboard = this.leaderboardRepository.create({
      ...dto,
      // Set next reset date based on reset period
      nextResetDate: this.calculateNextResetDate(dto.resetPeriod || ResetPeriod.NEVER),
    });

    return this.leaderboardRepository.save(leaderboard);
  }

  // Get all leaderboards with pagination and filters
  async findAllLeaderboards(query: QueryLeaderboardDto): Promise<{ data: Leaderboard[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, category } = query;
    
    const [leaderboards, total] = await this.leaderboardRepository.findActiveLeaderboards(
      page,
      limit,
      category
    );

    return {
      data: leaderboards,
      total,
      page,
      limit,
    };
  }

  // Get a specific leaderboard by ID
  async findLeaderboardById(id: string): Promise<Leaderboard> {
    const leaderboard = await this.leaderboardRepository.findOne({ 
      where: { id },
      relations: ['entries'],
    });
    
    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with ID "${id}" not found`);
    }
    
    return leaderboard;
  }

  // Update a leaderboard
  async updateLeaderboard(id: string, dto: UpdateLeaderboardDto): Promise<Leaderboard> {
    const leaderboard = await this.findLeaderboardById(id);
    
    // If reset period is changing, recalculate next reset date
    if (dto.resetPeriod && dto.resetPeriod !== leaderboard.resetPeriod) {
      dto.nextResetDate = this.calculateNextResetDate(dto.resetPeriod);
    }
    
    Object.assign(leaderboard, dto);
    return this.leaderboardRepository.save(leaderboard);
  }

  // Delete a leaderboard
  async deleteLeaderboard(id: string): Promise<void> {
    const leaderboard = await this.findLeaderboardById(id);
    
    // Soft delete by marking as archived and inactive
    leaderboard.isArchived = true;
    leaderboard.isActive = false;
    
    await this.leaderboardRepository.save(leaderboard);
  }

  // Hard delete a leaderboard (admin only)
  async hardDeleteLeaderboard(id: string): Promise<void> {
    const result = await this.leaderboardRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Leaderboard with ID "${id}" not found`);
    }
  }

  // Submit a score to a leaderboard
  async submitScore(
    leaderboardId: string,
    userId: string,
    username: string,
    dto: SubmitScoreDto
  ): Promise<LeaderboardEntry> {
    const leaderboard = await this.findLeaderboardById(leaderboardId);
    
    if (!leaderboard.isActive) {
      throw new BadRequestException('Cannot submit score to an inactive leaderboard');
    }
    
    if (dto.score < leaderboard.minimumScoreThreshold) {
      throw new BadRequestException(`Score is below the minimum threshold of ${leaderboard.minimumScoreThreshold}`);
    }
    
    // Start a transaction for score validation and update
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Check if user has already submitted a score to this leaderboard
      const existingEntry = await this.entryRepository.findOne({
        where: { leaderboardId, userId }
      });
      
      // Check if user has reached entry limit
      if (existingEntry) {
        const userEntryCount = await this.entryRepository.count({
          where: { leaderboardId, userId }
        });
        
        if (userEntryCount >= leaderboard.entryLimitPerUser) {
          // For highest score leaderboards, only update if new score is higher
          if (leaderboard.scoringModel === ScoringModel.HIGHEST_SCORE || 
              leaderboard.scoringModel === ScoringModel.HIGHEST_ACCURACY) {
            if (dto.score <= existingEntry.score) {
              throw new BadRequestException('New score is not higher than your existing score');
            }
          } 
          // For lowest score leaderboards, only update if new score is lower
          else if (dto.score >= existingEntry.score) {
            throw new BadRequestException('New score is not lower than your existing score');
          }
          
          // Update existing entry
          Object.assign(existingEntry, {
            score: dto.score,
            completionTime: dto.completionTime,
            metadata: { ...existingEntry.metadata, ...dto.metadata },
            isVerified: this.verifyScore(dto.score, dto.metadata, leaderboard),
          });
          
          await this.entryRepository.save(existingEntry);
          await this.entryRepository.updateRankings(leaderboardId, leaderboard.scoringModel);
          
          await queryRunner.commitTransaction();
          
          // Clear cache for this leaderboard
          await this.cacheManager.del(`leaderboard:${leaderboardId}:rankings`);
          
          return existingEntry;
        }
      }
      
      // Create new entry
      const newEntry = this.entryRepository.create({
        leaderboardId,
        userId,
        username,
        score: dto.score,
        completionTime: dto.completionTime,
        metadata: dto.metadata,
        isVerified: this.verifyScore(dto.score, dto.metadata, leaderboard),
      });
      
      await this.entryRepository.save(newEntry);
      
      // Update all rankings for this leaderboard
      await this.entryRepository.updateRankings(leaderboardId, leaderboard.scoringModel);
      
      await queryRunner.commitTransaction();
      
      // Clear cache for this leaderboard
      await this.cacheManager.del(`leaderboard:${leaderboardId}:rankings`);
      
      return newEntry;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Get rankings for a leaderboard with pagination
  async getLeaderboardRankings(
    leaderboardId: string,
    query: QueryLeaderboardDto
  ): Promise<{ data: LeaderboardEntry[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, timeFrame } = query;
    
    const leaderboard = await this.findLeaderboardById(leaderboardId);
    
    // Try to get from cache first
    const cacheKey = `leaderboard:${leaderboardId}:rankings:${page}:${limit}:${timeFrame || 'all_time'}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    
    if (cachedData) {
      return cachedData as { data: LeaderboardEntry[]; total: number; page: number; limit: number };
    }
    
    // Determine date filter based on timeFrame
    let fromDate: Date | undefined;
    if (timeFrame) {
      const now = new Date();
      switch (timeFrame) {
        case LeaderboardTimeFrame.TODAY:
          fromDate = startOfDay(now);
          break;
        case LeaderboardTimeFrame.THIS_WEEK:
          fromDate = startOfWeek(now);
          break;
        case LeaderboardTimeFrame.THIS_MONTH:
          fromDate = startOfMonth(now);
          break;
        default:
          // ALL_TIME - no filter
          break;
      }
    }
    
    // Build query
    const queryBuilder = this.entryRepository.createQueryBuilder('entry')
      .where('entry.leaderboardId = :leaderboardId', { leaderboardId });
      
    if (fromDate) {
      queryBuilder.andWhere('entry.createdAt >= :fromDate', { fromDate });
    }
    
    // Order by score based on scoring model
    if (leaderboard.scoringModel === ScoringModel.HIGHEST_SCORE || 
        leaderboard.scoringModel === ScoringModel.HIGHEST_ACCURACY) {
      queryBuilder.orderBy('entry.score', 'DESC');
    } else {
      queryBuilder.orderBy('entry.score', 'ASC');
    }
    
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);
      
    const [entries, total] = await queryBuilder.getManyAndCount();
    
    const result = {
      data: entries,
      total,
      page,
      limit,
    };
    
    // Store in cache for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300000);
    
    return result;
  }

  // Get top rankings for a leaderboard
  async getTopRankings(leaderboardId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const leaderboard = await this.findLeaderboardById(leaderboardId);
    
    const cacheKey = `leaderboard:${leaderboardId}:top:${limit}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    
    if (cachedData) {
      return cachedData as LeaderboardEntry[];
    }
    
    const entries = await this.entryRepository.findTopRankings(
      leaderboardId,
      limit,
      leaderboard.scoringModel
    );
    
    // Store in cache for 5 minutes
    await this.cacheManager.set(cacheKey, entries, 300000);
    
    return entries;
  }

  // Get rankings around current user
  async getRankingsAroundUser(
    leaderboardId: string,
    userId: string,
    range: number = 5
  ): Promise<{ 
    userEntry: LeaderboardEntry | null; 
    rankings: LeaderboardEntry[]; 
    userPosition: { rank: number; percentile: number; total: number }; 
  }> {
    const leaderboard = await this.findLeaderboardById(leaderboardId);
    
    // Get user's entry
    const userEntry = await this.entryRepository.findOne({
      where: { leaderboardId, userId }
    });
    
    if (!userEntry) {
      return { 
        userEntry: null, 
        rankings: await this.getTopRankings(leaderboardId, range * 2),
        userPosition: { rank: 0, percentile: 0, total: 0 }
      };
    }
    
    // Get user position
    const userPosition = await this.entryRepository.findUserPosition(
      leaderboardId,
      userId,
      leaderboard.scoringModel
    );
    
    // Get rankings around user
    const rankings = await this.entryRepository.findRankingsAroundUser(
      leaderboardId,
      userId,
      leaderboard.scoringModel,
      range
    );
    
    return { userEntry, rankings, userPosition };
  }

  // Get user rankings across all leaderboards
  async getUserRankings(userId: string): Promise<{ leaderboardId: string; leaderboardName: string; entry: LeaderboardEntry }[]> {
    const entries = await this.entryRepository.createQueryBuilder('entry')
      .leftJoinAndSelect('entry.leaderboard', 'leaderboard')
      .where('entry.userId = :userId', { userId })
      .andWhere('leaderboard.isActive = :isActive', { isActive: true })
      .getMany();
      
    return entries.map(entry => ({
      leaderboardId: entry.leaderboardId,
      leaderboardName: entry.leaderboard.name,
      entry,
    }));
  }

  // Create a leaderboard snapshot
  async createLeaderboardSnapshot(
    leaderboardId: string,
    snapshotType: 'daily' | 'weekly' | 'monthly' | 'manual'
  ): Promise<LeaderboardSnapshot> {
    const leaderboard = await this.findLeaderboardById(leaderboardId);
    
    // Get current rankings
    const entries = await this.entryRepository.find({
      where: { leaderboardId },
      order: {
        rank: 'ASC',
      },
    });
    
    // Format data for snapshot
    const snapshotData = entries.map(entry => ({
      userId: entry.userId,
      username: entry.username,
      score: entry.score,
      rank: entry.rank,
      percentile: entry.percentile,
    }));
    
    // Save snapshot
    return this.snapshotRepository.createSnapshot(
      leaderboardId,
      snapshotData,
      snapshotType
    );
  }

  // Get leaderboard history (snapshots)
  async getLeaderboardHistory(
    leaderboardId: string,
    snapshotType?: 'daily' | 'weekly' | 'monthly' | 'manual'
  ): Promise<LeaderboardSnapshot[]> {
    const leaderboard = await this.findLeaderboardById(leaderboardId);
    
    const queryBuilder = this.snapshotRepository.createQueryBuilder('snapshot')
      .where('snapshot.leaderboardId = :leaderboardId', { leaderboardId })
      .orderBy('snapshot.snapshotDate', 'DESC')
      .take(10);
      
    if (snapshotType) {
      queryBuilder.andWhere('snapshot.snapshotType = :snapshotType', { snapshotType });
    }
    
    return queryBuilder.getMany();
  }

  // Get leaderboard statistics
  async getLeaderboardStatistics(leaderboardId: string): Promise<{
    totalEntries: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    recentActivityCount: number;
  }> {
    const leaderboard = await this.findLeaderboardById(leaderboardId);
    
    const result = await this.entryRepository.createQueryBuilder('entry')
      .select('COUNT(*)', 'totalEntries')
      .addSelect('AVG(entry.score)', 'averageScore')
      .addSelect('MAX(entry.score)', 'highestScore')
      .addSelect('MIN(entry.score)', 'lowestScore')
      .where('entry.leaderboardId = :leaderboardId', { leaderboardId })
      .getRawOne();
      
    // Get recent activity (last 24 hours)
    const yesterday = subDays(new Date(), 1);
    const recentActivityCount = await this.entryRepository.count({
      where: {
        leaderboardId,
        createdAt: MoreThanOrEqual(yesterday),
      },
    });
    
    return {
      totalEntries: parseInt(result.totalEntries, 10) || 0,
      averageScore: parseFloat(result.averageScore) || 0,
      highestScore: parseFloat(result.highestScore) || 0,
      lowestScore: parseFloat(result.lowestScore) || 0,
      recentActivityCount,
    };
  }

  // Recalculate all rankings for a leaderboard
  async recalculateLeaderboard(leaderboardId: string): Promise<void> {
    const leaderboard = await this.findLeaderboardById(leaderboardId);
    
    await this.entryRepository.updateRankings(leaderboardId, leaderboard.scoringModel);
    
    // Clear cache for this leaderboard
    await this.cacheManager.del(`leaderboard:${leaderboardId}:rankings`);
    await this.cacheManager.del(`leaderboard:${leaderboardId}:top`);
  }

  // Scheduled tasks
  @Cron('0 0 * * * *') // Run every hour
  async handleScheduledTasks() {
    // Schedule leaderboard resets
    await this.leaderboardRepository.scheduleLeaderboardResets();
    
    // Create daily snapshots at midnight
    if (new Date().getHours() === 0) {
      const leaderboards = await this.leaderboardRepository.find({
        where: { isActive: true, isArchived: false }
      });
      
      for (const leaderboard of leaderboards) {
        await this.createLeaderboardSnapshot(leaderboard.id, 'daily');
      }
    }
  }

  // Reset a leaderboard
  async resetLeaderboard(leaderboardId: string): Promise<void> {
    const leaderboard = await this.findLeaderboardById(leaderboardId);
    
    // Create a snapshot before resetting
    await this.createLeaderboardSnapshot(leaderboardId, 'manual');
    
    // Delete all entries
    await this.entryRepository.delete({ leaderboardId });
    
    // Update leaderboard reset dates
    leaderboard.lastResetDate = new Date();
    leaderboard.nextResetDate = this.calculateNextResetDate(leaderboard.resetPeriod);
    
    await this.leaderboardRepository.save(leaderboard);
    
    // Clear cache
    await this.cacheManager.del(`leaderboard:${leaderboardId}:rankings`);
    await this.cacheManager.del(`leaderboard:${leaderboardId}:top`);
  }

  // Helper method to verify scores (anti-cheat)
  private verifyScore(score: number, metadata: Record<string, any> = {}, leaderboard: Leaderboard): boolean {
    // Basic verification checks
    
    // 1. Check for abnormally high scores
    if (score > 1000000000) { // Example threshold
      return false;
    }
    
    // 2. Check if metadata contains required anti-cheat info
    if (!metadata.clientTimestamp || !metadata.gameSession) {
      return false;
    }
    
    // 3. Check for time consistency
    const submissionTime = new Date().getTime();
    const clientTime = new Date(metadata.clientTimestamp).getTime();
    
    // If client time is more than 5 minutes off, reject
    if (Math.abs(submissionTime - clientTime) > 300000) {
      return false;
    }
    
    // 4. Verify completion time if applicable
    if (leaderboard.scoringModel === ScoringModel.FASTEST_COMPLETION && 
        (!metadata.startTime || !metadata.endTime)) {
      return false;
    }
    
    // Additional checks could be added here based on your game's specific needs
    
    return true;
  }

  // Helper to calculate next reset date based on period
  private calculateNextResetDate(resetPeriod: ResetPeriod): Date | null {
    const now = new Date();
    
    switch (resetPeriod) {
      case ResetPeriod.DAILY:
        return startOfDay(addDays(now, 1));
      case ResetPeriod.WEEKLY:
        return startOfWeek(addWeeks(now, 1));
      case ResetPeriod.MONTHLY:
        return startOfMonth(addMonths(now, 1));
      default:
        return null; // NEVER reset
    }
  }
}