import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1772729568692 implements MigrationInterface {
  name = 'New1772729568692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ALTER COLUMN "supplyRealtimeId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7" FOREIGN KEY ("supplyRealtimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ALTER COLUMN "supplyRealtimeId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7" FOREIGN KEY ("supplyRealtimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
