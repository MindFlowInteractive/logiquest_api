import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRewardTable1660000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reward',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'session_id', type: 'uuid' },
          {
            name: 'type',
            type: 'enum',
            enum: ['stella'],
            default: `'stella'`,
          },
          { name: 'amount', type: 'int' },
          { name: 'granted_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'reward',
      new TableIndex({
        name: 'IDX_REWARD_SESSION_UNIQUE',
        columnNames: ['session_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reward');
  }
}
