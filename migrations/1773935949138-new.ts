import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1773935949138 implements MigrationInterface {
  name = 'New1773935949138';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD "notes" character varying(500)`,
    );
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "reason"`);
    await queryRunner.query(
      `CREATE TYPE "public"."outflow_reason_enum" AS ENUM('vencido', 'perdido', 'danificado', 'roubado', 'desperdício', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD "reason" "public"."outflow_reason_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "reason"`);
    await queryRunner.query(`DROP TYPE "public"."outflow_reason_enum"`);
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD "reason" character varying(120) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "notes"`);
  }
}
