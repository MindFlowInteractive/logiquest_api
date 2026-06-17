import type { HealthIndicatorResult } from '../health.types';

/**
 * Base class for health indicators. Provides small helpers to build a
 * well-formed {@link HealthIndicatorResult} so concrete indicators only need
 * to implement the dependency-specific probe in {@link check}.
 *
 * Indicators must never throw: a failed probe is a normal outcome and should
 * be reported as `down` so the aggregator can return a structured 503 rather
 * than an unhandled 500.
 */
export abstract class HealthIndicator {
  /** Build a healthy result for `key`, optionally attaching diagnostic data. */
  protected up(key: string, data: Record<string, unknown> = {}): HealthIndicatorResult {
    return { [key]: { status: 'up', ...data } };
  }

  /** Build an unhealthy result for `key`, optionally attaching diagnostic data. */
  protected down(key: string, data: Record<string, unknown> = {}): HealthIndicatorResult {
    return { [key]: { status: 'down', ...data } };
  }

  /** Probe the dependency and report its health. Must not throw. */
  abstract check(): Promise<HealthIndicatorResult>;
}
