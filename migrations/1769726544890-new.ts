import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769726544890 implements MigrationInterface {
  name = 'New1769726544890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD "employeeId" uuid`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."employee_role_enum" RENAME TO "employee_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employee_role_enum" AS ENUM('admin', 'ler', 'atualizar', 'criar', 'editar-precos', 'insumos', 'saidas', 'produtos', 'receitas', 'vendas')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" ALTER COLUMN "role" TYPE "public"."employee_role_enum"[] USING "role"::"text"::"public"."employee_role_enum"[]`,
    );
    await queryRunner.query(`DROP TYPE "public"."employee_role_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_7e741e659f9489471d1a9333303" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_7e741e659f9489471d1a9333303"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employee_role_enum_old" AS ENUM('admin', 'ler', 'atualizar', 'criar', 'editar-precos', 'insumos', 'saidas', 'vendas')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" ALTER COLUMN "role" TYPE "public"."employee_role_enum_old"[] USING "role"::"text"::"public"."employee_role_enum_old"[]`,
    );
    await queryRunner.query(`DROP TYPE "public"."employee_role_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."employee_role_enum_old" RENAME TO "employee_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP COLUMN "employeeId"`,
    );
  }
}
