import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIndexSupplyrealtimeWeightperunit1773437582312 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_supply_weight_text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
