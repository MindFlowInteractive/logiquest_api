import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Represents a single recorded event that occurred during a puzzle session.
 * Events are appended as the session progresses and can be replayed in order
 * to reconstruct the entire session timeline.
 */
export enum ReplayEventType {
  SESSION_STARTED = 'SESSION_STARTED',
  HINT_REVEALED = 'HINT_REVEALED',
  SOLUTION_SUBMITTED = 'SOLUTION_SUBMITTED',
  SESSION_COMPLETED = 'SESSION_COMPLETED',
  SESSION_ABANDONED = 'SESSION_ABANDONED',
}

@Entity('session_replay_events')
@Index(['sessionId', 'sequence'])
export class SessionReplayEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** The session this event belongs to */
  @Column()
  @Index()
  sessionId!: string;

  /** The user who owns the session */
  @Column()
  userId!: string;

  /** The puzzle being attempted */
  @Column()
  puzzleId!: string;

  /** Monotonically increasing counter within a session (1, 2, 3, ...) */
  @Column({ type: 'int' })
  sequence!: number;

  /** Type of event recorded */
  @Column({ type: 'varchar', length: 64 })
  eventType!: ReplayEventType;

  /** Arbitrary JSON payload for event-specific data */
  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, unknown> | null;

  /** Wall-clock timestamp of when the event occurred */
  @CreateDateColumn()
  occurredAt!: Date;
}
