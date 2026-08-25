import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1784222537133 implements MigrationInterface {
  name = 'New1784222537133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission" DROP CONSTRAINT "UQ_b7f40c3248fc7ad7c35151e2d11"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."permission_resource_enum" RENAME TO "permission_resource_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."permission_resource_enum" AS ENUM('EMPLOYEES', 'PRODUCTS', 'SUPPLIES', 'OUTFLOWS', 'SALES', 'PLATFORMS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum" USING "resource"::"text"::"public"."permission_resource_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."permission_resource_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD CONSTRAINT "UQ_b7f40c3248fc7ad7c35151e2d11" UNIQUE ("action", "resource")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission" DROP CONSTRAINT "UQ_b7f40c3248fc7ad7c35151e2d11"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."permission_resource_enum_old" AS ENUM('EMPLOYEES', 'PRODUCTS', 'SUPPLIES', 'OUTFLOWS', 'SALES')`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum_old" USING "resource"::"text"::"public"."permission_resource_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."permission_resource_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."permission_resource_enum_old" RENAME TO "permission_resource_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD CONSTRAINT "UQ_b7f40c3248fc7ad7c35151e2d11" UNIQUE ("action", "resource")`,
    );
  }
}
