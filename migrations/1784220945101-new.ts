import { MigrationInterface, QueryRunner } from "typeorm";

export class New1784220945101 implements MigrationInterface {
    name = 'New1784220945101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "platform" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "tax_percentage" numeric(10,2) NOT NULL, CONSTRAINT "PK_c33d6abeebd214bd2850bfd6b8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sale" ADD "applied_tax_percentage" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "sale" ADD "net_value" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "sale" ADD "platformId" uuid`);
        await queryRunner.query(`ALTER TABLE "sale" ADD CONSTRAINT "FK_8606d25bc1b126bd57864f9ff4b" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale" DROP CONSTRAINT "FK_8606d25bc1b126bd57864f9ff4b"`);
        await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "platformId"`);
        await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "net_value"`);
        await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "applied_tax_percentage"`);
        await queryRunner.query(`DROP TABLE "platform"`);
    }

}
