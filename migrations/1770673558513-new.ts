import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1770673558513 implements MigrationInterface {
  name = 'New1770673558513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" ADD "employeeId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_c72519111a22951e993f7ecfb27" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_c72519111a22951e993f7ecfb27"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "employeeId"`);
  }
}
