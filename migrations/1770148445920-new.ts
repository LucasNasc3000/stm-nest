import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1770148445920 implements MigrationInterface {
  name = 'New1770148445920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "outflow" ADD "ingredientId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD CONSTRAINT "FK_8ba5e409f2e01e03146f0d9b43e" FOREIGN KEY ("ingredientId") REFERENCES "product_ingredient"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outflow" DROP CONSTRAINT "FK_8ba5e409f2e01e03146f0d9b43e"`,
    );
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "ingredientId"`);
  }
}
