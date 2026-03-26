import { MigrationInterface, QueryRunner } from "typeorm";

export class New1774542057073 implements MigrationInterface {
    name = 'New1774542057073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outflow" ADD "saleItemId" uuid`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD CONSTRAINT "UQ_05dfc879cefadf27557b1d3b29d" UNIQUE ("saleItemId")`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD CONSTRAINT "FK_05dfc879cefadf27557b1d3b29d" FOREIGN KEY ("saleItemId") REFERENCES "sale_items"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outflow" DROP CONSTRAINT "FK_05dfc879cefadf27557b1d3b29d"`);
        await queryRunner.query(`ALTER TABLE "outflow" DROP CONSTRAINT "UQ_05dfc879cefadf27557b1d3b29d"`);
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "saleItemId"`);
    }

}
