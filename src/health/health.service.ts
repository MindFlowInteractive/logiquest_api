import { Injectable } from '@nestjs/common';
import type {
  HealthCheckResult,
  HealthIndicatorResult,
  OverallStatus,
} from './health.types';
import { DatabaseHealthIndicator } from './indicators/database.health-indicator';

/**
 * Orchestrates the readiness and liveness checks.
 *
 * - **Liveness** answers "is the process running?" and intentionally has no
 *   dependency checks so a transient dependency outage never causes the
 *   orchestrator to kill an otherwise-healthy process.
 * - **Readiness** answers "can the service handle traffic?" and therefore
 *   probes external dependencies (currently the database; cache and others can
 *   be added by registering further indicators).
 */
@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseHealthIndicator) {}

  async checkLiveness(): Promise<HealthCheckResult> {
    return this.aggregate([]);
  }

  async checkReadiness(): Promise<HealthCheckResult> {
    const results = await Promise.all([this.database.check()]);
    return this.aggregate(results);
  }

  /**
   * Merges indicator results into the structured response contract, splitting
   * dependencies into healthy (`info`) and unhealthy (`error`) buckets and
   * deriving the overall status.
   */
  private aggregate(results: HealthIndicatorResult[]): HealthCheckResult {
    const details: HealthIndicatorResult = Object.assign({}, ...results);

    const info: HealthIndicatorResult = {};
    const error: HealthIndicatorResult = {};
    for (const [key, value] of Object.entries(details)) {
      (value.status === 'up' ? info : error)[key] = value;
    }

    const status: OverallStatus = Object.keys(error).length === 0 ? 'ok' : 'error';

    return {
      status,
      info,
      error,
      details,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
