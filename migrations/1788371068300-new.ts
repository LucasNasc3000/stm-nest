import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1788371068300 implements MigrationInterface {
  name = 'New1788371068300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "platform" ADD "adminId" uuid`);
    await queryRunner.query(`ALTER TABLE "sale" ADD "adminId" uuid`);
    await queryRunner.query(`ALTER TABLE "product_inflow" ADD "adminId" uuid`);
    await queryRunner.query(`ALTER TABLE "product" ADD "adminId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD "adminId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "outflow" ADD "adminId" uuid`);
    await queryRunner.query(`ALTER TABLE "supply_history" ADD "adminId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "adminId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "platform" ADD CONSTRAINT "FK_3461c590e86442dcd670e3a5670" FOREIGN KEY ("adminId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD CONSTRAINT "FK_1f8b4bdb70ae25c127d9b744f2c" FOREIGN KEY ("adminId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" ADD CONSTRAINT "FK_174d263bbed10e1db3a3b2a7b1c" FOREIGN KEY ("adminId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_2b26f37c948355fc254229ae4cf" FOREIGN KEY ("adminId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_39901bb2097698c882f3bdd8152" FOREIGN KEY ("adminId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" ADD CONSTRAINT "FK_564f7550ad7379ef9a6e3a92e00" FOREIGN KEY ("adminId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD CONSTRAINT "FK_852b8ec88622e668cbac75c06d8" FOREIGN KEY ("adminId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD CONSTRAINT "FK_09551de75dbadd074f52f8c5333" FOREIGN KEY ("adminId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP CONSTRAINT "FK_09551de75dbadd074f52f8c5333"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP CONSTRAINT "FK_852b8ec88622e668cbac75c06d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "outflow" DROP CONSTRAINT "FK_564f7550ad7379ef9a6e3a92e00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_39901bb2097698c882f3bdd8152"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_2b26f37c948355fc254229ae4cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP CONSTRAINT "FK_174d263bbed10e1db3a3b2a7b1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" DROP CONSTRAINT "FK_1f8b4bdb70ae25c127d9b744f2c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "platform" DROP CONSTRAINT "FK_3461c590e86442dcd670e3a5670"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "adminId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP COLUMN "adminId"`,
    );
    await queryRunner.query(`ALTER TABLE "outflow" DROP COLUMN "adminId"`);
    await queryRunner.query(
      `ALTER TABLE "product_ingredient" DROP COLUMN "adminId"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "adminId"`);
    await queryRunner.query(
      `ALTER TABLE "product_inflow" DROP COLUMN "adminId"`,
    );
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "adminId"`);
    await queryRunner.query(`ALTER TABLE "platform" DROP COLUMN "adminId"`);
  }
}
