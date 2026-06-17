/** Status of an individual dependency. */
export type DependencyStatus = 'up' | 'down';

/** Aggregate status of a health check. */
export type OverallStatus = 'ok' | 'error';

/**
 * Health information for a single dependency. The `status` field is always
 * present; indicators may attach arbitrary diagnostic detail (e.g.
 * `responseTime`, `message`) alongside it.
 */
export interface DependencyHealth {
  status: DependencyStatus;
  [detail: string]: unknown;
}

/**
 * The result produced by a single health indicator, keyed by dependency name
 * (e.g. `{ db: { status: 'up' } }`). Modelled after `@nestjs/terminus` so the
 * module can migrate to it later without changing the response contract.
 */
export type HealthIndicatorResult = Record<string, DependencyHealth>;

/**
 * The structured payload returned by the health endpoints.
 *
 * - `info`    — dependencies that are healthy.
 * - `error`   — dependencies that are unhealthy.
 * - `details` — every dependency, regardless of status.
 */
export interface HealthCheckResult {
  status: OverallStatus;
  info: HealthIndicatorResult;
  error: HealthIndicatorResult;
  details: HealthIndicatorResult;
  uptime: number;
  timestamp: string;
}
