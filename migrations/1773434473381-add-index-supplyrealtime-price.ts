import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexSupplyrealtimePrice1773434473381 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_supply_price_text
      ON supply_real_time (CAST(price AS TEXT))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_supply_price_text
    `);
  }
}
