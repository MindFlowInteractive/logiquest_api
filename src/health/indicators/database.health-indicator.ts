import { Inject, Injectable } from '@nestjs/common';
import type { HealthIndicatorResult } from '../health.types';
import { DATABASE_PINGER, type DatabasePinger } from '../pingers/database-pinger';
import { HealthIndicator } from './health-indicator';

/**
 * Reports the health of the database dependency under the `db` key. The actual
 * connectivity probe is delegated to an injected {@link DatabasePinger}, which
 * keeps this indicator independent of the underlying driver and trivially
 * testable.
 */
@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  static readonly key = 'db';

  constructor(@Inject(DATABASE_PINGER) private readonly pinger: DatabasePinger) {
    super();
  }

  async check(): Promise<HealthIndicatorResult> {
    const start = Date.now();
    try {
      await this.pinger.ping();
      return this.up(DatabaseHealthIndicator.key, { responseTime: Date.now() - start });
    } catch (error) {
      return this.down(DatabaseHealthIndicator.key, {
        message: error instanceof Error ? error.message : 'Database is unreachable',
        responseTime: Date.now() - start,
      });
    }
  }
}
