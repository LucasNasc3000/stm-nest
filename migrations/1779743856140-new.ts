import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1779743856140 implements MigrationInterface {
  name = 'New1779743856140';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP COLUMN "expiration_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "expiration_date" date NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "expiration_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD "expiration_date" date NOT NULL`,
    );
  }
}
