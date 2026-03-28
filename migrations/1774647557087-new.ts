import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1774647557087 implements MigrationInterface {
  name = 'New1774647557087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_real_time" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_history" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
