import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769645611215 implements MigrationInterface {
  name = 'New1769645611215';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" RENAME COLUMN "name" TO "client_name"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" RENAME COLUMN "client_name" TO "name"`,
    );
  }
}
