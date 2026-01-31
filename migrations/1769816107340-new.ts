import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769816107340 implements MigrationInterface {
  name = 'New1769816107340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD CONSTRAINT "UQ_26f595f5544ab7d055d3458c515" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP CONSTRAINT "UQ_26f595f5544ab7d055d3458c515"`,
    );
  }
}
