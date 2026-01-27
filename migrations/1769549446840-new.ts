import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769549446840 implements MigrationInterface {
  name = 'New1769549446840';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "quantity" TO "unities"`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_ingredient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "supplyRealTimeId" uuid, "productId" uuid, CONSTRAINT "PK_e7431906c21f94c0152d6b0db99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_01aa2ca37bbd8c66c796a54bbcf" FOREIGN KEY ("supplyRealTimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc" FOREIGN KEY ("productId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_01aa2ca37bbd8c66c796a54bbcf"`,
    );
    await queryRunner.query(`DROP TABLE "product_ingredient"`);
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "unities" TO "quantity"`,
    );
  }
}
