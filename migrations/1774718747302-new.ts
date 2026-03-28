import { MigrationInterface, QueryRunner } from "typeorm";

export class New1774718747302 implements MigrationInterface {
    name = 'New1774718747302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "details" character varying(600) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "reason"`);
        await queryRunner.query(`CREATE TYPE "public"."supply_history_reason_enum" AS ENUM('entrada', 'reposicao', 'ajuste', 'doacao', 'transferencia', 'correcao de perda')`);
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "reason" "public"."supply_history_reason_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "reason"`);
        await queryRunner.query(`DROP TYPE "public"."supply_history_reason_enum"`);
        await queryRunner.query(`ALTER TABLE "supply_history" ADD "reason" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supply_history" DROP COLUMN "details"`);
    }

}
