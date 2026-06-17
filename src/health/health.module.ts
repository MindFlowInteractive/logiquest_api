import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseHealthIndicator } from './indicators/database.health-indicator';
import { DATABASE_PINGER } from './pingers/database-pinger';
import { TcpDatabasePinger } from './pingers/tcp-database.pinger';

/**
 * Health module exposing liveness/readiness probes and the supporting
 * indicators. The {@link DATABASE_PINGER} is bound to a TCP-based default; to
 * use a real query-based probe, override this provider from the persistence
 * module once it exists.
 */
@Module({
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthIndicator,
    { provide: DATABASE_PINGER, useClass: TcpDatabasePinger },
  ],
})
export class HealthModule {}
