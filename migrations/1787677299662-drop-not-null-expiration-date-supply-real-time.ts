import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropNotNullExpirationDateSupplyRealTime1787677299662 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ALTER COLUMN "expiration_date" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ALTER COLUMN "expiration_date" SET NOT NULL`,
    );
  }
}
