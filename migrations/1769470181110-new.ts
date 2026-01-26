import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769470181110 implements MigrationInterface {
  name = 'New1769470181110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sale" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "hour" TIME(0) NOT NULL, "name" character varying(125) NOT NULL, "phone_number" character varying(14) NOT NULL, "address" character varying(125) NOT NULL, "products" character varying(125) NOT NULL, "price" numeric(10,2) NOT NULL, "employeeId" uuid, CONSTRAINT "PK_d03891c457cbcd22974732b5de2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD CONSTRAINT "FK_d223bdcf5ca2969be663637c5e2" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" DROP CONSTRAINT "FK_d223bdcf5ca2969be663637c5e2"`,
    );
    await queryRunner.query(`DROP TABLE "sale"`);
  }
}
