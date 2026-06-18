import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { SessionStatus } from '../sessions/entities/session.entity';
import { Reward } from '../rewards/entities/reward.entity';
import { AuditService } from '../audit/audit.service';
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
    private readonly auditService: AuditService,
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
}
