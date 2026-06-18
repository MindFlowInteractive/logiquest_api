import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1718678400000 implements MigrationInterface {
  name = 'InitialSchema1718678400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create puzzles table
    await queryRunner.query(`
      CREATE TABLE "puzzles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" character varying NOT NULL,
        "difficulty" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_puzzles_id" PRIMARY KEY ("id")
      )
    `);

    // Create users table (auth User)
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Create user table (users User)
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'user',
        "isBanned" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
      )
    `);

    // Create sessions table (analytics Session)
    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "puzzleId" character varying NOT NULL,
        "duration" integer NOT NULL,
        "score" integer NOT NULL,
        "hintsUsed" integer NOT NULL,
        "completed" boolean NOT NULL DEFAULT false,
        "completedAt" TIMESTAMP,
        CONSTRAINT "PK_sessions_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_sessions_userId" ON "sessions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_sessions_puzzleId" ON "sessions" ("puzzleId")`);

    // Create session table (sessions Session)
    await queryRunner.query(`
      CREATE TABLE "session" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "status" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "endedAt" TIMESTAMP,
        CONSTRAINT "PK_session_id" PRIMARY KEY ("id")
      )
    `);

    // Create reward table (rewards Reward)
    await queryRunner.query(`
      CREATE TABLE "reward" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "amount" double precision NOT NULL,
        "distributedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reward_id" PRIMARY KEY ("id")
      )
    `);

    // Create audit_log table (audit AuditLog)
    await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" character varying NOT NULL,
        "performedBy" character varying NOT NULL,
        "targetId" character varying,
        "metadata" json,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log_id" PRIMARY KEY ("id")
      )
    `);

    // Create leaderboard_entry table (leaderboard LeaderboardEntry)
    await queryRunner.query(`
      CREATE TABLE "leaderboard_entry" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "playerId" character varying NOT NULL,
        "category" character varying,
        "totalScore" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" timestamp WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leaderboard_entry_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_leaderboard_entry_player_category" ON "leaderboard_entry" ("playerId", "category")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_leaderboard_entry_player_category"`);
    await queryRunner.query(`DROP TABLE "leaderboard_entry"`);
    await queryRunner.query(`DROP TABLE "audit_log"`);
    await queryRunner.query(`DROP TABLE "reward"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP INDEX "IDX_sessions_puzzleId"`);
    await queryRunner.query(`DROP INDEX "IDX_sessions_userId"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "puzzles"`);
  }
}
