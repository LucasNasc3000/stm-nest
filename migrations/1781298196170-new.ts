import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1781298196170 implements MigrationInterface {
  name = 'New1781298196170';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD "seq" BIGSERIAL NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_inflow" DROP COLUMN "seq"`);
  }
}
