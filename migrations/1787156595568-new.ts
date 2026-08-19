import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1787156595568 implements MigrationInterface {
  name = 'New1787156595568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."supply_history_reason_enum" RENAME TO "supply_history_reason_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."supply_history_reason_enum" AS ENUM('entrada', 'reposicao', 'ajuste', 'doacao', 'transferencia', 'correcao de perda', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ALTER COLUMN "reason" TYPE "public"."supply_history_reason_enum" USING "reason"::"text"::"public"."supply_history_reason_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."supply_history_reason_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."supply_history_reason_enum_old" AS ENUM('entrada', 'reposicao', 'ajuste', 'doacao', 'transferencia', 'correcao de perda')`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ALTER COLUMN "reason" TYPE "public"."supply_history_reason_enum_old" USING "reason"::"text"::"public"."supply_history_reason_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."supply_history_reason_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."supply_history_reason_enum_old" RENAME TO "supply_history_reason_enum"`,
    );
  }
}
