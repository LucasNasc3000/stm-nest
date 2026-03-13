import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexSupplyrealtimeTotalweight1773434466645 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_supply_total_weight_text
      ON supply_real_time (CAST(total_weight AS TEXT))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_supply_total_weight_text
    `);
  }
}
