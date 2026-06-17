import { AddressInfo, createServer, Server } from 'node:net';
import { TcpDatabasePinger } from './tcp-database.pinger';

describe('TcpDatabasePinger', () => {
  const ENV_KEYS = ['DATABASE_URL', 'DB_HOST', 'DB_PORT'] as const;
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
  });

  it('rejects with a descriptive error when no database is configured', async () => {
    const pinger = new TcpDatabasePinger();

    await expect(pinger.ping()).rejects.toThrow(/not configured/i);
  });

  it('resolves when a TCP connection to the configured host/port succeeds', async () => {
    const server = await listen();
    const { port } = server.address() as AddressInfo;
    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = String(port);

    try {
      await expect(new TcpDatabasePinger().ping()).resolves.toBeUndefined();
    } finally {
      await close(server);
    }
  });

  it('rejects when the database cannot be reached', async () => {
    // Reserve a port, then close it so the connection is refused.
    const server = await listen();
    const { port } = server.address() as AddressInfo;
    await close(server);

    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = String(port);

    await expect(new TcpDatabasePinger().ping()).rejects.toThrow();
  });
});

function listen(): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}
