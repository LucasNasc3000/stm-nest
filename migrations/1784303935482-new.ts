import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1784303935482 implements MigrationInterface {
  name = 'New1784303935482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" DROP CONSTRAINT "FK_8606d25bc1b126bd57864f9ff4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD "platform_name_snapshot" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD CONSTRAINT "FK_8606d25bc1b126bd57864f9ff4b" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale" DROP CONSTRAINT "FK_8606d25bc1b126bd57864f9ff4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" DROP COLUMN "platform_name_snapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD CONSTRAINT "FK_8606d25bc1b126bd57864f9ff4b" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
