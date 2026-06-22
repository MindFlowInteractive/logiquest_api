import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from 'typeorm';

export class AddAchievementsTables1718678600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'achievements',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', isGenerated: true },
          { name: 'name', type: 'varchar', isUnique: true },
          { name: 'description', type: 'varchar' },
          { name: 'conditionType', type: 'enum', enum: ['puzzles_solved', 'hard_puzzles_without_hints'] },
          { name: 'threshold', type: 'int' },
          { name: 'rarity', type: 'enum', enum: ['common', 'rare', 'epic'] },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'player_achievements',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', isGenerated: true },
          { name: 'userId', type: 'varchar' },
          { name: 'achievementId', type: 'uuid' },
          { name: 'unlockedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'player_achievements',
      new TableForeignKey({
        columnNames: ['achievementId'],
        referencedTableName: 'achievements',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'player_achievements',
      new TableUnique({ columnNames: ['userId', 'achievementId'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('player_achievements');
    await queryRunner.dropTable('achievements');
  }
}
