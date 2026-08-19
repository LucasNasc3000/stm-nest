import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1787178661119 implements MigrationInterface {
  name = 'New1787178661119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "seq" BIGSERIAL NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "seq"`);
  }
}
