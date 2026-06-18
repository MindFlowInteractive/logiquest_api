import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { DatabasePinger } from './database-pinger';

/**
 * Default {@link DatabasePinger} backed by the application's TypeORM
 * {@link DataSource}. It verifies connectivity by issuing a trivial `SELECT 1`
 * against the live connection pool, which exercises the full driver path
 * (socket + auth + query) rather than just TCP reachability.
 *
 * The {@link DataSource} is resolved from the global TypeORM connection
 * configured in `AppModule`, so no additional wiring is required.
 */
@Injectable()
export class TypeOrmDatabasePinger implements DatabasePinger {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async ping(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      throw new Error('Database connection is not initialized');
    }
    await this.dataSource.query('SELECT 1');
  }
}
