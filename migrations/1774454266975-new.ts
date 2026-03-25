import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774454266975 implements MigrationInterface {
  name = 'New1774454266975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" RENAME COLUMN "price_at_sale" TO "total_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" RENAME COLUMN "price" TO "price_at_sale"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale_items" RENAME COLUMN "price_at_sale" TO "price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" RENAME COLUMN "total_price" TO "price_at_sale"`,
    );
  }
}
