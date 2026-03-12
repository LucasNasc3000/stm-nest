import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexSupplyrealtime1773348921043 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_supply_weight_text
      ON supply_real_time (CAST(weight_per_unit AS TEXT))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_supply_weight_text
    `);
  }
}
