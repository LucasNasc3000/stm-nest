import { MigrationInterface, QueryRunner } from 'typeorm';

export class SalePhoneNumberLengthEdit1774472878282 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" ALTER COLUMN "phone_number" TYPE varchar(18)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
