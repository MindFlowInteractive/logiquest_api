import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './database/database.module';
import { EventService } from './events/event.service';

import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { SecurityModule } from './security/security.module';
import { HealthModule } from './health/health.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { CategoriesModule } from './categories/categories.module';
import { PuzzlesModule } from './puzzles/puzzles.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    // Register BullMQ globally with Redis connection from env vars
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', undefined),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AdminModule,
    AuditModule,
    SecurityModule,
    HealthModule,
    CategoriesModule,
    PuzzlesModule,
    EmailModule,
  ],
  providers: [EventService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Log every inbound request across all routes.
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
