import { MigrationInterface, QueryRunner } from "typeorm";

export class New1779312152824 implements MigrationInterface {
    name = 'New1779312152824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_reason_enum" AS ENUM('compra_fornecedor', 'ajuste_inventario', 'devolucao', 'correcao_erro', 'outro')`);
        await queryRunner.query(`ALTER TABLE "product" ADD "reason" "public"."product_reason_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "reason"`);
        await queryRunner.query(`DROP TYPE "public"."product_reason_enum"`);
    }

}
