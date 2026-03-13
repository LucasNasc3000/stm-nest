import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1773434629547 implements MigrationInterface {
  name = 'New1773434629547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP COLUMN "total_weight"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "total_weight" numeric(10,2) NOT NULL`,
    );
  }
}
