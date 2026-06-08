import { MigrationInterface, QueryRunner } from "typeorm";

export class New1780939029366 implements MigrationInterface {
    name = 'New1780939029366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_inflow" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_inflow" DROP COLUMN "updated_at"`);
    }

}
