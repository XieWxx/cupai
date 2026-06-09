import { Controller, Get, Post, Body } from '@nestjs/common'
import { BsdcSyncService } from './bsd-sync.service'
import { BsdcSyncScheduler } from './bsd-sync.scheduler'

/**
 * BSD 数据同步控制器
 *
 * - /status    : 同步状态（计数器 + 各任务上次运行时间 + 下一轮时间）
 * - /ready     : 冷启动是否完成（部署健康检查用）
 * - /enable/:disable : 启停整体调度
 * - POST /<task>   : 手动触发某项同步（teams/events/standings/leagues/live/aux/full）
 */
@Controller('bsd/sync')
export class BsdcSyncController {
  constructor(
    private readonly syncService: BsdcSyncService,
    private readonly scheduler: BsdcSyncScheduler,
  ) {}

  /** 同步总览（计数器 + 各任务上次执行时间） */
  @Get('status')
  async getSyncStatus() {
    const status = await this.syncService.getSyncStatus()
    return {
      ...status,
      nextRun: this.scheduler.getNextRuns(),
    }
  }

  /**
   * 冷启动就绪检查（部署健康检查用）
   * 返回冷启动是否完成及完成时间
   */
  @Get('ready')
  getReady() {
    const ready = this.scheduler.isColdStartReady()
    const readyAt = this.scheduler.getColdStartReadyAt()
    return {
      ready,
      readyAt,
    }
  }

  /** 启用调度 */
  @Post('enable')
  enable() {
    this.syncService.setEnabled(true)
    return { enabled: true }
  }

  /** 停用调度（手动/运维用） */
  @Post('disable')
  disable() {
    this.syncService.setEnabled(false)
    return { enabled: false }
  }

  // ==================== 手动触发单任务 ====================

  @Post('teams')
  async syncTeams() {
    return this.syncService.syncTeams()
  }

  @Post('leagues')
  async syncLeagues() {
    return this.syncService.syncLeagues()
  }

  @Post('events')
  async syncEvents() {
    return this.syncService.syncEvents()
  }

  @Post('live')
  async syncLive() {
    return this.syncService.syncLiveEvents()
  }

  @Post('standings')
  async syncStandings() {
    return this.syncService.syncStandings()
  }

  @Post('aux')
  async syncAux(@Body() body?: { limit?: number }) {
    return this.syncService.syncMatchAuxData(body?.limit ?? 20)
  }

  /** 手动触发球员同步 */
  @Post('players')
  async syncPlayers() {
    return this.syncService.syncPlayers()
  }

  /** 手动触发阵型聚合 */
  @Post('formations')
  async syncFormations() {
    await this.syncService.aggregateTeamFormations()
    return { ok: true }
  }

  /** 一键冷启动同步 */
  @Post('full')
  async syncFull() {
    const [teams, leagues, events, standings, live, aux, players] = await Promise.all([
      this.syncService.syncTeams(),
      this.syncService.syncLeagues(),
      this.syncService.syncEvents(),
      this.syncService.syncStandings(),
      this.syncService.syncLiveEvents(),
      this.syncService.syncMatchAuxData(20),
      this.syncService.syncPlayers(),
    ])
    return { teams, leagues, events, standings, live, aux, players }
  }

  /**
   * 一次性数据修复：根据 country 字段重新映射 country_code
   * 用于补全历史数据的国旗 / 国家代码
   */
  @Post('fix-team-country-codes')
  async fixTeamCountryCodes() {
    return this.syncService.fixTeamCountryCodes()
  }
}
