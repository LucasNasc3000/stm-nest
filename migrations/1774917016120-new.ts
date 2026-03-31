import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774917016120 implements MigrationInterface {
  name = 'New1774917016120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" ADD "stock_fully_returned" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" DROP COLUMN "stock_fully_returned"`,
    );
  }
}
