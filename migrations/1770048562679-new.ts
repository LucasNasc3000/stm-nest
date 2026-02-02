import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1770048562679 implements MigrationInterface {
  name = 'New1770048562679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP COLUMN "is_active"`,
    );
  }
}
