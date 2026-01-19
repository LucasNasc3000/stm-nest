import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1768858774130 implements MigrationInterface {
  name = 'New1768858774130';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "FK_1bbd99b224945b1ff070b1528b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "registeredById" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_e7ce65b3f7a81289e18e5305675" FOREIGN KEY ("registeredById") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" ADD CONSTRAINT "FK_1bbd99b224945b1ff070b1528b1" FOREIGN KEY ("boss") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "FK_1bbd99b224945b1ff070b1528b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_e7ce65b3f7a81289e18e5305675"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP COLUMN "registeredById"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" ADD CONSTRAINT "FK_1bbd99b224945b1ff070b1528b1" FOREIGN KEY ("boss") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
