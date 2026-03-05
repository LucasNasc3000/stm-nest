import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1772742355756 implements MigrationInterface {
  name = 'New1772742355756';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" RENAME COLUMN "supplyRealtimeId" TO "supplyRealTimeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_aeabe810d699a0f1433ae7010ed" FOREIGN KEY ("supplyRealTimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_aeabe810d699a0f1433ae7010ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" RENAME COLUMN "supplyRealTimeId" TO "supplyRealtimeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7" FOREIGN KEY ("supplyRealtimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
