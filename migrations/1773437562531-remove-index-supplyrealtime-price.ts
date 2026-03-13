import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIndexSupplyrealtimePrice1773437562531 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_supply_price_text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
