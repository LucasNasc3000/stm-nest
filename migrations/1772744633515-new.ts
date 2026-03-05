import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1772744633515 implements MigrationInterface {
  name = 'New1772744633515';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_e7ce65b3f7a81289e18e5305675"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP COLUMN "registeredById"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "registeredById" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_e7ce65b3f7a81289e18e5305675" FOREIGN KEY ("registeredById") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
