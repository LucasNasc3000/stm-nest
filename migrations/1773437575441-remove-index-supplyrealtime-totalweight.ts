import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIndexSupplyrealtimeTotalweight1773437575441 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_supply_total_weight_text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
