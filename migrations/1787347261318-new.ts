import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1787347261318 implements MigrationInterface {
  name = 'New1787347261318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "total_weight" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "total_weight" SET NOT NULL`,
    );
  }
}
