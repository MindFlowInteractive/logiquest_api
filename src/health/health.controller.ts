import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import type { HealthCheckResult } from './health.types';
import { HealthService } from './health.service';

/**
 * Exposes Kubernetes-style health probes. The controller is marked `@Public()`
 * so it is excluded from JWT authentication once a global auth guard is added —
 * orchestrators and load balancers must reach these endpoints unauthenticated.
 */
@Public()
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
