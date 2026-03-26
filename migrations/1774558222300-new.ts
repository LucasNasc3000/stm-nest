import { MigrationInterface, QueryRunner } from "typeorm";

export class New1774558222300 implements MigrationInterface {
    name = 'New1774558222300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "hour"`);
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "hour" TIME(0) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "date" date NOT NULL`);
    }

}
