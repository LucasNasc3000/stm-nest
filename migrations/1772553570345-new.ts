import { MigrationInterface, QueryRunner } from "typeorm";

export class New1772553570345 implements MigrationInterface {
    name = 'New1772553570345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jwt_blacklist" DROP COLUMN "token"`);
        await queryRunner.query(`ALTER TABLE "jwt_blacklist" ADD "token" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jwt_blacklist" DROP COLUMN "token"`);
        await queryRunner.query(`ALTER TABLE "jwt_blacklist" ADD "token" character varying(255) NOT NULL`);
    }

}
