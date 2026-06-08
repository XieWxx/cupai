import { Injectable, Logger, OnModuleInit, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BsdcSyncService } from './bsd-sync.service'

/**
 * BSD 同步调度器
 *
 * 多级频率（均可通过环境变量覆盖）：
 * - BSD_SYNC_LIVE_INTERVAL_MS    (默认 10s)  ：同步实时赛事（仅状态/比分/分钟）
 * - BSD_SYNC_EVENTS_INTERVAL_MS  (默认 5min)  ：同步赛事列表 + 比赛子数据
 * - BSD_SYNC_AUX_INTERVAL_MS     (默认 5min)  ：同步 incidents/lineups/odds/stats/predictions
 * - BSD_SYNC_STANDINGS_INTERVAL_MS (默认 30min)：同步积分榜
 * - BSD_SYNC_TEAMS_INTERVAL_MS   (默认 6h)    ：同步球队元数据
 * - BSD_SYNC_LEAGUES_INTERVAL_MS (默认 6h)    ：同步联赛元数据
 * - BSD_SYNC_TICK_INTERVAL_MS    (默认 30s)   ：中频任务 tick 检查间隔
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

  /** 从环境变量读取的调度间隔（毫秒） */
  private readonly intervals: Record<string, number>

  constructor(
    private readonly sync: BsdcSyncService,
    private readonly config: ConfigService,
  ) {
    this.bsdEnabled = (this.config.get<string>('BSD_ENABLED') ?? 'true') !== 'false'
    // 从环境变量读取各任务间隔，未配置则使用默认值
    this.intervals = {
      live: this.parseMs('BSD_SYNC_LIVE_INTERVAL_MS', 5_000),            // 实时赛事：5秒
      events: this.parseMs('BSD_SYNC_EVENTS_INTERVAL_MS', 3 * 60_000),   // 赛事列表：3分钟
      aux: this.parseMs('BSD_SYNC_AUX_INTERVAL_MS', 3 * 60_000),         // 辅助数据：3分钟
      standings: this.parseMs('BSD_SYNC_STANDINGS_INTERVAL_MS', 15 * 60_000), // 积分榜：15分钟
      teams: this.parseMs('BSD_SYNC_TEAMS_INTERVAL_MS', 3 * 60 * 60_000),     // 球队：3小时
      leagues: this.parseMs('BSD_SYNC_LEAGUES_INTERVAL_MS', 3 * 60 * 60_000), // 联赛：3小时
      tick: this.parseMs('BSD_SYNC_TICK_INTERVAL_MS', 15_000),           // tick 检查：15秒
    }
  }

  /** 解析环境变量中的毫秒值，无效值回退到默认值 */
  private parseMs(key: string, defaultMs: number): number {
    const raw = this.config.get<string>(key)
    if (!raw) return defaultMs
    const val = Number(raw)
    if (Number.isNaN(val) || val < 1000) return defaultMs
    return val
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
    this.logger.log(`BSD 同步调度器已启动：${this.intervals.live / 1000}s 实时 / ${this.intervals.events / 60_000}min 列表 / ${this.intervals.standings / 60_000}min 积分榜 / ${this.intervals.teams / 3_600_000}h 元数据`)
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
    this.liveTimer = setInterval(() => {
      if (!this.sync.isEnabled()) return
      this.safeRun('live', () => this.sync.syncLiveEvents()).catch(() => undefined)
    }, this.intervals.live)
  }

  private scheduleNextRuns() {
    const now = Date.now()
    this.nextRun.events = now + this.intervals.events
    this.nextRun.aux = now + this.intervals.aux
    this.nextRun.standings = now + this.intervals.standings
    this.nextRun.teams = now + this.intervals.teams
    this.nextRun.leagues = now + this.intervals.leagues

    setInterval(() => this.tickMediumFrequency(), this.intervals.tick)
  }

  /**
   * 每 30s tick 一次：判断是否到中/低频任务的执行时刻
   */
  private async tickMediumFrequency() {
    if (!this.sync.isEnabled()) return
    const now = Date.now()
    if (now >= this.nextRun.events) {
      await this.safeRun('events', () => this.sync.syncEvents())
      this.nextRun.events = now + this.intervals.events
    }
    if (now >= this.nextRun.aux) {
      await this.safeRun('aux', () => this.sync.syncMatchAuxData(20))
      this.nextRun.aux = now + this.intervals.aux
    }
    if (now >= this.nextRun.standings) {
      await this.safeRun('standings', () => this.sync.syncStandings())
      this.nextRun.standings = now + this.intervals.standings
    }
    if (now >= this.nextRun.teams) {
      await this.safeRun('teams', () => this.sync.syncTeams())
      this.nextRun.teams = now + this.intervals.teams
    }
    if (now >= this.nextRun.leagues) {
      await this.safeRun('leagues', () => this.sync.syncLeagues())
      this.nextRun.leagues = now + this.intervals.leagues
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
