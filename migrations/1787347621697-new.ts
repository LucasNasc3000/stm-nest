import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1787347621697 implements MigrationInterface {
  name = 'New1787347621697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "total_weight"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD "total_weight" numeric(10,2)`,
    );
  }
}
