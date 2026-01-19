import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1768858434833 implements MigrationInterface {
  name = 'New1768858434833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "employee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cpf" character varying(14) NOT NULL, "email" character varying(50) NOT NULL, "name" character varying(125) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."employee_role_enum" array NOT NULL, "situation" "public"."employee_situation_enum" NOT NULL DEFAULT 'empregado', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "boss" uuid, CONSTRAINT "UQ_cc5bc3cbcb7312fbc898749c5bc" UNIQUE ("cpf"), CONSTRAINT "UQ_817d1d427138772d47eca048855" UNIQUE ("email"), CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "supply_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" character varying(100) NOT NULL, "name" character varying(100) NOT NULL, "quantity" integer NOT NULL, "total_weight" numeric(10,2) NOT NULL, "weight_per_unit" numeric(10,2) NOT NULL, "supplier" character varying(150) NOT NULL, "expiration_date" date, "low_stock" integer, "price" numeric(10,2) NOT NULL, "reason" character varying(50) NOT NULL, "total_weight_per_register" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" uuid, "supplyRealtimeId" uuid, CONSTRAINT "PK_80309e3f5312546545250bff8cf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "supply_real_time" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" character varying(100) NOT NULL, "name" character varying(100) NOT NULL, "quantity" integer NOT NULL, "total_weight" numeric(10,2) NOT NULL, "weight_per_unit" numeric(10,2) NOT NULL, "supplier" character varying(150) NOT NULL, "expiration_date" date, "low_stock" integer, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" uuid, CONSTRAINT "PK_e833d0ded3d00b49a2c743213d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" ADD CONSTRAINT "FK_1bbd99b224945b1ff070b1528b1" FOREIGN KEY ("boss") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_b5e4dcfcf3930d5062fad76ae00" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7" FOREIGN KEY ("supplyRealtimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD CONSTRAINT "FK_36279fe4bd345e5d81363513d41" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP CONSTRAINT "FK_36279fe4bd345e5d81363513d41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_b5e4dcfcf3930d5062fad76ae00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "FK_1bbd99b224945b1ff070b1528b1"`,
    );
    await queryRunner.query(`DROP TABLE "supply_real_time"`);
    await queryRunner.query(`DROP TABLE "supply_history"`);
    await queryRunner.query(`DROP TABLE "employee"`);
  }
}
