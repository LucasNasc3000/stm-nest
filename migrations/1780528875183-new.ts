import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1780528875183 implements MigrationInterface {
  name = 'New1780528875183';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD "name" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD CONSTRAINT "UQ_c363da38bf045fc9543dc4cba3d" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD "category" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD "use_stock_supplies" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP COLUMN "use_stock_supplies"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP COLUMN "category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP CONSTRAINT "UQ_c363da38bf045fc9543dc4cba3d"`,
    );
    await queryRunner.query(`ALTER TABLE "product_inflow" DROP COLUMN "name"`);
  }
}
