import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774383959712 implements MigrationInterface {
  name = 'New1774383959712';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."sale_status_enum" AS ENUM('finalizada', 'cancelada', 'pendente')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD "status" "public"."sale_status_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sale_reason_enum" AS ENUM('perdido', 'cancelado pelo cliente', 'produtos errados', 'cliente nao pagou', 'atraso na entrega', 'cliente trocou de produto', 'produto com estoque insuficiente', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD "reason" "public"."sale_reason_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD "notes" character varying(500)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "notes"`);
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "reason"`);
    await queryRunner.query(`DROP TYPE "public"."sale_reason_enum"`);
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."sale_status_enum"`);
  }
}
