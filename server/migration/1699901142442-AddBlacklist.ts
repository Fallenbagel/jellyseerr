import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlacklist1699901142442 implements MigrationInterface {
  name = 'AddBlacklist1699901142442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blacklist" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "mediaType" varchar NOT NULL, "title" varchar, "tmdbId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_6bbafa28411e6046421991ea21c" UNIQUE ("tmdbId"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "blacklist"`);
  }
}
