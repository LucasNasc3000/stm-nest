import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1779743269821 implements MigrationInterface {
  name = 'New1779743269821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."product_inflow_inflow_reason_enum" AS ENUM('compra de fornecedor', 'ajuste de inventario', 'devolucao', 'correcao de erro', 'outro')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_inflow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "unities" integer NOT NULL, "inflow_reason" "public"."product_inflow_inflow_reason_enum" NOT NULL, "expiration_date" date NOT NULL, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "productId" uuid, "employeeId" uuid, CONSTRAINT "PK_bcba2ebab82221befcb23e19f9f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "inflow_reason"`,
    );
    await queryRunner.query(`DROP TYPE "public"."product_inflow_reason_enum"`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "expiration_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD CONSTRAINT "FK_45648b01aa73ae6f37409ef402c" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD CONSTRAINT "FK_074e99a1fe46d190398b0071d7e" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP CONSTRAINT "FK_074e99a1fe46d190398b0071d7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP CONSTRAINT "FK_45648b01aa73ae6f37409ef402c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "expiration_date" date NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_inflow_reason_enum" AS ENUM('compra de fornecedor', 'ajuste de inventario', 'devolucao', 'correcao de erro', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "inflow_reason" "public"."product_inflow_reason_enum"`,
    );
    await queryRunner.query(`DROP TABLE "product_inflow"`);
    await queryRunner.query(
      `DROP TYPE "public"."product_inflow_inflow_reason_enum"`,
    );
  }
}
