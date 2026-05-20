import { MigrationInterface, QueryRunner } from "typeorm";

export class New1779312567148 implements MigrationInterface {
    name = 'New1779312567148'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_inflow_reason_enum" AS ENUM('compra_fornecedor', 'ajuste_inventario', 'devolucao', 'correcao_erro', 'outro')`);
        await queryRunner.query(`ALTER TABLE "product" ADD "inflow_reason" "public"."product_inflow_reason_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "inflow_reason"`);
        await queryRunner.query(`DROP TYPE "public"."product_inflow_reason_enum"`);
    }

}
