import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769805806350 implements MigrationInterface {
  name = 'New1769805806350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale_items" DROP CONSTRAINT "FK_c642be08de5235317d4cf3deb40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" ALTER COLUMN "saleId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" ADD CONSTRAINT "FK_c642be08de5235317d4cf3deb40" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sale_items" DROP CONSTRAINT "FK_c642be08de5235317d4cf3deb40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" ALTER COLUMN "saleId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" ADD CONSTRAINT "FK_c642be08de5235317d4cf3deb40" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
