import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1771609081349 implements MigrationInterface {
  name = 'New1771609081349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66066600c02e85707cc0d1ec7a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a397db638d1ae4dd5e17dd2030"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "deleted_at" TO "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" RENAME COLUMN "deleted_at" TO "is_active"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_active"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "is_active" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_active"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "is_active" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" RENAME COLUMN "is_active" TO "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "is_active" TO "deleted_at"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a397db638d1ae4dd5e17dd2030" ON "supply_real_time" ("deleted_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66066600c02e85707cc0d1ec7a" ON "product" ("deleted_at") `,
    );
  }
}
