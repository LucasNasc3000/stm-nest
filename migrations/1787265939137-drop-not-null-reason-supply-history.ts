import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropNotNullReasonSupplyHistory1787265939137 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" ALTER COLUMN "reason" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" ALTER COLUMN "reason" SET NOT NULL`,
    );
  }
}
