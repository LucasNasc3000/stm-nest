import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1773517647281 implements MigrationInterface {
  name = 'New1773517647281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "total_price" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "total_price" numeric(10,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "total_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP COLUMN "total_price"`,
    );
  }
}
