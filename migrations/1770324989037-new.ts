import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1770324989037 implements MigrationInterface {
  name = 'New1770324989037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."outflow_targettype_enum" AS ENUM('SUPPLY', 'PRODUCT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD "targetType" "public"."outflow_targettype_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "outflow" ADD "productId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD CONSTRAINT "FK_12de743b82ee59ae293768095be" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" DROP CONSTRAINT "FK_12de743b82ee59ae293768095be"`,
    );
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "productId"`);
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "targetType"`);
    await queryRunner.query(`DROP TYPE "public"."outflow_targettype_enum"`);
  }
}
