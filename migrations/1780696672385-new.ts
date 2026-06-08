import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1780696672385 implements MigrationInterface {
  name = 'New1780696672385';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "expiration_date" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sale_reason_enum" RENAME TO "sale_reason_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sale_reason_enum" AS ENUM('perdido', 'cancelado pelo cliente', 'produtos errados', 'cliente nao pagou', 'atraso na entrega', 'cliente trocou de produto', 'pedido nao chegou ao cliente', 'produto com estoque insuficiente', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "reason" TYPE "public"."sale_reason_enum" USING "reason"::"text"::"public"."sale_reason_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sale_reason_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."product_inflow_inflow_reason_enum" RENAME TO "product_inflow_inflow_reason_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_inflow_inflow_reason_enum" AS ENUM('entrada', 'compra de fornecedor', 'ajuste de inventario', 'devolucao', 'correcao de erro', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ALTER COLUMN "inflow_reason" TYPE "public"."product_inflow_inflow_reason_enum" USING "inflow_reason"::"text"::"public"."product_inflow_inflow_reason_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."product_inflow_inflow_reason_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."outflow_reason_enum" RENAME TO "outflow_reason_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."outflow_reason_enum" AS ENUM('vencido', 'perdido', 'danificado', 'roubado', 'desperdício', 'venda', 'erro de digitacao', 'cadastro de produto', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "reason" TYPE "public"."outflow_reason_enum" USING "reason"::"text"::"public"."outflow_reason_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."outflow_reason_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."outflow_reason_enum_old" AS ENUM('vencido', 'perdido', 'danificado', 'roubado', 'desperdício', 'venda', 'cadastro de produto', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "reason" TYPE "public"."outflow_reason_enum_old" USING "reason"::"text"::"public"."outflow_reason_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."outflow_reason_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."outflow_reason_enum_old" RENAME TO "outflow_reason_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_inflow_inflow_reason_enum_old" AS ENUM('cadastro inicial', 'compra de fornecedor', 'ajuste de inventario', 'devolucao', 'correcao de erro', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ALTER COLUMN "inflow_reason" TYPE "public"."product_inflow_inflow_reason_enum_old" USING "inflow_reason"::"text"::"public"."product_inflow_inflow_reason_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."product_inflow_inflow_reason_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."product_inflow_inflow_reason_enum_old" RENAME TO "product_inflow_inflow_reason_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sale_reason_enum_old" AS ENUM('perdido', 'cancelado pelo cliente', 'produtos errados', 'cliente nao pagou', 'atraso na entrega', 'cliente trocou de produto', 'pedido não chegou ao cliente', 'produto com estoque insuficiente', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "reason" TYPE "public"."sale_reason_enum_old" USING "reason"::"text"::"public"."sale_reason_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sale_reason_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sale_reason_enum_old" RENAME TO "sale_reason_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "expiration_date"`,
    );
  }
}
