import { MigrationInterface, QueryRunner } from "typeorm";

export class New1784221682346 implements MigrationInterface {
    name = 'New1784221682346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform" ADD "employeeId" uuid`);
        await queryRunner.query(`ALTER TABLE "platform" ADD CONSTRAINT "FK_69117dcaa07d3064726971f1392" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform" DROP CONSTRAINT "FK_69117dcaa07d3064726971f1392"`);
        await queryRunner.query(`ALTER TABLE "platform" DROP COLUMN "employeeId"`);
    }

}
