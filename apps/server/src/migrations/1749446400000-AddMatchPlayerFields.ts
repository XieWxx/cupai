import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMatchPlayerFields1749446400000 implements MigrationInterface {
  name = 'AddMatchPlayerFields1749446400000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // MatchEntity 新增字段
    await queryRunner.query(`ALTER TABLE "matches" ADD "pitch_condition" character varying(50)`)
    await queryRunner.query(`ALTER TABLE "matches" ADD "travel_distance_km" numeric(10,1)`)
    await queryRunner.query(`ALTER TABLE "matches" ADD "venue_latitude" numeric(10,7)`)
    await queryRunner.query(`ALTER TABLE "matches" ADD "venue_longitude" numeric(10,7)`)
    // PlayerEntity 新增字段
    await queryRunner.query(`ALTER TABLE "players" ADD "strengths" json`)
    await queryRunner.query(`ALTER TABLE "players" ADD "weaknesses" json`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "venue_longitude"`)
    await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "venue_latitude"`)
    await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "travel_distance_km"`)
    await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "pitch_condition"`)
    await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "weaknesses"`)
    await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "strengths"`)
  }
}
