import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1770828951083 implements MigrationInterface {
  name = 'New1770828951083';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_token_employee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_valid" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" uuid, CONSTRAINT "PK_81169f84cbace9eb6fff3256202" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token_employee" ADD CONSTRAINT "FK_80be477e3ea9be2d92cc12ee993" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token_employee" DROP CONSTRAINT "FK_80be477e3ea9be2d92cc12ee993"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_token_employee"`);
  }
}
