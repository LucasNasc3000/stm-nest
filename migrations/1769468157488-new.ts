import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769468157488 implements MigrationInterface {
  name = 'New1769468157488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD "supplyRealTimeId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD CONSTRAINT "FK_45327db131cb0e8909319d10122" FOREIGN KEY ("supplyRealTimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" DROP CONSTRAINT "FK_45327db131cb0e8909319d10122"`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" DROP COLUMN "supplyRealTimeId"`,
    );
  }
}
