import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(action: string, performedBy: string, targetId?: string, metadata?: object): Promise<void> {
    const log = this.auditLogRepository.create({
      action,
      performedBy,
      targetId,
      metadata,
    });
    await this.auditLogRepository.save(log);
  }
}
