import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774483894822 implements MigrationInterface {
  name = 'New1774483894822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."sale_reason_enum" RENAME TO "sale_reason_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sale_reason_enum" AS ENUM('perdido', 'cancelado pelo cliente', 'produtos errados', 'cliente nao pagou', 'atraso na entrega', 'cliente trocou de produto', 'pedido não chegou ao cliente', 'produto com estoque insuficiente', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "reason" TYPE "public"."sale_reason_enum" USING "reason"::"text"::"public"."sale_reason_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sale_reason_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."sale_reason_enum_old" AS ENUM('perdido', 'cancelado pelo cliente', 'produtos errados', 'cliente nao pagou', 'atraso na entrega', 'cliente trocou de produto', 'produto com estoque insuficiente', 'outro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "reason" TYPE "public"."sale_reason_enum_old" USING "reason"::"text"::"public"."sale_reason_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sale_reason_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sale_reason_enum_old" RENAME TO "sale_reason_enum"`,
    );
  }
}
