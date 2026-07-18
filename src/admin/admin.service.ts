import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { SessionStatus } from '../sessions/entities/session.entity';
import { Reward } from '../rewards/entities/reward.entity';
import { Puzzle } from '../puzzles/entities/puzzle.entity';
import { AuditService } from '../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationDto } from './dto/pagination.dto';
import { SessionFilterDto } from './dto/session-filter.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(Puzzle)
    private readonly puzzleRepository: Repository<Puzzle>,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getUsers(dto: PaginationDto) {
    const { page = 1, limit = 20 } = dto;
    const [data, total] = await this.userRepository.findAndCount({
      select: { id: true, email: true, role: true, isBanned: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async banUser(adminId: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    user.isBanned = true;
    await this.userRepository.save(user);
    await this.auditService.log('BAN_USER', adminId, userId);
  }

  async getSessions(dto: SessionFilterDto) {
    const { page = 1, limit = 20, status, startDate, endDate } = dto;
    const where: FindOptionsWhere<Session> = {};

    if (status) {
      where.status = status as SessionStatus;
    }
    if (startDate && endDate) {
      where.startedAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.startedAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.startedAt = LessThanOrEqual(new Date(endDate));
    }

    const [data, total] = await this.sessionRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { startedAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getStats() {
    const totalUsers = await this.userRepository.count();
    const totalSessions = await this.sessionRepository.count();
    const raw = await this.rewardRepository
      .createQueryBuilder('reward')
      .select('SUM(reward.amount)', 'sum')
      .getRawOne();
    const totalRewardsDistributed = Number(raw?.sum ?? 0);
    return { totalUsers, totalSessions, totalRewardsDistributed };
  }

  async getPendingSubmissions() {
    return this.puzzleRepository.find({
      where: { submissionStatus: 'pending' as any },
      relations: { category: true },
      order: { createdAt: 'ASC' },
    });
  }

  async approveSubmission(adminId: string, puzzleId: string) {
    const puzzle = await this.puzzleRepository.findOne({ where: { id: puzzleId } });
    if (!puzzle) {
      throw new NotFoundException(`Puzzle with id ${puzzleId} not found`);
    }

    puzzle.submissionStatus = 'approved' as any;
    await this.puzzleRepository.save(puzzle);

    // Give rewards and achievements
    this.eventEmitter.emit('reward.granted', {
      userId: puzzle.authorId,
      amount: 500,
      reason: 'Puzzle Submission Approved',
    });
    this.eventEmitter.emit('achievement.unlocked', {
      userId: puzzle.authorId,
      achievementId: 'contributor',
    });

    await this.auditService.log('APPROVE_PUZZLE_SUBMISSION', adminId, puzzleId);
    return puzzle;
  }

  async rejectSubmission(adminId: string, puzzleId: string, reason: string) {
    const puzzle = await this.puzzleRepository.findOne({ where: { id: puzzleId } });
    if (!puzzle) {
      throw new NotFoundException(`Puzzle with id ${puzzleId} not found`);
    }

    puzzle.submissionStatus = 'rejected' as any;
    puzzle.rejectionReason = reason;
    await this.puzzleRepository.save(puzzle);

    await this.auditService.log('REJECT_PUZZLE_SUBMISSION', adminId, puzzleId);
    return puzzle;
  }
}
