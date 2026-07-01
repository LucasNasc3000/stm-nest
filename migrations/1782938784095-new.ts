import { MigrationInterface, QueryRunner } from "typeorm";

export class New1782938784095 implements MigrationInterface {
    name = 'New1782938784095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "details2"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "details2" character varying(600)`);
    }

}
