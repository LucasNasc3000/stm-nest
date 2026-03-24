import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774370111279 implements MigrationInterface {
  name = 'New1774370111279';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "phone_number" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "address" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "address" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "phone_number" SET NOT NULL`,
    );
  }
}
