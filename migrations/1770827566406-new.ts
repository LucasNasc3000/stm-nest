import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1770827566406 implements MigrationInterface {
  name = 'New1770827566406';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "log_employee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(50) NOT NULL, "name" character varying(125) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" uuid, CONSTRAINT "PK_7d61e44b0c92794c16325c8f07c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_employee" ADD CONSTRAINT "FK_e155820666b446a09f80da90a0f" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "log_employee" DROP CONSTRAINT "FK_e155820666b446a09f80da90a0f"`,
    );
    await queryRunner.query(`DROP TABLE "log_employee"`);
  }
}
