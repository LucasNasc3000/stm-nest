import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1772554245153 implements MigrationInterface {
  name = 'New1772554245153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token_employee" DROP CONSTRAINT "FK_80be477e3ea9be2d92cc12ee993"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token_employee" RENAME COLUMN "employeeId" TO "employee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token_employee" ADD CONSTRAINT "FK_b284ac8158270159f32a3dafd0f" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token_employee" DROP CONSTRAINT "FK_b284ac8158270159f32a3dafd0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token_employee" RENAME COLUMN "employee_id" TO "employeeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token_employee" ADD CONSTRAINT "FK_80be477e3ea9be2d92cc12ee993" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
