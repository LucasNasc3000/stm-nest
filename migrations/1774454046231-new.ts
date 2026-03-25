import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774454046231 implements MigrationInterface {
  name = 'New1774454046231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" RENAME COLUMN "price" TO "price_at_sale"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" RENAME COLUMN "price_at_sale" TO "price"`,
    );
  }
}
