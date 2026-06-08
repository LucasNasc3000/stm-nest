import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1780677125380 implements MigrationInterface {
  name = 'New1780677125380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP CONSTRAINT "UQ_c363da38bf045fc9543dc4cba3d"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD CONSTRAINT "UQ_c363da38bf045fc9543dc4cba3d" UNIQUE ("name")`,
    );
  }
}
