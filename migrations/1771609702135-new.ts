import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1771609702135 implements MigrationInterface {
  name = 'New1771609702135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "date" date NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "date"`);
  }
}
