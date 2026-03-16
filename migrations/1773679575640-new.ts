import { MigrationInterface, QueryRunner } from "typeorm";

export class New1773679575640 implements MigrationInterface {
    name = 'New1773679575640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_01aa2ca37bbd8c66c796a54bbcf"`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc"`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ALTER COLUMN "supplyRealTimeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ALTER COLUMN "productId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_01aa2ca37bbd8c66c796a54bbcf" FOREIGN KEY ("supplyRealTimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc"`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_01aa2ca37bbd8c66c796a54bbcf"`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ALTER COLUMN "productId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ALTER COLUMN "supplyRealTimeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_01aa2ca37bbd8c66c796a54bbcf" FOREIGN KEY ("supplyRealTimeId") REFERENCES "supply_real_time"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
