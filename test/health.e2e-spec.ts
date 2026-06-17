import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DATABASE_PINGER, type DatabasePinger } from '../src/health/pingers/database-pinger';

describe('Health endpoints (e2e)', () => {
  let app: INestApplication;
  const pinger: jest.Mocked<DatabasePinger> = { ping: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DATABASE_PINGER)
      .useValue(pinger)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => jest.resetAllMocks());

  describe('GET /health/live', () => {
    it('returns 200 while the process is running', async () => {
      const res = await request(app.getHttpServer()).get('/health/live').expect(200);

      expect(res.body).toMatchObject({ status: 'ok', info: {}, error: {}, details: {} });
      expect(typeof res.body.uptime).toBe('number');
      expect(typeof res.body.timestamp).toBe('string');
    });
  });

  describe('GET /health/ready', () => {
    it('returns 200 with the database listed under info when healthy', async () => {
      pinger.ping.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer()).get('/health/ready').expect(200);

      expect(res.body.status).toBe('ok');
      expect(res.body.info.db.status).toBe('up');
      expect(res.body.details.db.status).toBe('up');
      expect(res.body.error).toEqual({});
    });

    it('returns a structured 503 (not a plain 500) when the database is down', async () => {
      pinger.ping.mockRejectedValue(new Error('connection refused'));

      const res = await request(app.getHttpServer()).get('/health/ready').expect(503);

      expect(res.body.status).toBe('error');
      expect(res.body.error.db.status).toBe('down');
      expect(res.body.error.db.message).toBe('connection refused');
      expect(res.body.details.db.status).toBe('down');
    });
  });
});
