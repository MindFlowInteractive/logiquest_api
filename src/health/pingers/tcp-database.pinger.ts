import { Injectable, Optional } from '@nestjs/common';
import { Socket } from 'node:net';
import type { DatabasePinger } from './database-pinger';

interface DatabaseTarget {
  host: string;
  port: number;
}

const DEFAULT_TIMEOUT_MS = 2_000;

/**
 * Default {@link DatabasePinger} that verifies connectivity by opening a TCP
 * socket to the configured database host/port. This is intentionally
 * persistence-agnostic: it confirms the database is reachable without
 * depending on an ORM or driver, which is sufficient until a real data layer
 * lands (at which point this should be replaced by a `SELECT 1` style probe).
 *
 * Configuration is read from the environment:
 * - `DATABASE_URL` (e.g. `postgres://user:pass@host:5432/db`), or
 * - `DB_HOST` / `DB_PORT`.
 *
 * If no database is configured, the ping fails with a clear message so
 * readiness correctly reports the dependency as unconfigured rather than
 * silently claiming health.
 */
@Injectable()
export class TcpDatabasePinger implements DatabasePinger {
  private readonly timeoutMs: number;

  // `@Optional()` so Nest does not try to resolve the primitive `number` from
  // the container; the default applies when constructed by DI.
  constructor(
    @Optional() timeoutMs: number = Number(process.env.DB_HEALTH_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  ) {
    this.timeoutMs = timeoutMs;
  }

  async ping(): Promise<void> {
    const target = this.resolveTarget();
    if (!target) {
      throw new Error(
        'Database connection is not configured (set DATABASE_URL or DB_HOST/DB_PORT)',
      );
    }
    await this.tcpConnect(target);
  }

  private resolveTarget(): DatabaseTarget | null {
    const url = process.env.DATABASE_URL;
    if (url) {
      try {
        const parsed = new URL(url);
        return {
          host: parsed.hostname,
          port: Number(parsed.port) || this.defaultPortForProtocol(parsed.protocol),
        };
      } catch {
        // Fall through to discrete host/port vars on a malformed URL.
      }
    }

    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT);
    if (host && port) {
      return { host, port };
    }

    return null;
  }

  private defaultPortForProtocol(protocol: string): number {
    switch (protocol) {
      case 'postgres:':
      case 'postgresql:':
        return 5432;
      case 'mysql:':
        return 3306;
      case 'mongodb:':
        return 27017;
      default:
        return 0;
    }
  }

  private tcpConnect({ host, port }: DatabaseTarget): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const socket = new Socket();

      const fail = (error: Error) => {
        socket.destroy();
        reject(error);
      };

      socket.setTimeout(this.timeoutMs);
      socket.once('error', fail);
      socket.once('timeout', () =>
        fail(new Error(`Database connection to ${host}:${port} timed out after ${this.timeoutMs}ms`)),
      );
      socket.connect(port, host, () => {
        socket.end();
        resolve();
      });
    });
  }
}
