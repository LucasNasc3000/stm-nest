import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1787592728745 implements MigrationInterface {
  name = 'New1787592728745';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD "quantity" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "unities" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "unities" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "quantity"`);
  }
}
