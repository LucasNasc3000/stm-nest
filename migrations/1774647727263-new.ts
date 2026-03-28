import { MigrationInterface, QueryRunner } from "typeorm";

export class New1774647727263 implements MigrationInterface {
    name = 'New1774647727263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "date"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "date" date NOT NULL`);
    }

}
