import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769804729661 implements MigrationInterface {
  name = 'New1769804729661';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" RENAME COLUMN "category" TO "categories"`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "categories" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "categories" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" RENAME COLUMN "categories" TO "category"`,
    );
  }
}
