import { MigrationInterface, QueryRunner } from "typeorm";

export class New1769805904983 implements MigrationInterface {
    name = 'New1769805904983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_6486f062bf757652bfe7d373375"`);
        await queryRunner.query(`ALTER TABLE "sale_items" RENAME COLUMN "productsId" TO "productId"`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD CONSTRAINT "FK_d675aea38a16313e844662c48f8" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_d675aea38a16313e844662c48f8"`);
        await queryRunner.query(`ALTER TABLE "sale_items" RENAME COLUMN "productId" TO "productsId"`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD CONSTRAINT "FK_6486f062bf757652bfe7d373375" FOREIGN KEY ("productsId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
