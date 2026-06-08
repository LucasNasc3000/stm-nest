import { MigrationInterface, QueryRunner } from "typeorm";

export class New1780950328260 implements MigrationInterface {
    name = 'New1780950328260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "expiration_date"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "expiration_date" date NOT NULL`);
    }

}
