import { MigrationInterface, QueryRunner } from "typeorm";

export class New1779312883303 implements MigrationInterface {
    name = 'New1779312883303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "reason"`);
        await queryRunner.query(`DROP TYPE "public"."product_reason_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."product_inflow_reason_enum" RENAME TO "product_inflow_reason_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."product_inflow_reason_enum" AS ENUM('cadastro inicial', 'compra de fornecedor', 'ajuste de inventario', 'devolucao', 'correcao de erro', 'outro')`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "inflow_reason" TYPE "public"."product_inflow_reason_enum" USING "inflow_reason"::"text"::"public"."product_inflow_reason_enum"`);
        await queryRunner.query(`DROP TYPE "public"."product_inflow_reason_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_inflow_reason_enum_old" AS ENUM('compra_fornecedor', 'ajuste_inventario', 'devolucao', 'correcao_erro', 'outro')`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "inflow_reason" TYPE "public"."product_inflow_reason_enum_old" USING "inflow_reason"::"text"::"public"."product_inflow_reason_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."product_inflow_reason_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."product_inflow_reason_enum_old" RENAME TO "product_inflow_reason_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."product_reason_enum" AS ENUM('compra_fornecedor', 'ajuste_inventario', 'devolucao', 'correcao_erro', 'outro')`);
        await queryRunner.query(`ALTER TABLE "product" ADD "reason" "public"."product_reason_enum" NOT NULL`);
    }

}
