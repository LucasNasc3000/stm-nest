import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1769619259898 implements MigrationInterface {
  name = 'New1769619259898';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc"`,
    );
    await queryRunner.query(
      `CREATE TABLE "sale_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, "productId" uuid, "saleId" uuid, CONSTRAINT "PK_5a7dc5b4562a9e590528b3e08ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "products"`);
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "expiration_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ALTER COLUMN "expiration_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ALTER COLUMN "expiration_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_items" ADD CONSTRAINT "FK_d675aea38a16313e844662c48f8" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
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
      `ALTER TABLE "sale_items" DROP CONSTRAINT "FK_d675aea38a16313e844662c48f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ALTER COLUMN "expiration_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ALTER COLUMN "expiration_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "expiration_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD "products" character varying(125) NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "sale_items"`);
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc" FOREIGN KEY ("productId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
