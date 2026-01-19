import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1768866539654 implements MigrationInterface {
  name = 'New1768866539654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a397db638d1ae4dd5e17dd2030" ON "supply_real_time" ("deleted_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a397db638d1ae4dd5e17dd2030"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "created_at"`);
  }
}
