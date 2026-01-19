import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1768865915073 implements MigrationInterface {
  name = 'New1768865915073';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "outflow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "hour" TIME(0) NOT NULL, "name" character varying(100) NOT NULL, "category" character varying(100) NOT NULL, "reason" character varying(50) NOT NULL, "unities" integer NOT NULL, "employeeId" uuid, CONSTRAINT "PK_75ee946ccdaae4b42a9d8a7ca45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD CONSTRAINT "FK_ecf89015e9352c6911ce0aacffd" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" DROP CONSTRAINT "FK_ecf89015e9352c6911ce0aacffd"`,
    );
    await queryRunner.query(`DROP TABLE "outflow"`);
  }
}
