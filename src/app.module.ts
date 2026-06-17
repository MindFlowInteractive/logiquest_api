import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Session } from './sessions/entities/session.entity';
import { Reward } from './rewards/entities/reward.entity';
import { AuditLog } from './audit/entities/audit-log.entity';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Session, Reward, AuditLog],
      synchronize: true,
    }),
    AuthModule,
    AdminModule,
    AuditModule,
  ],
})
export class AppModule {}
