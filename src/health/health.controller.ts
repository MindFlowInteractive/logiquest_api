import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import type { HealthCheckResult } from './health.types';
import { HealthService } from './health.service';

/**
 * Exposes Kubernetes-style health probes.
 *
 * - `@Public()` excludes the routes from JWT authentication once a global auth
 *   guard is added — orchestrators and load balancers must reach these
 *   endpoints unauthenticated.
 * - `@SkipThrottle()` exempts them from the global rate limiter, since probes
 *   are polled frequently and must not be throttled out of service.
 */
@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /**
   * Liveness probe: returns 200 as long as the process can serve requests.
   * Used by orchestrators to decide whether to restart the container.
   */
  @Get('live')
  @HttpCode(HttpStatus.OK)
  liveness(): Promise<HealthCheckResult> {
    return this.health.checkLiveness();
  }

  /**
   * Readiness probe: returns 200 when all dependencies are healthy, or a
   * structured 503 (Service Unavailable) when any dependency is down so the
   * service is taken out of rotation rather than served a generic 500.
   */
  @Get('ready')
  async readiness(): Promise<HealthCheckResult> {
    const result = await this.health.checkReadiness();
    if (result.status !== 'ok') {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }
}
