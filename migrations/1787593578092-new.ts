import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1787593578092 implements MigrationInterface {
  name = 'New1787593578092';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP COLUMN "quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD "quantity" numeric(10,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP COLUMN "quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD "quantity" integer NOT NULL`,
    );
  }
}
