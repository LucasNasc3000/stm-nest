import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1771610854560 implements MigrationInterface {
  name = 'New1771610854560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "UQ_cc5bc3cbcb7312fbc898749c5bc"`,
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "cpf"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "cpf" character varying(14) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" ADD CONSTRAINT "UQ_cc5bc3cbcb7312fbc898749c5bc" UNIQUE ("cpf")`,
    );
  }
}
