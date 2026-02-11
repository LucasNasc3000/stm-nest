import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1770826547224 implements MigrationInterface {
  name = 'New1770826547224';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" RENAME COLUMN "role" TO "roleId"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."employee_role_enum" RENAME TO "employee_roleid_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."permission_action_enum" AS ENUM('READ', 'CREATE', 'UPDATE', 'DELETE', 'EDIT_PRICES')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."permission_resource_enum" AS ENUM('PRODUCTS', 'SUPPLIES', 'OUTFLOWS', 'SALES')`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" SERIAL NOT NULL, "action" "public"."permission_action_enum" NOT NULL, "resource" "public"."permission_resource_enum" NOT NULL, CONSTRAINT "UQ_b7f40c3248fc7ad7c35151e2d11" UNIQUE ("action", "resource"), CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions_permission" ("roleId" uuid NOT NULL, "permissionId" integer NOT NULL, CONSTRAINT "PK_b817d7eca3b85f22130861259dd" PRIMARY KEY ("roleId", "permissionId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `,
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "roleId"`);
    await queryRunner.query(`ALTER TABLE "employee" ADD "roleId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "employee" ADD CONSTRAINT "FK_646b91cc56d9fd9760973b4980d" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "FK_646b91cc56d9fd9760973b4980d"`,
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "roleId"`);
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "roleId" "public"."employee_roleid_enum" array NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions_permission"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP TYPE "public"."permission_resource_enum"`);
    await queryRunner.query(`DROP TYPE "public"."permission_action_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."employee_roleid_enum" RENAME TO "employee_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" RENAME COLUMN "roleId" TO "role"`,
    );
  }
}
