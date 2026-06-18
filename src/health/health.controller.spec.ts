import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import type { HealthCheckResult } from './health.types';

describe('HealthController', () => {
  const buildController = async (service: Partial<HealthService>) => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: service }],
    }).compile();

    return moduleRef.get(HealthController);
  };

  it('returns the liveness payload', async () => {
    const payload = { status: 'ok' } as HealthCheckResult;
    const controller = await buildController({
      checkLiveness: jest.fn().mockResolvedValue(payload),
    });

    await expect(controller.liveness()).resolves.toBe(payload);
  });

  it('returns the readiness payload when healthy', async () => {
    const payload = { status: 'ok' } as HealthCheckResult;
    const controller = await buildController({
      checkReadiness: jest.fn().mockResolvedValue(payload),
    });

    await expect(controller.readiness()).resolves.toBe(payload);
  });

  it('throws a 503 carrying the structured payload when a dependency is down', async () => {
    const payload = {
      status: 'error',
      error: { db: { status: 'down', message: 'unreachable' } },
    } as unknown as HealthCheckResult;
    const controller = await buildController({
      checkReadiness: jest.fn().mockResolvedValue(payload),
    });

    await expect(controller.readiness()).rejects.toMatchObject({
      // ServiceUnavailableException -> HTTP 503 with the structured body.
      status: 503,
      response: payload,
    });
    await expect(controller.readiness()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
