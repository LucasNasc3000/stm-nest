import { MigrationInterface, QueryRunner } from 'typeorm';

export class TemporayDropNotNullQuantityProductIngredient1787678358052 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ALTER COLUMN "quantity" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ALTER COLUMN "quantity" SET NOT NULL`,
    );
  }
}
