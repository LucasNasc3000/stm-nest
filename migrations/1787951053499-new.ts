import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1787951053499 implements MigrationInterface {
  name = 'New1787951053499';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ALTER COLUMN "quantity" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ALTER COLUMN "expiration_date" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ALTER COLUMN "expiration_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ALTER COLUMN "quantity" DROP NOT NULL`,
    );
  }
}
