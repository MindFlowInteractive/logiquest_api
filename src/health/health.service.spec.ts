import { Test } from '@nestjs/testing';
import { HealthService } from './health.service';
import { DatabaseHealthIndicator } from './indicators/database.health-indicator';

describe('HealthService', () => {
  const buildService = async (dbCheck: jest.Mock) => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: DatabaseHealthIndicator, useValue: { check: dbCheck } },
      ],
    }).compile();

    return moduleRef.get(HealthService);
  };

  describe('checkLiveness', () => {
    it('always returns ok with the documented response structure', async () => {
      const service = await buildService(jest.fn());

      const result = await service.checkLiveness();

      expect(result).toEqual({
        status: 'ok',
        info: {},
        error: {},
        details: {},
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      });
      // Liveness must not consult dependencies.
    });
  });

  describe('checkReadiness', () => {
    it('returns ok and lists the dependency under info when the database is healthy', async () => {
      const service = await buildService(
        jest.fn().mockResolvedValue({ db: { status: 'up', responseTime: 1 } }),
      );

      const result = await service.checkReadiness();

      expect(result.status).toBe('ok');
      expect(result.info).toEqual({ db: { status: 'up', responseTime: 1 } });
      expect(result.error).toEqual({});
      expect(result.details.db.status).toBe('up');
    });

    it('returns error and lists the dependency under error when the database is down', async () => {
      const service = await buildService(
        jest.fn().mockResolvedValue({ db: { status: 'down', message: 'unreachable' } }),
      );

      const result = await service.checkReadiness();

      expect(result.status).toBe('error');
      expect(result.error).toEqual({ db: { status: 'down', message: 'unreachable' } });
      expect(result.info).toEqual({});
      expect(result.details.db.status).toBe('down');
    });
  });
});
