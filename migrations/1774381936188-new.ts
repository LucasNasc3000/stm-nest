import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774381936188 implements MigrationInterface {
  name = 'New1774381936188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "date"`);
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "hour"`);
    await queryRunner.query(
      `ALTER TABLE "sale" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "sale" ADD "hour" TIME(0) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "sale" ADD "date" date NOT NULL`);
  }
}
