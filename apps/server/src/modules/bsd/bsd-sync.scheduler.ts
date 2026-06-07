import { Injectable, Logger, OnModuleInit, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BsdcSyncService } from './bsd-sync.service'

/**
 * BSD 同步调度器
 *
 * 多级频率：
 * - 10s   ：同步实时赛事（仅状态/比分/分钟，零拷贝快路径）
 * - 5min  ：同步赛事列表 + 比赛子数据（incidents/lineups/odds/stats/predictions）
 * - 30min ：同步积分榜
 * - 6h    ：同步球队 + 联赛元数据
 *
 * 通过 `setEnabled(false)` 可暂停整体调度。
 */
@Injectable()
export class BsdcSyncScheduler implements OnModuleInit, OnApplicationBootstrap {
  private readonly logger = new Logger(BsdcSyncScheduler.name)

  /** 各任务运行互斥锁（防止上一次未结束就触发下一次） */
  private readonly running = {
    live: false,
    events: false,
    aux: false,
    standings: false,
    teams: false,
    leagues: false,
  }

  /** BSD_ENABLED=false 时跳过整个调度 */
  private readonly bsdEnabled: boolean

  /** 调度器内部的轮询 timer 句柄 */
  private liveTimer: NodeJS.Timeout | null = null

  /** 各任务的下一次调度时刻（ms epoch） */
  private readonly nextRun = {
    events: 0,
    aux: 0,
    standings: 0,
    teams: 0,
    leagues: 0,
  }

  constructor(
    private readonly sync: BsdcSyncService,
    private readonly config: ConfigService,
  ) {
    this.bsdEnabled = (this.config.get<string>('BSD_ENABLED') ?? 'true') !== 'false'
  }

  // ==================== 生命周期 ====================

  /**
   * 在所有模块初始化完成后，调度器启动：先做一次冷启动完整同步，再进入定时调度
   */
  async onApplicationBootstrap() {
    if (!this.bsdEnabled) {
      this.logger.warn('BSD_ENABLED=false，跳过启动同步')
      return
    }
    // 冷启动：错开任务避免瞬时洪峰
    this.runColdStart()
    // 启动 10s 实时窗口（短间隔，用 setInterval 比 @Cron 更轻量）
    this.startLiveLoop()
    // 计算其它任务的下一次执行时刻
    this.scheduleNextRuns()
    this.logger.log('BSD 同步调度器已启动：10s 实时 / 5min 列表 / 30min 积分榜 / 6h 元数据')
  }

  onModuleInit() {
    // 留空：保留方法以满足生命周期接口
  }

  // ==================== 启动逻辑 ====================

  private async runColdStart() {
    // 错峰执行：避免瞬时打满 BSD API
    this.logger.log('冷启动：开始全量同步 BSD 数据')
    this.safeRun('leagues', () => this.sync.syncLeagues())
      .then(() => this.safeRun('teams', () => this.sync.syncTeams()))
      .then(() => this.safeRun('events', () => this.sync.syncEvents()))
      .then(() => this.safeRun('standings', () => this.sync.syncStandings()))
      .then(() => this.safeRun('aux', () => this.sync.syncMatchAuxData(20)))
      .catch((e) => this.logger.error(`cold start sync chain error: ${e?.message}`))
  }

  private startLiveLoop() {
    // 10s 实时窗口用 setInterval：精度高且开销低
    this.liveTimer = setInterval(() => {
      if (!this.sync.isEnabled()) return
      this.safeRun('live', () => this.sync.syncLiveEvents()).catch(() => undefined)
    }, 10_000)
  }

  private scheduleNextRuns() {
    const now = Date.now()
    this.nextRun.events = now + 5 * 60_000
    this.nextRun.aux = now + 5 * 60_000
    this.nextRun.standings = now + 30 * 60_000
    this.nextRun.teams = now + 6 * 60 * 60_000
    this.nextRun.leagues = now + 6 * 60 * 60_000

    setInterval(() => this.tickMediumFrequency(), 30_000)
  }

  /**
   * 每 30s tick 一次：判断是否到中/低频任务的执行时刻
   */
  private async tickMediumFrequency() {
    if (!this.sync.isEnabled()) return
    const now = Date.now()
    if (now >= this.nextRun.events) {
      await this.safeRun('events', () => this.sync.syncEvents())
      this.nextRun.events = now + 5 * 60_000
    }
    if (now >= this.nextRun.aux) {
      await this.safeRun('aux', () => this.sync.syncMatchAuxData(20))
      this.nextRun.aux = now + 5 * 60_000
    }
    if (now >= this.nextRun.standings) {
      await this.safeRun('standings', () => this.sync.syncStandings())
      this.nextRun.standings = now + 30 * 60_000
    }
    if (now >= this.nextRun.teams) {
      await this.safeRun('teams', () => this.sync.syncTeams())
      this.nextRun.teams = now + 6 * 60 * 60_000
    }
    if (now >= this.nextRun.leagues) {
      await this.safeRun('leagues', () => this.sync.syncLeagues())
      this.nextRun.leagues = now + 6 * 60 * 60_000
    }
  }

  // ==================== 工具方法 ====================

  private async safeRun(key: keyof typeof this.running, task: () => Promise<unknown>) {
    if (this.running[key]) {
      this.logger.warn(`[${key}] 上一次同步未结束，跳过本次触发`)
      return
    }
    this.running[key] = true
    try {
      await task()
    } catch (e) {
      this.logger.error(`[${key}] sync failed: ${(e as Error).message}`)
    } finally {
      this.running[key] = false
    }
  }

  /** 停止所有调度（用于关闭信号） */
  stop() {
    if (this.liveTimer) clearInterval(this.liveTimer)
    this.liveTimer = null
  }

  /** 取下次调度时刻（用于 /status 接口） */
  getNextRuns() {
    return { ...this.nextRun }
  }
}
