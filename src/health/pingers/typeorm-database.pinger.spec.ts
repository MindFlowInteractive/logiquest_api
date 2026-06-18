import { DataSource } from 'typeorm';
import { TypeOrmDatabasePinger } from './typeorm-database.pinger';

describe('TypeOrmDatabasePinger', () => {
  const buildPinger = (dataSource: Partial<DataSource>) =>
    new TypeOrmDatabasePinger(dataSource as DataSource);

  it('resolves when the connection is initialized and the query succeeds', async () => {
    const query = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const pinger = buildPinger({ isInitialized: true, query });

    await expect(pinger.ping()).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('rejects when the data source is not initialized', async () => {
    const query = jest.fn();
    const pinger = buildPinger({ isInitialized: false, query });

    await expect(pinger.ping()).rejects.toThrow(/not initialized/i);
    expect(query).not.toHaveBeenCalled();
  });

  it('propagates the error when the query fails', async () => {
    const pinger = buildPinger({
      isInitialized: true,
      query: jest.fn().mockRejectedValue(new Error('connection terminated')),
    });

    await expect(pinger.ping()).rejects.toThrow('connection terminated');
  });
});
