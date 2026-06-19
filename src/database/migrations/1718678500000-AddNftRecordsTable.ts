import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNftRecordsTable1718678500000 implements MigrationInterface {
  name = 'AddNftRecordsTable1718678500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "nft_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "mintId" character varying NOT NULL,
        "userId" character varying NOT NULL,
        "achievementId" character varying NOT NULL,
        "txHash" character varying NOT NULL,
        "chain" character varying NOT NULL,
        "mintedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_nft_records_mintId" UNIQUE ("mintId"),
        CONSTRAINT "PK_nft_records_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_nft_records_user_achievement" ON "nft_records" ("userId", "achievementId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_nft_records_user_achievement"`);
    await queryRunner.query(`DROP TABLE "nft_records"`);
  }
}
