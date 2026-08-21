import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1787349012014 implements MigrationInterface {
  name = 'New1787349012014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."outflow_reason_enum" RENAME TO "outflow_reason_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."outflow_reason_enum" AS ENUM('vencido', 'perdido', 'danificado', 'roubado', 'desperdício', 'venda', 'cadastro de produto', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "reason" TYPE "public"."outflow_reason_enum" USING "reason"::"text"::"public"."outflow_reason_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."outflow_reason_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."outflow_reason_enum_old" AS ENUM('vencido', 'perdido', 'danificado', 'roubado', 'desperdício', 'venda', 'erro de digitacao', 'cadastro de produto', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "reason" TYPE "public"."outflow_reason_enum_old" USING "reason"::"text"::"public"."outflow_reason_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."outflow_reason_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."outflow_reason_enum_old" RENAME TO "outflow_reason_enum"`,
    );
  }
}
