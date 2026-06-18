import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseHealthIndicator } from './indicators/database.health-indicator';
import { DATABASE_PINGER } from './pingers/database-pinger';
import { TypeOrmDatabasePinger } from './pingers/typeorm-database.pinger';

/**
 * Health module exposing liveness/readiness probes and the supporting
 * indicators. The {@link DATABASE_PINGER} is bound to a TypeORM-backed default
 * that uses the application's global {@link DataSource}; swap this provider to
 * change how database connectivity is verified.
 */
@Module({
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthIndicator,
    { provide: DATABASE_PINGER, useClass: TypeOrmDatabasePinger },
  ],
})
export class HealthModule {}
