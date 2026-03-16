import { MigrationInterface, QueryRunner } from 'typeorm';

export class OutflowReasonLengthEdit1773694512914 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" ALTER COLUMN "reason" TYPE varchar(120)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
