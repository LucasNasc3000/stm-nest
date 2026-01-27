import { MigrationInterface, QueryRunner } from "typeorm";

export class New1769547130033 implements MigrationInterface {
    name = 'New1769547130033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "category" character varying(100) NOT NULL, "quantity" integer NOT NULL, "expiration_date" date, "low_stock" integer, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_66066600c02e85707cc0d1ec7a" ON "product" ("deleted_at") `);
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "name" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "category" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "category" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "name" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "supplier"`);
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "supplier" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" ADD "category" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" ADD "name" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" DROP COLUMN "supplier"`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" ADD "supplier" character varying(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supply_real_time" DROP COLUMN "supplier"`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" ADD "supplier" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" ADD "name" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "supply_real_time" ADD "category" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "supplier"`);
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "supplier" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "name" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "category" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "category" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "outflow" ADD "name" character varying(100) NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_66066600c02e85707cc0d1ec7a"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
