import type { DatabasePinger } from '../pingers/database-pinger';
import { DatabaseHealthIndicator } from './database.health-indicator';

describe('DatabaseHealthIndicator', () => {
  const buildIndicator = (pinger: DatabasePinger) => new DatabaseHealthIndicator(pinger);

  it('reports the dependency as up when the ping succeeds', async () => {
    const indicator = buildIndicator({ ping: jest.fn().mockResolvedValue(undefined) });

    const result = await indicator.check();

    expect(result.db.status).toBe('up');
    expect(result.db.responseTime).toEqual(expect.any(Number));
  });

  it('reports the dependency as down with the error message when the ping fails', async () => {
    const indicator = buildIndicator({
      ping: jest.fn().mockRejectedValue(new Error('connection refused')),
    });

    const result = await indicator.check();

    expect(result.db.status).toBe('down');
    expect(result.db.message).toBe('connection refused');
  });

  it('never throws even when the pinger rejects with a non-Error value', async () => {
    const indicator = buildIndicator({ ping: jest.fn().mockRejectedValue('boom') });

    const result = await indicator.check();

    expect(result.db.status).toBe('down');
    expect(result.db.message).toBe('Database is unreachable');
  });
});
