/**
 * Injection token for the {@link DatabasePinger}. Using a token keeps the
 * health indicator decoupled from any concrete persistence layer, so the
 * default TCP implementation can be swapped for a real query-based check (e.g.
 * `SELECT 1` via TypeORM/Prisma) once a database module is introduced, without
 * touching the health module.
 */
export const DATABASE_PINGER = Symbol('DATABASE_PINGER');

/**
 * Verifies that the database is reachable. Implementations resolve when the
 * database responds and reject (with a descriptive error) otherwise.
 */
export interface DatabasePinger {
  ping(): Promise<void>;
}
