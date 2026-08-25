import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1787671855473 implements MigrationInterface {
  name = 'New1787671855473';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "expiration_date" date`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "expiration_date"`,
    );
  }
}
