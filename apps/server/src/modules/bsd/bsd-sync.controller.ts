import { Controller, Get, Post, Body } from '@nestjs/common'
import { BsdcSyncService } from './bsd-sync.service'
import { BsdcSyncScheduler } from './bsd-sync.scheduler'

/**
 * BSD 数据同步控制器
 *
 * - /status    : 同步状态（计数器 + 各任务上次运行时间 + 下一轮时间）
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

  /** 一键冷启动同步 */
  @Post('full')
  async syncFull() {
    const [teams, leagues, events, standings, live, aux] = await Promise.all([
      this.syncService.syncTeams(),
      this.syncService.syncLeagues(),
      this.syncService.syncEvents(),
      this.syncService.syncStandings(),
      this.syncService.syncLiveEvents(),
      this.syncService.syncMatchAuxData(20),
    ])
    return { teams, leagues, events, standings, live, aux }
  }
}
