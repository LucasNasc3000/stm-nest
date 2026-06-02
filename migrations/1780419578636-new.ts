import { MigrationInterface, QueryRunner } from "typeorm";

export class New1780419578636 implements MigrationInterface {
    name = 'New1780419578636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "expiration_date"`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" DROP COLUMN "expiration_date"`);
        await queryRunner.query(`ALTER TABLE "product_inflow" ADD "expiration_date" date NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_inflow" DROP COLUMN "expiration_date"`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" ADD "expiration_date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "expiration_date" date NOT NULL`);
    }

}
