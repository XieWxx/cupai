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
    players: false,
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
    players: 0,
  }

  /** 从环境变量读取的调度间隔（毫秒） */
  private readonly intervals: Record<string, number>

  /** 冷启动是否完成（数据稳定检测通过后置为 true） */
  private coldStartReady = false

  /** 冷启动完成时间 */
  private coldStartReadyAt: Date | null = null

  /** 数据稳定检测最大轮次（防止无限循环） */
  private readonly STABILITY_MAX_ROUNDS = 3

  /** 数据稳定检测：两轮数据数量差异阈值（低于此值视为稳定） */
  private readonly STABILITY_THRESHOLD = 0

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
      players: this.parseMs('BSD_SYNC_PLAYERS_INTERVAL_MS', 3 * 60 * 60_000),  // 球员：3小时
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

  /**
   * 冷启动全量同步（带数据稳定检测）
   *
   * 流程：
   * 1. 执行一轮完整同步链：leagues → teams → events → standings → aux → players
   * 2. 记录各表数据数量
   * 3. 再执行一轮完整同步链
   * 4. 比较两轮数据数量，若所有表数量不变则认为数据稳定
   * 5. 若不稳定则继续循环，最多 STABILITY_MAX_ROUNDS 轮
   * 6. 稳定或达到最大轮次后，标记 coldStartReady = true
   */
  private async runColdStart() {
    this.logger.log('冷启动：开始全量同步 BSD 数据（含数据稳定检测）')

    let prevCounts: Record<string, number> | null = null
    let round = 0

    try {
      while (round < this.STABILITY_MAX_ROUNDS) {
        round++
        this.logger.log(`冷启动：第 ${round}/${this.STABILITY_MAX_ROUNDS} 轮同步开始`)

        // 链式执行全量同步（错峰，避免瞬时打满 BSD API）
        await this.safeRun('leagues', () => this.sync.syncLeagues())
        await this.safeRun('teams', () => this.sync.syncTeams())
        await this.safeRun('events', () => this.sync.syncEvents())
        await this.safeRun('standings', () => this.sync.syncStandings())
        await this.safeRun('aux', () => this.sync.syncMatchAuxData(20))
        await this.safeRun('players', () => this.sync.syncPlayers())

        // 获取当前各表数据数量
        const currentCounts = await this.sync.getDataCounts()

        this.logger.log(
          `冷启动：第 ${round} 轮同步完成，数据数量：` +
          Object.entries(currentCounts).map(([k, v]) => `${k}=${v}`).join(', '),
        )

        // 首轮无前值，记录后继续下一轮
        if (prevCounts === null) {
          prevCounts = currentCounts
          continue
        }

        // 比较两轮数据数量是否稳定
        const stable = this.checkDataStability(prevCounts, currentCounts)
        if (stable) {
          this.logger.log(`冷启动：数据已稳定（第 ${round} 轮与第 ${round - 1} 轮数量一致）`)
          break
        } else {
          this.logger.warn(
            `冷启动：数据尚未稳定，差异：` +
            this.getStabilityDiffDesc(prevCounts, currentCounts),
          )
          prevCounts = currentCounts
        }
      }

      if (round >= this.STABILITY_MAX_ROUNDS) {
        this.logger.warn(`冷启动：已达最大检测轮次 ${this.STABILITY_MAX_ROUNDS}，强制标记为就绪`)
      }
    } catch (e) {
      this.logger.error(`冷启动同步异常：${(e as Error)?.message}，仍标记为就绪以避免阻塞部署`)
    } finally {
      // 无论稳定检测是否通过，都标记冷启动完成（避免阻塞部署）
      this.coldStartReady = true
      this.coldStartReadyAt = new Date()
      this.logger.log(`冷启动：全量同步完成（共 ${round} 轮），coldStartReady = true`)
    }
  }

  /**
   * 检查两轮数据数量是否稳定
   * 所有表的差值 <= STABILITY_THRESHOLD 则认为稳定
   */
  private checkDataStability(
    prev: Record<string, number>,
    curr: Record<string, number>,
  ): boolean {
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(curr)])
    for (const key of allKeys) {
      const diff = Math.abs((curr[key] ?? 0) - (prev[key] ?? 0))
      if (diff > this.STABILITY_THRESHOLD) {
        return false
      }
    }
    return true
  }

  /** 生成两轮数据差异描述（用于日志） */
  private getStabilityDiffDesc(
    prev: Record<string, number>,
    curr: Record<string, number>,
  ): string {
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(curr)])
    const parts: string[] = []
    for (const key of allKeys) {
      const p = prev[key] ?? 0
      const c = curr[key] ?? 0
      if (c !== p) {
        parts.push(`${key}: ${p}→${c}(${c >= p ? '+' : ''}${c - p})`)
      }
    }
    return parts.length > 0 ? parts.join(', ') : '无差异'
  }

  /** 查询冷启动是否完成（供 Controller /ready 端点调用） */
  isColdStartReady(): boolean {
    return this.coldStartReady
  }

  /** 查询冷启动完成时间 */
  getColdStartReadyAt(): Date | null {
    return this.coldStartReadyAt
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
    this.nextRun.players = now + this.intervals.players

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
    if (now >= this.nextRun.players) {
      await this.safeRun('players', () => this.sync.syncPlayers())
      this.nextRun.players = now + this.intervals.players
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
