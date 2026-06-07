import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BsdcBusinessService } from './bsd.business.service'
import { MatchEntity } from '../match/entities/match.entity'
import { TeamEntity } from '../match/entities/team.entity'
import { GroupStandingEntity } from '../match/entities/group-standing.entity'
import { LeagueEntity } from '../match/entities/league.entity'
import { EventIncidentEntity } from '../match/entities/event-incident.entity'
import { EventLineupEntity } from '../match/entities/event-lineup.entity'
import { EventOddsEntity } from '../match/entities/event-odds.entity'
import { EventStatsEntity } from '../match/entities/event-stats.entity'
import { EventPredictionEntity } from '../match/entities/event-prediction.entity'
import {
  BsEvent,
  BsLineupSide,
  BsLineups,
  BsOdds,
  BsPrediction,
  BsStandingRow,
  BsStats,
} from './bsd.interfaces'

/** 国家名称 → ISO 3166-1 alpha-2 代码映射（覆盖 BSD API 常见值） */
const COUNTRY_TO_ISO: Record<string, string> = {
  // 世界杯相关国家队
  argentina: 'ar', brazil: 'br', belgium: 'be', france: 'fr', germany: 'de',
  spain: 'es', england: 'gb-eng', portugal: 'pt', netherlands: 'nl', italy: 'it',
  croatia: 'hr', morocco: 'ma', japan: 'jp', 'south korea': 'kr', mexico: 'mx',
  usa: 'us', canada: 'ca', uruguay: 'uy', colombia: 'co', chile: 'cl',
  ecuador: 'ec', peru: 'pe', switzerland: 'ch', denmark: 'dk', sweden: 'se',
  norway: 'no', poland: 'pl', austria: 'at', czechia: 'cz', serbia: 'rs',
  wales: 'gb-wls', scotland: 'gb-sct', ukraine: 'ua', russia: 'ru', turkey: 'tr',
  egypt: 'eg', nigeria: 'ng', ghana: 'gh', cameroon: 'cm', senegal: 'sn',
  tunisia: 'tn', algeria: 'dz', 'saudi arabia': 'sa', iran: 'ir', iraq: 'iq',
  australia: 'au', 'new zealand': 'nz', china: 'cn', 'costa rica': 'cr',
  jamaica: 'jm', panama: 'pa', honduras: 'hn', paraguay: 'py', bolivia: 'bo',
  venezuela: 've', romania: 'ro', hungary: 'hu', greece: 'gr', slovakia: 'sk',
  slovenia: 'si', ireland: 'ie', 'northern ireland': 'gb-nir', iceland: 'is',
  finland: 'fi', israel: 'il', 'south africa': 'za', mali: 'ml', ivorycoast: 'ci',
  "côte d'ivoire": 'ci', congo: 'cg', zambia: 'zm',
  // 联赛国家/地区
  africa: 'af', asia: 'as', europe: 'eu', 'south america': 'sa',
  'north america': 'na', oceania: 'oc',
}

/** 将 BSD 返回的国家名称转为 ISO 2 字母代码 */
function countryToIso(country: string | undefined | null): string {
  if (!country) return 'INT'
  const key = country.trim().toLowerCase()
  return COUNTRY_TO_ISO[key] || 'INT'
}

/** BSD 状态 → 项目标准状态 */
const STATUS_MAP: Record<string, string> = {
  notstarted: 'upcoming',
  inprogress: 'live',
  halftime: 'live',
  '2nd_half': 'live',
  '1st_half': 'live',
  extra_time: 'live',
  penalties: 'live',
  finished: 'finished',
  postponed: 'upcoming',
  cancelled: 'finished',
  abandoned: 'finished',
}

/** 根据 round_name 与 group_name 推断项目标准 stage */
function inferStage(roundName: string | null | undefined, groupName: string | null | undefined): string {
  const lower = (roundName || '').toLowerCase()
  if (groupName) return 'group'
  if (lower.includes('group')) return 'group'
  if (lower.includes('16') || lower.includes('round of 16')) return 'round16'
  if (lower.includes('quarter')) return 'quarter'
  if (lower.includes('semi')) return 'semi'
  if (lower.includes('final')) return 'final'
  if (lower.includes('play-off') || lower.includes('playoff') || lower.includes('play off')) return 'playoff'
  if (lower.includes('regular') || lower.includes('matchday')) return 'league'
  return roundName || 'league'
}

@Injectable()
export class BsdcSyncService {
  private readonly logger = new Logger(BsdcSyncService.name)

  /** 调度器运行开关（由 Scheduler / Controller 维护） */
  private enabled = true
  /** 最近一次同步完成时间（用于 /status 接口） */
  private lastRunAt: Date | null = null
  /** 各 sync 任务最近一次结束时间与耗时 */
  private lastRuns: Record<string, { at: Date | null; durationMs: number; ok: boolean; detail?: string }> = {
    live: { at: null, durationMs: 0, ok: true },
    events: { at: null, durationMs: 0, ok: true },
    teams: { at: null, durationMs: 0, ok: true },
    leagues: { at: null, durationMs: 0, ok: true },
    standings: { at: null, durationMs: 0, ok: true },
    aux: { at: null, durationMs: 0, ok: true },
  }

  constructor(
    private readonly bsdService: BsdcBusinessService,
    @InjectRepository(MatchEntity) private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(TeamEntity) private readonly teamRepo: Repository<TeamEntity>,
    @InjectRepository(GroupStandingEntity) private readonly standingRepo: Repository<GroupStandingEntity>,
    @InjectRepository(LeagueEntity) private readonly leagueRepo: Repository<LeagueEntity>,
    @InjectRepository(EventIncidentEntity) private readonly incidentRepo: Repository<EventIncidentEntity>,
    @InjectRepository(EventLineupEntity) private readonly lineupRepo: Repository<EventLineupEntity>,
    @InjectRepository(EventOddsEntity) private readonly oddsRepo: Repository<EventOddsEntity>,
    @InjectRepository(EventStatsEntity) private readonly statsRepo: Repository<EventStatsEntity>,
    @InjectRepository(EventPredictionEntity) private readonly predictionRepo: Repository<EventPredictionEntity>,
  ) {}

  // ==================== 调度器辅助 ====================

  setEnabled(value: boolean) {
    this.enabled = value
    this.logger.warn(`BSD 同步调度已${value ? '启用' : '停用'}`)
  }

  isEnabled(): boolean {
    return this.enabled
  }

  /** 记录一次同步结果 */
  private recordRun(key: keyof typeof this.lastRuns, startedAt: number, ok: boolean, detail?: string) {
    this.lastRuns[key] = {
      at: new Date(),
      durationMs: Date.now() - startedAt,
      ok,
      detail,
    }
    this.lastRunAt = new Date()
  }

  // ==================== 球队 ====================

  /**
   * 同步球队列表（拉取所有球队 + 国旗/详情补全）
   * @returns { created, updated }
   */
  async syncTeams(): Promise<{ created: number; updated: number }> {
    const started = Date.now()
    let created = 0
    let updated = 0
    try {
      const teams = await this.bsdService.getTeams({ limit: 200 })
      for (const bsTeam of (teams.results ?? [])) {
        const bsdId = String(bsTeam.id)
        const isoCode = countryToIso(bsTeam.country)
        const existing = await this.teamRepo.findOne({ where: { dataSource: `bsd_${bsdId}` } })
        if (existing) {
          existing.name = bsTeam.name
          existing.nameEn = bsTeam.name
          existing.countryCode = isoCode
          existing.country = bsTeam.country || null
          existing.logo = bsTeam.logo || null
          existing.bsTeamId = bsTeam.id
          existing.isNational = !!bsTeam.is_national
          existing.venueName = bsTeam.venue_name || null
          existing.founded = bsTeam.founded || null
          existing.lastSyncedAt = new Date()
          await this.teamRepo.save(existing)
          updated++
        } else {
          const team = this.teamRepo.create({
            bsTeamId: bsTeam.id,
            name: bsTeam.name,
            nameEn: bsTeam.name,
            countryCode: isoCode,
            country: bsTeam.country || null,
            logo: bsTeam.logo || null,
            isNational: !!bsTeam.is_national,
            venueName: bsTeam.venue_name || null,
            founded: bsTeam.founded || null,
            dataSource: `bsd_${bsdId}`,
            dataSourceUrl: `https://sports.bzzoiro.com/api/v2/teams/${bsdId}/`,
            lastSyncedAt: new Date(),
          })
          await this.teamRepo.save(team)
          created++
        }
      }
      this.recordRun('teams', started, true, `+${created}/~${updated}`)
    } catch (error) {
      this.recordRun('teams', started, false, error?.message)
      this.logger.error(`Sync teams failed: ${error?.message}`)
    }
    return { created, updated }
  }

  // ==================== 联赛 ====================

  /**
   * 同步联赛列表（带 current_season）
   */
  async syncLeagues(): Promise<{ created: number; updated: number }> {
    const started = Date.now()
    let created = 0
    let updated = 0
    try {
      const leagues = await this.bsdService.getLeagues({ limit: 200 })
      for (const bsLeague of (leagues.results ?? [])) {
        const existing = await this.leagueRepo.findOne({ where: { bsLeagueId: bsLeague.id } })
        const payload: Partial<LeagueEntity> = {
          bsLeagueId: bsLeague.id,
          bsSeasonId: bsLeague.current_season?.id ?? null,
          name: bsLeague.name,
          nameZh: bsLeague.name,
          country: bsLeague.country,
          isWomen: !!bsLeague.is_women,
          isActive: !!bsLeague.is_active,
          seasonName: bsLeague.current_season?.name ?? null,
          seasonYear: bsLeague.current_season?.year ?? null,
          seasonStart: bsLeague.current_season?.start_date ?? null,
          seasonEnd: bsLeague.current_season?.end_date ?? null,
          isCurrentSeason: !!bsLeague.current_season?.is_current,
          lastSyncedAt: new Date(),
        }
        if (existing) {
          Object.assign(existing, payload)
          await this.leagueRepo.save(existing)
          updated++
        } else {
          const entity = this.leagueRepo.create({ ...payload, dataSource: 'bsd' })
          await this.leagueRepo.save(entity)
          created++
        }
      }
      this.recordRun('leagues', started, true, `+${created}/~${updated}`)
    } catch (error) {
      this.recordRun('leagues', started, false, error?.message)
      this.logger.error(`Sync leagues failed: ${error?.message}`)
    }
    return { created, updated }
  }

  // ==================== 赛事（列表） ====================

  /**
   * 同步赛事列表：近 1 天 ~ 未来 30 天
   * 写入 MatchEntity 主体字段（基础 + 比赛阶段 + 状态）
   */
  async syncEvents(): Promise<{ created: number; updated: number }> {
    const started = Date.now()
    let created = 0
    let updated = 0
    try {
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 1)
      const toDate = new Date()
      toDate.setDate(toDate.getDate() + 30)
      const events = await this.bsdService.getEvents({
        date_from: fromDate.toISOString().split('T')[0],
        date_to: toDate.toISOString().split('T')[0],
        limit: 200,
      })

      // 联赛 ID → 联赛名称
      const leagueNameMap = await this.buildLeagueNameMap()
      // 球队 ID → 实体
      const teamCache = new Map<number, TeamEntity>()

      for (const bsEvent of (events.results ?? [])) {
        try {
          const result = await this.upsertMatch(bsEvent, leagueNameMap, teamCache)
          if (result === 'created') created++
          else updated++
        } catch (e) {
          this.logger.warn(`upsert event ${bsEvent.id} failed: ${(e as Error).message}`)
        }
      }
      this.recordRun('events', started, true, `+${created}/~${updated}`)
    } catch (error) {
      this.recordRun('events', started, false, error?.message)
      this.logger.error(`Sync events failed: ${error?.message}`)
    }
    return { created, updated }
  }

  /**
   * 同步实时赛事（BSD /events/live/）
   * 由 Scheduler 每 10s 触发
   */
  async syncLiveEvents(): Promise<{ updated: number; liveCount: number }> {
    const started = Date.now()
    let updated = 0
    let liveCount = 0
    try {
      const live = await this.bsdService.getLiveEvents({})
      for (const bsEvent of (live.results ?? [])) {
        liveCount++
        // 实时窗口只更新状态/比分/分钟，不重建球队
        const bsdId = String(bsEvent.id)
        const match = await this.matchRepo.findOne({ where: { dataSource: `bsd_${bsdId}` } })
        if (!match) {
          // 新增实时窗口内的赛事：fallback 到标准 upsert
          const leagueNameMap = await this.buildLeagueNameMap()
          await this.upsertMatch(bsEvent, leagueNameMap)
          updated++
          continue
        }
        match.status = STATUS_MAP[bsEvent.status] || match.status
        match.bsStatus = bsEvent.status
        match.period = bsEvent.period || match.period
        match.currentMinute = bsEvent.current_minute ?? match.currentMinute
        match.homeScore = bsEvent.home_score ?? match.homeScore
        match.awayScore = bsEvent.away_score ?? match.awayScore
        match.halfTimeHome = bsEvent.home_score_ht ?? match.halfTimeHome
        match.halfTimeAway = bsEvent.away_score_ht ?? match.halfTimeAway
        match.penaltyShootout = bsEvent.penalty_shootout
          ? { home: bsEvent.penalty_shootout, away: bsEvent.penalty_shootout }
          : match.penaltyShootout
        match.liveWebsocket = !!bsEvent.live_websocket
        match.lastSyncedAt = new Date()
        await this.matchRepo.save(match)
        updated++
      }
      this.recordRun('live', started, true, `live=${liveCount}/updated=${updated}`)
    } catch (error) {
      this.recordRun('live', started, false, error?.message)
      this.logger.error(`Sync live events failed: ${error?.message}`)
    }
    return { updated, liveCount }
  }

  /**
   * 同步进行中或 24h 内完赛的赛事的子数据（incidents/lineups/odds/stats/predictions）
   * 由 Scheduler 周期触发（5min）
   */
  async syncMatchAuxData(limit = 20): Promise<{ matches: number; incidents: number; lineups: number; odds: number; stats: number; predictions: number }> {
    const started = Date.now()
    const result = { matches: 0, incidents: 0, lineups: 0, odds: 0, stats: 0, predictions: 0 }
    try {
      // 候选：状态 inprogress/finished 24h 内 + 即将开始 6h 内
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const lookahead = new Date(Date.now() + 6 * 60 * 60 * 1000)
      const candidates = await this.matchRepo
        .createQueryBuilder('m')
        .where('(m.status IN (:...st) OR (m.status = :upcoming AND m.startTime BETWEEN :now AND :ahead))', {
          st: ['live', 'finished'],
          upcoming: 'upcoming',
          now: cutoff,
          ahead: lookahead,
        })
        .orderBy('m.startTime', 'DESC')
        .take(limit)
        .getMany()

      for (const m of candidates) {
        if (!m.dataSource?.startsWith('bsd_')) continue
        const bsEventId = Number(m.dataSource.replace('bsd_', ''))
        if (Number.isNaN(bsEventId)) continue
        result.matches++
        try {
          // 事件流（已结束 24h 内 / 进行中）
          if (m.status === 'live' || m.status === 'finished') {
            result.incidents += await this.syncIncidents(m, bsEventId)
            result.stats += (await this.syncStats(m, bsEventId)) ? 1 : 0
          }
          // 阵容（即将开始 6h 内 / 进行中 / 已结束 24h 内）
          if (m.startTime <= lookahead) {
            result.lineups += await this.syncLineups(m, bsEventId)
          }
          // 赔率（即将开始 24h 内 / 进行中）
          if (m.status !== 'finished' || m.startTime >= cutoff) {
            result.odds += (await this.syncOdds(m, bsEventId)) ? 1 : 0
          }
          // AI 预测（即将开始 / 进行中）
          if (m.status !== 'finished') {
            result.predictions += await this.syncPredictions(m, bsEventId)
          }
        } catch (e) {
          this.logger.warn(`aux sync for match ${m.id} failed: ${(e as Error).message}`)
        }
      }
      this.recordRun('aux', started, true, JSON.stringify(result))
    } catch (error) {
      this.recordRun('aux', started, false, error?.message)
      this.logger.error(`Sync match aux data failed: ${error?.message}`)
    }
    return result
  }

  // ==================== 积分榜 ====================

  /**
   * 同步所有活跃联赛的积分榜
   */
  async syncStandings(): Promise<{ leagues: number; rows: number }> {
    const started = Date.now()
    let leagues = 0
    let rows = 0
    try {
      const leaguesList = await this.bsdService.getLeagues({ limit: 200 })
      for (const league of (leaguesList.results ?? [])) {
        if (!league.is_active) continue
        try {
          const standings = await this.bsdService.getLeagueStandings(league.id)
          if (!standings?.standings) continue
          leagues++

          // BSD 没有 group_name（小组赛），仅 league 整体排名；
          // 兼容旧数据：写入 groupName='LEAGUE' 以便前端按联赛展示
          for (const row of standings.standings) {
            await this.upsertStanding(league, standings.season, row, 'LEAGUE')
            rows++
          }
        } catch (e) {
          this.logger.warn(`sync standings for league ${league.id} failed: ${(e as Error).message}`)
        }
      }
      this.recordRun('standings', started, true, `leagues=${leagues}/rows=${rows}`)
    } catch (error) {
      this.recordRun('standings', started, false, error?.message)
      this.logger.error(`Sync standings failed: ${error?.message}`)
    }
    return { leagues, rows }
  }

  // ==================== 状态/对外 ====================

  /**
   * 获取同步状态（供 Controller /status 接口）
   */
  async getSyncStatus() {
    const [matchCount, teamCount, leagueCount, standingCount, incidentCount, lineupCount, oddsCount, statsCount, predictionCount] =
      await Promise.all([
        this.matchRepo.count(),
        this.teamRepo.count(),
        this.leagueRepo.count(),
        this.standingRepo.count(),
        this.incidentRepo.count(),
        this.lineupRepo.count(),
        this.oddsRepo.count(),
        this.statsRepo.count(),
        this.predictionRepo.count(),
      ])
    return {
      enabled: this.enabled,
      lastRunAt: this.lastRunAt,
      counters: {
        match: matchCount,
        team: teamCount,
        league: leagueCount,
        standing: standingCount,
        incident: incidentCount,
        lineup: lineupCount,
        odds: oddsCount,
        stats: statsCount,
        prediction: predictionCount,
      },
      runs: this.lastRuns,
    }
  }

  // ==================== 私有方法 ====================

  /** 构造联赛 ID → 名称映射（联赛尚未 sync 时可临时回填） */
  private async buildLeagueNameMap(): Promise<Map<number, string>> {
    const map = new Map<number, string>()
    // 优先从本地库
    const local = await this.leagueRepo.find()
    for (const l of local) map.set(l.bsLeagueId, l.nameZh || l.name)
    // 兜底：BSD 实时取
    try {
      const remote = await this.bsdService.getLeagues({ limit: 200 })
      for (const l of remote.results ?? []) {
        if (!map.has(l.id)) map.set(l.id, l.name)
      }
    } catch {
      /* ignore */
    }
    return map
  }

  /** 通用 upsert：写入赛事主体字段 */
  private async upsertMatch(
    bsEvent: BsEvent,
    leagueNameMap: Map<number, string>,
    teamCache?: Map<number, TeamEntity>,
  ): Promise<'created' | 'updated'> {
    const bsdId = String(bsEvent.id)
    const leagueName = leagueNameMap.get(bsEvent.league_id) || `联赛${bsEvent.league_id}`
    const homeTeam = await this.getOrCreateTeam(bsEvent.home_team_id, bsEvent.home_team, teamCache)
    const awayTeam = await this.getOrCreateTeam(bsEvent.away_team_id, bsEvent.away_team, teamCache)
    const status = STATUS_MAP[bsEvent.status] || 'upcoming'
    const stage = inferStage(bsEvent.round_name, bsEvent.group_name)
    const startTime = new Date(bsEvent.event_date)

    let match = await this.matchRepo.findOne({ where: { dataSource: `bsd_${bsdId}` } })
    const baseFields: Partial<MatchEntity> = {
      leagueId: bsEvent.league_id,
      seasonId: bsEvent.season_id ?? null,
      leagueName,
      stage,
      groupName: bsEvent.group_name || null,
      roundName: bsEvent.round_name || null,
      roundNumber: bsEvent.round_number ?? null,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeTeamBsdId: bsEvent.home_team_id,
      awayTeamBsdId: bsEvent.away_team_id,
      startTime,
      status,
      bsStatus: bsEvent.status,
      period: bsEvent.period || null,
      currentMinute: bsEvent.current_minute ?? null,
      homeScore: bsEvent.home_score ?? null,
      awayScore: bsEvent.away_score ?? null,
      halfTimeHome: bsEvent.home_score_ht ?? null,
      halfTimeAway: bsEvent.away_score_ht ?? null,
      penaltyShootout: bsEvent.penalty_shootout
        ? { home: Number(bsEvent.penalty_shootout), away: Number(bsEvent.penalty_shootout) }
        : null,
      venueId: bsEvent.venue_id ?? null,
      homeCoachId: bsEvent.home_coach_id ?? null,
      awayCoachId: bsEvent.away_coach_id ?? null,
      refereeId: bsEvent.referee_id ?? null,
      isLocalDerby: !!bsEvent.is_local_derby,
      isNeutralGround: !!bsEvent.is_neutral_ground,
      liveWebsocket: !!bsEvent.live_websocket,
      lastSyncedAt: new Date(),
      dataSource: `bsd_${bsdId}`,
      dataSourceUrl: `https://sports.bzzoiro.com/api/v2/events/${bsdId}/`,
    }
    if (match) {
      Object.assign(match, baseFields)
      await this.matchRepo.save(match)
      return 'updated'
    }
    const entity = this.matchRepo.create(baseFields)
    await this.matchRepo.save(entity)
    return 'created'
  }

  /** 通用 upsert：球队 */
  private async getOrCreateTeam(bsdId: number, name: string, cache?: Map<number, TeamEntity>): Promise<TeamEntity> {
    const cacheHit = cache?.get(bsdId)
    if (cacheHit) return cacheHit
    const key = `bsd_${bsdId}`
    let team = await this.teamRepo.findOne({ where: { dataSource: key } })
    if (!team) {
      let isoCode = 'INT'
      let country: string | null = null
      let logo: string | null = null
      let venueName: string | null = null
      let isNational = false
      let founded: number | null = null
      try {
        const detail = (await this.bsdService.getTeamDetail(bsdId)) as {
          country?: string
          logo?: string
          is_national?: boolean
          venue_name?: string
          founded?: number
        }
        isoCode = countryToIso(detail?.country)
        country = detail?.country || null
        logo = detail?.logo || null
        venueName = detail?.venue_name || null
        isNational = !!detail?.is_national
        founded = detail?.founded || null
      } catch {
        /* 兜底用默认值 */
      }
      team = this.teamRepo.create({
        bsTeamId: bsdId,
        name,
        nameEn: name,
        countryCode: isoCode,
        country,
        logo,
        isNational,
        venueName,
        founded,
        dataSource: key,
        dataSourceUrl: `https://sports.bzzoiro.com/api/v2/teams/${bsdId}/`,
        lastSyncedAt: new Date(),
      })
      await this.teamRepo.save(team)
    } else if (team.countryCode === 'INT') {
      // 已有但 country 为默认值，尝试补充
      try {
        const detail = (await this.bsdService.getTeamDetail(bsdId)) as { country?: string; logo?: string }
        if (detail?.country) {
          team.countryCode = countryToIso(detail.country)
          team.country = detail.country
          if (detail.logo) team.logo = detail.logo
          team.lastSyncedAt = new Date()
          await this.teamRepo.save(team)
        }
      } catch {
        /* ignore */
      }
    }
    cache?.set(bsdId, team)
    return team
  }

  /** 通用 upsert：积分榜单行 */
  private async upsertStanding(
    league: { id: number; name: string },
    season: { id?: number; name?: string } | undefined,
    row: BsStandingRow,
    groupName: string,
  ) {
    // 球队：可能本地无此队（积分榜来自非同步联赛），按需创建
    const team = await this.getOrCreateTeam(row.team_id, row.team_name)
    const dataSource = `bsd_${league.id}_${season?.id ?? 'cur'}_${row.team_id}`
    let standing = await this.standingRepo.findOne({ where: { dataSource } })
    const payload: Partial<GroupStandingEntity> = {
      leagueId: league.id,
      seasonId: season?.id ?? null,
      groupName,
      teamId: team.id,
      played: row.played,
      wins: row.won,
      draws: row.drawn,
      losses: row.lost,
      goalsFor: row.gf,
      goalsAgainst: row.ga,
      goalDifference: row.gd,
      points: row.pts,
      rankPosition: row.position,
      xgf: row.xgf ?? null,
      xga: row.xga ?? null,
      form: row.form || null,
      bsPosition: row.position,
      dataSource,
      lastSyncedAt: new Date(),
    }
    if (standing) {
      Object.assign(standing, payload)
      await this.standingRepo.save(standing)
    } else {
      await this.standingRepo.save(this.standingRepo.create(payload))
    }
  }

  // ==================== 子数据同步 ====================

  /** 同步事件流：返回写入条数 */
  private async syncIncidents(match: MatchEntity, bsEventId: number): Promise<number> {
    const resp = await this.bsdService.getEventIncidents(bsEventId)
    let n = 0
    for (const inc of resp.incidents ?? []) {
      const exists = await this.incidentRepo.findOne({ where: { bsIncidentId: inc.id } })
      const isSubstitution = inc.type === 'substitution'
      const payload: Partial<EventIncidentEntity> = {
        matchId: match.id,
        bsIncidentId: inc.id,
        bsEventId,
        type: inc.type,
        detail: inc.detail || inc.goal_type || inc.card_type || null,
        minute: inc.minute,
        extraMinute: inc.extra_time ?? null,
        playerId: inc.player_id ?? null,
        playerName: inc.player_name,
        assistPlayerName: inc.assist_player_name,
        playerInId: isSubstitution ? inc.player_in_id ?? null : null,
        playerInName: isSubstitution ? inc.player_in ?? null : null,
        playerOutId: isSubstitution ? inc.player_id : null,
        playerOutName: isSubstitution ? inc.player_name : null,
        isHome: typeof inc.is_home === 'boolean' ? inc.is_home : null,
        teamId: inc.team_id,
        team: inc.team,
        homeScoreAtIncident: inc.home_score,
        awayScoreAtIncident: inc.away_score,
        reason: inc.reason,
      }
      if (exists) {
        Object.assign(exists, payload)
        await this.incidentRepo.save(exists)
      } else {
        await this.incidentRepo.save(this.incidentRepo.create(payload))
        n++
      }
    }
    return n
  }

  /** 同步阵容：返回写入条数 */
  private async syncLineups(match: MatchEntity, bsEventId: number): Promise<number> {
    const resp = (await this.bsdService.getEventLineups(bsEventId)) as BsLineups
    if (!resp.lineups) return 0
    let n = 0
    // 每次同步前清理旧记录（同 match 内）
    await this.lineupRepo.delete({ matchId: match.id })
    for (const side of ['home', 'away'] as const) {
      const lineupSide: BsLineupSide | undefined = resp.lineups[side]
      if (!lineupSide) continue
      const formation = lineupSide.formation
      const confidence = lineupSide.confidence
      for (const p of lineupSide.players ?? []) {
        await this.lineupRepo.save(
          this.lineupRepo.create({
            matchId: match.id,
            bsEventId,
            side,
            isStarter: true,
            bsPlayerId: p.id,
            playerName: p.name,
            shortName: p.short_name,
            position: p.position,
            jerseyNumber: p.jersey_number,
            aiScore: p.ai_score ?? null,
            lineupStatus: resp.lineup_status || 'predicted',
            formation,
            confidence,
          }),
        )
        n++
      }
      for (const p of lineupSide.substitutes ?? []) {
        await this.lineupRepo.save(
          this.lineupRepo.create({
            matchId: match.id,
            bsEventId,
            side,
            isStarter: false,
            bsPlayerId: p.id,
            playerName: p.name,
            shortName: p.short_name,
            position: p.position,
            jerseyNumber: p.jersey_number,
            aiScore: p.ai_score ?? null,
            lineupStatus: resp.lineup_status || 'predicted',
            formation,
            confidence,
          }),
        )
        n++
      }
    }
    return n
  }

  /** 同步赔率：返回是否写入 */
  private async syncOdds(match: MatchEntity, bsEventId: number): Promise<boolean> {
    let resp: BsOdds
    try {
      resp = await this.bsdService.getEventOdds(bsEventId)
    } catch {
      return false
    }
    if (!resp?.odds) return false
    let entity = await this.oddsRepo.findOne({ where: { matchId: match.id } })
    const payload: Partial<EventOddsEntity> = {
      matchId: match.id,
      bsEventId,
      homeWin: resp.odds.home_win,
      draw: resp.odds.draw,
      awayWin: resp.odds.away_win,
      over15Goals: resp.odds.over_15_goals,
      over25Goals: resp.odds.over_25_goals,
      over35Goals: resp.odds.over_35_goals,
      under15Goals: resp.odds.under_15_goals,
      under25Goals: resp.odds.under_25_goals,
      under35Goals: resp.odds.under_35_goals,
      bttsYes: resp.odds.btts_yes,
      bttsNo: resp.odds.btts_no,
    }
    if (entity) {
      Object.assign(entity, payload)
      await this.oddsRepo.save(entity)
    } else {
      await this.oddsRepo.save(this.oddsRepo.create(payload))
    }
    return true
  }

  /** 同步赛事统计：返回是否写入 */
  private async syncStats(match: MatchEntity, bsEventId: number): Promise<boolean> {
    let resp: BsStats
    try {
      resp = await this.bsdService.getEventStats(bsEventId)
    } catch {
      return false
    }
    if (!resp?.stats) return false
    const home = resp.stats.home || {}
    const away = resp.stats.away || {}
    const getNum = (v: unknown): number | null => {
      if (v == null) return null
      if (typeof v === 'number') return v
      if (typeof v === 'object' && v && 'actual' in (v as Record<string, unknown>)) {
        const n = (v as { actual: unknown }).actual
        return typeof n === 'number' ? n : null
      }
      return null
    }
    let entity = await this.statsRepo.findOne({ where: { matchId: match.id } })
    const payload: Partial<EventStatsEntity> = {
      matchId: match.id,
      bsEventId,
      homeTotalShots: getNum(home.total_shots),
      homeShotsOnTarget: getNum(home.shots_on_target),
      homePossession: getNum(home.ball_possession),
      homePasses: getNum(home.passes),
      homePassAccuracy: getNum(home.pass_accuracy_pct),
      homeCorners: getNum(home.corners),
      homeFouls: getNum(home.fouls),
      homeXg: getNum(home.xg),
      awayTotalShots: getNum(away.total_shots),
      awayShotsOnTarget: getNum(away.shots_on_target),
      awayPossession: getNum(away.ball_possession),
      awayPasses: getNum(away.passes),
      awayPassAccuracy: getNum(away.pass_accuracy_pct),
      awayCorners: getNum(away.corners),
      awayFouls: getNum(away.fouls),
      awayXg: getNum(away.xg),
      stats: resp.stats as unknown as Record<string, unknown>,
      shotmap: (resp.shotmap as unknown as Record<string, unknown>[]) || [],
      momentum: (resp.momentum as unknown as Record<string, unknown>[]) || [],
      averagePositions: (resp.average_positions as Record<string, unknown>) || {},
      xgPerMinute: (resp.xg_per_minute as unknown as Record<string, unknown>[]) || [],
    }
    if (entity) {
      Object.assign(entity, payload)
      await this.statsRepo.save(entity)
    } else {
      await this.statsRepo.save(this.statsRepo.create(payload))
    }
    return true
  }

  /** 同步 BSD AI 预测：返回写入条数 */
  private async syncPredictions(match: MatchEntity, bsEventId: number): Promise<number> {
    let resp: { results: BsPrediction[] }
    try {
      resp = await this.bsdService.getPredictions({ event_id: bsEventId, limit: 1 })
    } catch {
      return 0
    }
    if (!resp?.results?.length) return 0
    const pred = resp.results[0]
    let entity = await this.predictionRepo.findOne({ where: { bsPredictionId: pred.id } })
    const payload: Partial<EventPredictionEntity> = {
      matchId: match.id,
      bsEventId,
      bsPredictionId: pred.id,
      probHome: pred.markets?.match_result?.prob_home ?? null,
      probDraw: pred.markets?.match_result?.prob_draw ?? null,
      probAway: pred.markets?.match_result?.prob_away ?? null,
      predicted: pred.markets?.match_result?.predicted ?? null,
      expectedGoalsHome: pred.markets?.expected_goals?.home ?? null,
      expectedGoalsAway: pred.markets?.expected_goals?.away ?? null,
      probOver15: pred.markets?.over_under?.prob_over_15 ?? null,
      probOver25: pred.markets?.over_under?.prob_over_25 ?? null,
      probOver35: pred.markets?.over_under?.prob_over_35 ?? null,
      probBttsYes: pred.markets?.btts?.prob_yes ?? null,
      mostLikelyScore: pred.markets?.score?.most_likely ?? null,
      favorite: pred.recommendations?.favorite ?? null,
      favoriteProb: pred.recommendations?.favorite_prob ?? null,
      modelVersion: pred.model?.version ?? null,
      confidence: pred.model?.confidence ?? null,
      recommendations: (pred.recommendations as unknown as Record<string, unknown>) ?? null,
      bsCreatedAt: pred.created_at ? new Date(pred.created_at) : null,
    }
    if (entity) {
      Object.assign(entity, payload)
      await this.predictionRepo.save(entity)
      return 0
    }
    await this.predictionRepo.save(this.predictionRepo.create(payload))
    return 1
  }
}
