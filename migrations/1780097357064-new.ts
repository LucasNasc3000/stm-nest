import { MigrationInterface, QueryRunner } from "typeorm";

export class New1780097357064 implements MigrationInterface {
    name = 'New1780097357064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_inflow" ADD "notes" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_inflow" DROP COLUMN "notes"`);
    }

}
