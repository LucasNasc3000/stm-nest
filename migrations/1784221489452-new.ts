import { MigrationInterface, QueryRunner } from "typeorm";

export class New1784221489452 implements MigrationInterface {
    name = 'New1784221489452'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform" ADD CONSTRAINT "UQ_b9b57ec16b9c2ac927aa62b8b3f" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform" DROP CONSTRAINT "UQ_b9b57ec16b9c2ac927aa62b8b3f"`);
    }

}
