import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774454792845 implements MigrationInterface {
  name = 'New1774454792845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "reason" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "reason" SET NOT NULL`,
    );
  }
}
