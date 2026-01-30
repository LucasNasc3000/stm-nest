import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769804757027 implements MigrationInterface {
  name = 'New1769804757027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" RENAME COLUMN "categories" TO "category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "category" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "category" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" RENAME COLUMN "category" TO "categories"`,
    );
  }
}
