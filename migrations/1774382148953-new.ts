import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774382148953 implements MigrationInterface {
  name = 'New1774382148953';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" ADD "client_email" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale_items" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "client_email"`);
  }
}
