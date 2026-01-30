import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769804608247 implements MigrationInterface {
  name = 'New1769804608247';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "outflow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "hour" TIME(0) NOT NULL, "name" character varying(50) NOT NULL, "category" character varying(50) NOT NULL, "reason" character varying(50) NOT NULL, "unities" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" uuid, "supplyRealTimeId" uuid, CONSTRAINT "PK_75ee946ccdaae4b42a9d8a7ca45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sale" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "hour" TIME(0) NOT NULL, "client_name" character varying(125) NOT NULL, "phone_number" character varying(14) NOT NULL, "address" character varying(125) NOT NULL, "price" numeric(10,2) NOT NULL, "employeeId" uuid, CONSTRAINT "PK_d03891c457cbcd22974732b5de2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sale_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, "productId" uuid, "saleId" uuid, CONSTRAINT "PK_5a7dc5b4562a9e590528b3e08ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "category" character varying(100) NOT NULL, "unities" integer NOT NULL, "expiration_date" date NOT NULL, "low_stock" integer, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66066600c02e85707cc0d1ec7a" ON "product" ("deleted_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_ingredient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "supplyRealTimeId" uuid, "productId" uuid, "employeeId" uuid, CONSTRAINT "PK_e7431906c21f94c0152d6b0db99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "supply_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" character varying(50) NOT NULL, "name" character varying(50) NOT NULL, "quantity" integer NOT NULL, "total_weight" numeric(10,2) NOT NULL, "weight_per_unit" numeric(10,2) NOT NULL, "supplier" character varying(100) NOT NULL, "expiration_date" date NOT NULL, "low_stock" integer, "price" numeric(10,2) NOT NULL, "reason" character varying(50) NOT NULL, "total_weight_per_register" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" uuid, "registeredById" uuid, "supplyRealtimeId" uuid, CONSTRAINT "PK_80309e3f5312546545250bff8cf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employee_role_enum" AS ENUM('admin', 'ler', 'atualizar', 'criar', 'editar-precos', 'insumos', 'saidas', 'produtos', 'receitas', 'vendas')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employee_situation_enum" AS ENUM('empregado', 'demitido')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cpf" character varying(14) NOT NULL, "email" character varying(50) NOT NULL, "name" character varying(125) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."employee_role_enum" array NOT NULL, "situation" "public"."employee_situation_enum" NOT NULL DEFAULT 'empregado', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "boss" uuid, CONSTRAINT "UQ_cc5bc3cbcb7312fbc898749c5bc" UNIQUE ("cpf"), CONSTRAINT "UQ_817d1d427138772d47eca048855" UNIQUE ("email"), CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "supply_real_time" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" character varying(50) NOT NULL, "name" character varying(50) NOT NULL, "quantity" integer NOT NULL, "total_weight" numeric(10,2) NOT NULL, "weight_per_unit" numeric(10,2) NOT NULL, "supplier" character varying(100) NOT NULL, "expiration_date" date NOT NULL, "low_stock" integer, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "employeeId" uuid, CONSTRAINT "PK_e833d0ded3d00b49a2c743213d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a397db638d1ae4dd5e17dd2030" ON "supply_real_time" ("deleted_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD CONSTRAINT "FK_ecf89015e9352c6911ce0aacffd" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD CONSTRAINT "FK_45327db131cb0e8909319d10122" FOREIGN KEY ("supplyRealTimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD CONSTRAINT "FK_d223bdcf5ca2969be663637c5e2" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" ADD CONSTRAINT "FK_d675aea38a16313e844662c48f8" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" ADD CONSTRAINT "FK_c642be08de5235317d4cf3deb40" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_01aa2ca37bbd8c66c796a54bbcf" FOREIGN KEY ("supplyRealTimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_7e741e659f9489471d1a9333303" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_b5e4dcfcf3930d5062fad76ae00" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_e7ce65b3f7a81289e18e5305675" FOREIGN KEY ("registeredById") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7" FOREIGN KEY ("supplyRealtimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" ADD CONSTRAINT "FK_1bbd99b224945b1ff070b1528b1" FOREIGN KEY ("boss") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
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
      `ALTER TABLE "employee" DROP CONSTRAINT "FK_1bbd99b224945b1ff070b1528b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_c02bf40065440e3eb2e4f7eb8d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_e7ce65b3f7a81289e18e5305675"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_b5e4dcfcf3930d5062fad76ae00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_7e741e659f9489471d1a9333303"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_01aa2ca37bbd8c66c796a54bbcf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" DROP CONSTRAINT "FK_c642be08de5235317d4cf3deb40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" DROP CONSTRAINT "FK_d675aea38a16313e844662c48f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" DROP CONSTRAINT "FK_d223bdcf5ca2969be663637c5e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" DROP CONSTRAINT "FK_45327db131cb0e8909319d10122"`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" DROP CONSTRAINT "FK_ecf89015e9352c6911ce0aacffd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a397db638d1ae4dd5e17dd2030"`,
    );
    await queryRunner.query(`DROP TABLE "supply_real_time"`);
    await queryRunner.query(`DROP TABLE "employee"`);
    await queryRunner.query(`DROP TYPE "public"."employee_situation_enum"`);
    await queryRunner.query(`DROP TYPE "public"."employee_role_enum"`);
    await queryRunner.query(`DROP TABLE "supply_history"`);
    await queryRunner.query(`DROP TABLE "product_ingredient"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66066600c02e85707cc0d1ec7a"`,
    );
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "sale_items"`);
    await queryRunner.query(`DROP TABLE "sale"`);
    await queryRunner.query(`DROP TABLE "outflow"`);
  }
}
