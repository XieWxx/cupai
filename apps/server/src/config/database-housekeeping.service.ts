import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'

/**
 * 数据库自愈（schema housekeeping）
 *
 * 背景：
 * 历史上曾存在 dimension_reports 实体（被 dimension_submissions 取代），
 * 旧版本的 TypeORM 同步可能已在某些环境建出该孤儿表。新代码已删除实体，
 * 同步模式（DB_SYNCHRONIZE=true）不会再删除残留表，需要显式清理。
 *
 * 行为：
 * - 启动时检查 `dimension_reports` 表是否存在
 * - 若存在 → DROP TABLE IF EXISTS
 * - 若不存在 → 跳过
 * - 通过 env 控制：DB_CLEANUP=1 显式启用；不设置则仅在 NODE_ENV=development 自动启用
 *
 * 幂等：可重复执行，不影响新表。
 */
@Injectable()
export class DatabaseHousekeepingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseHousekeepingService.name)

  /** 已知需要清理的孤儿表清单（按需扩展） */
  private static readonly ORPHAN_TABLES = ['dimension_reports']

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.shouldRun()) {
      this.logger.debug('DatabaseHousekeepingService skipped (DB_CLEANUP off, not dev)')
      return
    }

    await this.dropOrphanTables()
  }

  /** 是否启用本次清理 */
  private shouldRun(): boolean {
    const explicit = this.config.get<string>('DB_CLEANUP')
    if (explicit === '1' || explicit === 'true') return true
    if (explicit === '0' || explicit === 'false') return false
    // 未显式配置时，仅在开发环境自动启用
    return this.config.get<string>('NODE_ENV') === 'development'
  }

  /**
   * 逐一 DROP 孤儿表
   * - 使用 IF EXISTS，避免脚本重复执行时报错
   * - 关闭 FK 检查再 DROP，避开外键依赖
   */
  private async dropOrphanTables(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      this.logger.warn('DataSource not initialized, skip housekeeping')
      return
    }

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      for (const table of DatabaseHousekeepingService.ORPHAN_TABLES) {
        const exists = await this.tableExists(queryRunner, table)
        if (!exists) {
          this.logger.log(`⏭  Orphan table not found, skip: ${table}`)
          continue
        }
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0`)
        await queryRunner.query(`DROP TABLE IF EXISTS \`${table}\``)
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1`)
        this.logger.warn(`🧹 Dropped orphan table: ${table}`)
      }
    } catch (err: any) {
      this.logger.error(`DatabaseHousekeepingService failed: ${err?.message ?? err}`)
    } finally {
      await queryRunner.release()
    }
  }

  private async tableExists(qr: import('typeorm').QueryRunner, table: string): Promise<boolean> {
    const rows: any[] = await qr.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [table],
    )
    return Number(rows?.[0]?.cnt ?? 0) > 0
  }
}
