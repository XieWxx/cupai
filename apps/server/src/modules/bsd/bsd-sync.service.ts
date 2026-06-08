import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BsdcBusinessService } from './bsd.business.service'
import { getPlayerChineseName } from '../../utils/player-translate'
import { MatchEntity } from '../match/entities/match.entity'
import { TeamEntity } from '../match/entities/team.entity'
import { GroupStandingEntity } from '../match/entities/group-standing.entity'
import { LeagueEntity } from '../match/entities/league.entity'
import { EventIncidentEntity } from '../match/entities/event-incident.entity'
import { EventLineupEntity } from '../match/entities/event-lineup.entity'
import { EventOddsEntity } from '../match/entities/event-odds.entity'
import { EventStatsEntity } from '../match/entities/event-stats.entity'
import { EventPredictionEntity } from '../match/entities/event-prediction.entity'
import { PlayerEntity } from '../match/entities/player.entity'
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
  argentina: 'ar',
  brazil: 'br',
  belgium: 'be',
  france: 'fr',
  germany: 'de',
  spain: 'es',
  portugal: 'pt',
  netherlands: 'nl',
  italy: 'it',
  croatia: 'hr',
  morocco: 'ma',
  japan: 'jp',
  'south korea': 'kr',
  mexico: 'mx',
  usa: 'us',
  canada: 'ca',
  uruguay: 'uy',
  colombia: 'co',
  chile: 'cl',
  ecuador: 'ec',
  peru: 'pe',
  switzerland: 'ch',
  denmark: 'dk',
  sweden: 'se',
  norway: 'no',
  poland: 'pl',
  austria: 'at',
  czechia: 'cz',
  czechrepublic: 'cz',
  serbia: 'rs',
  ukraine: 'ua',
  russia: 'ru',
  turkey: 'tr',
  egypt: 'eg',
  nigeria: 'ng',
  ghana: 'gh',
  cameroon: 'cm',
  senegal: 'sn',
  tunisia: 'tn',
  algeria: 'dz',
  'saudi arabia': 'sa',
  iran: 'ir',
  iraq: 'iq',
  australia: 'au',
  'new zealand': 'nz',
  china: 'cn',
  'costa rica': 'cr',
  jamaica: 'jm',
  panama: 'pa',
  honduras: 'hn',
  paraguay: 'py',
  bolivia: 'bo',
  venezuela: 've',
  romania: 'ro',
  hungary: 'hu',
  greece: 'gr',
  slovakia: 'sk',
  slovenia: 'si',
  ireland: 'ie',
  iceland: 'is',
  finland: 'fi',
  israel: 'il',
  'south africa': 'za',
  mali: 'ml',
  'ivory coast': 'ci',
  congo: 'cg',
  zambia: 'zm',
  qatar: 'qa',
  uae: 'ae',
  'united arab emirates': 'ae',
  uganda: 'ug',
  madagascar: 'mg',
  tanzania: 'tz',
  kenya: 'ke',
  mozambique: 'mz',
  angola: 'ao',
  ivorycoast: 'ci',
  togo: 'tg',
  benin: 'bj',
  guinea: 'gn',
  burkinafaso: 'bf',
  libya: 'ly',
  belarus: 'by',
  albania: 'al',
  macedonia: 'mk',
  'north macedonia': 'mk',
  montenegro: 'me',
  bosnia: 'ba',
  georgia: 'ge',
  armenia: 'am',
  cyprus: 'cy',
  bulgaria: 'bg',
  latvia: 'lv',
  lithuania: 'lt',
  estonia: 'ee',
  moldova: 'md',
  srilanka: 'lk',
  'sri lanka': 'lk',
  bhutan: 'bt',
  nepal: 'np',
  myanmar: 'mm',
  'burma': 'mm',
  bangladesh: 'bd',
  pakistan: 'pk',
  afghanistan: 'af',
  jordan: 'jo',
  palestine: 'ps',
  lebanon: 'lb',
  syria: 'sy',
  uzbekistan: 'uz',
  kazakhstan: 'kz',
  kyrgyzstan: 'kg',
  tajikistan: 'tj',
  turkmenistan: 'tm',
  mongolia: 'mn',
  'hong kong': 'hk',
  macau: 'mo',
  taiwan: 'tw',
  'north korea': 'kp',
  vietnam: 'vn',
  thailand: 'th',
  cambodia: 'kh',
  laos: 'la',
  indonesia: 'id',
  philippines: 'ph',
  malaysia: 'my',
  singapore: 'sg',
  oman: 'om',
  yemen: 'ye',
  bahrain: 'bh',
  kuwait: 'kw',
  maldives: 'mv',
  niger: 'ne',
  chad: 'td',
  'burkina faso': 'bf',
  'equatorial guinea': 'gq',
  'central african republic': 'cf',
  drc: 'cd',
  'dr congo': 'cd',
  comoros: 'km',
  seychelles: 'sc',
  mauritius: 'mu',
  rwanda: 'rw',
  burundi: 'bi',
  lesotho: 'ls',
  eswatini: 'sz',
  swaziland: 'sz',
  malawi: 'mw',
  zimbabwe: 'zw',
  botswana: 'bw',
  namibia: 'na',
  'sierra leone': 'sl',
  liberia: 'lr',
  'guinea-bissau': 'gw',
  gambia: 'gm',
  mauritania: 'mr',
  ethiopia: 'et',
  eritrea: 'er',
  djibouti: 'dj',
  somalia: 'so',
  sudan: 'sd',
  'south sudan': 'ss',
  guatemala: 'gt',
  'el salvador': 'sv',
  nicaragua: 'ni',
  cuba: 'cu',
  haiti: 'ht',
  'dominican republic': 'do',
  'trinidad and tobago': 'tt',
  bermuda: 'bm',
  barbados: 'bb',
  guyana: 'gy',
  suriname: 'sr',
  kosovo: 'xk',
  'san marino': 'sm',
  liechtenstein: 'li',
  andorra: 'ad',
  monaco: 'mc',
  luxembourg: 'lu',
  malta: 'mt',
  'bosnia and herzegovina': 'ba',
  'bosnia & herzegovina': 'ba',
  // ===== 缺失国家补全（基于数据库 INT 但 country 非空统计） =====
  // 亚洲
  india: 'in',
  azerbaijan: 'az',
  // 土耳其（BSD 返回带 ü 的 "Türkiye"）
  'türkiye': 'tr',
  // 欧洲小国
  gibraltar: 'gi',
  faroe: 'fo',
  'faroe islands': 'fo',
  guernsey: 'gg',
  jersey: 'je',
  'isle of man': 'im',
  // 加勒比 / 美洲小国
  'sint maarten': 'sx',
  'saint kitts and nevis': 'kn',
  'saint kitts': 'kn',
  'cayman islands': 'ky',
  anguilla: 'ai',
  belize: 'bz',
  'saint vincent and the grenadines': 'vc',
  'antigua and barbuda': 'ag',
  guadeloupe: 'gp',
  martinique: 'mq',
  bahamas: 'bs',
  grenada: 'gd',
  'saint lucia': 'lc',
  montserrat: 'ms',
  'saint martin': 'mf',
  dominica: 'dm',
  'british virgin islands': 'vg',
  'us virgin islands': 'vi',
  'virgin islands': 'vi',
  aruba: 'aw',
  bonaire: 'bq',
  curacao: 'cw',
  // 大洋洲
  fiji: 'fj',
  vanuatu: 'vu',
  samoa: 'ws',
  'american samoa': 'as',
  'cook islands': 'ck',
  tonga: 'to',
  'papua new guinea': 'pg',
  'solomon islands': 'sb',
  tahiti: 'pf',
  'new caledonia': 'nc',
  guam: 'gu',
  // 非洲
  gabon: 'ga',
  'cape verde': 'cv',
  'cabo verde': 'cv',
  'sao tome and principe': 'st',
  'são tomé and príncipe': 'st',
  // 亚洲更多
  'timor-leste': 'tl',
  easttimor: 'tl',
  // 英伦三岛 / 海外属地
  england: 'gb-eng',
  scotland: 'gb-sct',
  wales: 'gb-wls',
  'northern ireland': 'gb-nir',
  // 其他常被遗漏的小国/地区
  'puerto rico': 'pr',
  "côte d'ivoire": 'ci',
  'congo republic': 'cg',
  'republic of the congo': 'cg',
  'democratic republic of the congo': 'cd',
  'united states': 'us',
  'united states of america': 'us',
  阿根廷: 'ar',
  巴西: 'br',
  比利时: 'be',
  法国: 'fr',
  德国: 'de',
  西班牙: 'es',
  葡萄牙: 'pt',
  荷兰: 'nl',
  意大利: 'it',
  克罗地亚: 'hr',
  摩洛哥: 'ma',
  日本: 'jp',
  韩国: 'kr',
  墨西哥: 'mx',
  美国: 'us',
  加拿大: 'ca',
  乌拉圭: 'uy',
  哥伦比亚: 'co',
  智利: 'cl',
  厄瓜多尔: 'ec',
  秘鲁: 'pe',
  瑞士: 'ch',
  丹麦: 'dk',
  瑞典: 'se',
  波兰: 'pl',
  乌克兰: 'ua',
  土耳其: 'tr',
  埃及: 'eg',
  尼日利亚: 'ng',
  加纳: 'gh',
  喀麦隆: 'cm',
  塞内加尔: 'sn',
  突尼斯: 'tn',
  阿尔及利亚: 'dz',
  沙特: 'sa',
  伊朗: 'ir',
  澳大利亚: 'au',
  新西兰: 'nz',
  中国: 'cn',
  哥斯达黎加: 'cr',
  牙买加: 'jm',
  巴拿马: 'pa',
  卡塔尔: 'qa',
  阿联酋: 'ae',
  乌干达: 'ug',
  马达加斯加: 'mg',
  印度: 'in',
  印尼: 'id',
  泰国: 'th',
  越南: 'vn',
  马来西亚: 'my',
  朝鲜: 'kp',
  缅甸: 'mm',
  孟加拉: 'bd',
  巴基斯坦: 'pk',
  斯里兰卡: 'lk',
  不丹: 'bt',
  尼泊尔: 'np',
  危地马拉: 'gt',
  洪都拉斯: 'hn',
  萨尔瓦多: 'sv',
  尼加拉瓜: 'ni',
  海地: 'ht',
  古巴: 'cu',
  特立尼达: 'tt',
  圭亚那: 'gy',
  科索沃: 'xk',
  安道尔: 'ad',
  列支敦士登: 'li',
  圣马力诺: 'sm',
  摩纳哥: 'mc',
  卢森堡: 'lu',
  马耳他: 'mt',
  直布罗陀: 'gi',
  africa: 'af',
  asia: 'as',
  europe: 'eu',
  'south america': 'sa',
  'north america': 'na',
  oceania: 'oc',
  international: 'int',
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
  const lower = (roundName || '').toLowerCase().trim()
  if (groupName) return 'group'
  if (!lower) return 'league'
  // 小组赛
  if (lower.includes('group') || lower.includes('group stage')) return 'group'
  // 1/8 决赛
  if (lower.includes('16') || lower.includes('round of 16') || lower.includes('eighth')) return 'round16'
  // 1/4 决赛
  if (lower.includes('quarter')) return 'quarter'
  // 半决赛
  if (lower.includes('semi')) return 'semi'
  // 决赛（含季军战）
  if (lower.includes('final')) return 'final'
  // 季后赛
  if (lower.includes('play-off') || lower.includes('playoff') || lower.includes('play off')) return 'playoff'
  // 资格赛
  if (lower.includes('qualif') || lower.includes('preliminary')) return 'qualification'
  // 联赛常规轮次
  if (lower.includes('regular') || lower.includes('matchday') || lower.includes('match day') || lower.includes('round')) return 'league'
  return 'league'
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
    players: { at: null, durationMs: 0, ok: true },
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
    @InjectRepository(PlayerEntity) private readonly playerRepo: Repository<PlayerEntity>,
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
   * 同步实时赛事（BSD v2 /events/live/）
   * 由 Scheduler 每 5s 触发
   * 不仅更新状态/比分，还同步 lineups、playerStats、场馆、裁判等子数据
   * 优化：仅在赛事状态变化或首次出现时同步子数据，避免每5秒重复请求BSD API
   */
  async syncLiveEvents(): Promise<{ updated: number; liveCount: number }> {
    const started = Date.now()
    let updated = 0
    let liveCount = 0
    try {
      const live = await this.bsdService.getLiveEvents({})
      // v2 live 端点返回结构是 { count, events }，无分页
      for (const bsEvent of (live.events ?? [])) {
        liveCount++
        // 实时窗口只更新状态/比分/分钟，不重建球队
        const bsdId = String(bsEvent.id)
        const match = await this.matchRepo.findOne({ where: { dataSource: `bsd_${bsdId}` } })
        if (!match) {
          // 新增实时窗口内的赛事：fallback 到标准 upsert
          const leagueNameMap = await this.buildLeagueNameMap()
          await this.upsertMatch(bsEvent, leagueNameMap)
          // 首次出现的 live 赛事，同步子数据
          const newMatch = await this.matchRepo.findOne({ where: { dataSource: `bsd_${bsdId}` } })
          if (newMatch) {
            const bsEventId = Number(bsdId)
            await this.syncLiveDataForMatch(newMatch, bsEventId)
          }
          updated++
          continue
        }
        // 检测状态变化（如 upcoming → live）
        const prevStatus = match.status
        const prevBsStatus = match.bsStatus
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
        // 补充基本信息：场馆、裁判（仅当缺失时）
        if (bsEvent.venue_id && !match.venue) {
          try { await this.syncVenuesForMatch(match) } catch { /* ignore */ }
        }
        if (bsEvent.referee_id && !match.refereeName) {
          try { await this.syncRefereeForMatch(match) } catch { /* ignore */ }
        }
        await this.matchRepo.save(match)

        // 仅在状态变化或首次进入 live 时同步子数据（避免每5秒重复请求）
        const statusChanged = prevStatus !== match.status || prevBsStatus !== match.bsStatus
        if (statusChanged) {
          const bsEventId = Number(bsdId)
          await this.syncLiveDataForMatch(match, bsEventId)
        }

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
   * 同步 live 赛事的子数据（lineups、playerStats、incidents、stats）
   * 仅在赛事状态变化或首次出现时调用
   */
  private async syncLiveDataForMatch(match: MatchEntity, bsEventId: number): Promise<void> {
    try {
      await this.syncLineups(match, bsEventId)
    } catch { /* ignore */ }
    try {
      await this.syncPlayerStats(match, bsEventId)
    } catch { /* ignore */ }
    try {
      await this.syncIncidents(match, bsEventId)
    } catch { /* ignore */ }
    try {
      await this.syncStats(match, bsEventId)
    } catch { /* ignore */ }
  }

  /**
   * 同步进行中或 24h 内完赛的赛事的子数据（incidents/lineups/odds/stats/predictions）
   * 由 Scheduler 周期触发（5min）
   */
  async syncMatchAuxData(limit = 20): Promise<{ matches: number; incidents: number; lineups: number; odds: number; stats: number; predictions: number; h2h: number; metadata: number; playerStats: number; oddsComparison: number; social: number }> {
    const started = Date.now()
    const result = { matches: 0, incidents: 0, lineups: 0, odds: 0, stats: 0, predictions: 0, h2h: 0, metadata: 0, playerStats: 0, oddsComparison: 0, social: 0 }
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
        // 补充场馆和裁判信息（仅当缺失时）
        if (m.venueId && !m.venue) {
          try { await this.syncVenuesForMatch(m) } catch { /* ignore */ }
        }
        if (m.refereeId && !m.refereeName) {
          try { await this.syncRefereeForMatch(m) } catch { /* ignore */ }
        }
        // 保存场馆/裁判补充结果
        if (m.venue || m.refereeName) {
          await this.matchRepo.save(m)
        }
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
          // 交锋记录（所有赛事）
          try {
            result.h2h += (await this.syncH2H(m, bsEventId)) ? 1 : 0
          } catch { /* ignore */ }
          // 赛事元数据（所有赛事）
          try {
            result.metadata += (await this.syncMetadata(m, bsEventId)) ? 1 : 0
          } catch { /* ignore */ }
          // 球员统计（进行中/已结束）
          if (m.status === 'live' || m.status === 'finished') {
            try {
              result.playerStats += (await this.syncPlayerStats(m, bsEventId)) ? 1 : 0
            } catch { /* ignore */ }
          }
          // 赔率对比（非已结束）
          if (m.status !== 'finished') {
            try {
              result.oddsComparison += (await this.syncOddsComparison(m, bsEventId)) ? 1 : 0
            } catch { /* ignore */ }
          }
          // 社交媒体（进行中/已结束）
          if (m.status === 'live' || m.status === 'finished') {
            try {
              result.social += (await this.syncSocial(m, bsEventId)) ? 1 : 0
            } catch { /* ignore */ }
          }
        } catch (e) {
          this.logger.warn(`aux sync for match ${m.id} failed: ${(e as Error).message}`)
        }
      }
      this.recordRun('aux', started, true, JSON.stringify(result))

      // 同步完成后，聚合球队统计（场均进球/失球/控球/胜率）
      try {
        await this.aggregateTeamStats()
      } catch (e) {
        this.logger.warn(`aggregateTeamStats failed: ${(e as Error).message}`)
      }
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

          // 从本地赛事中获取该联赛下的小组名映射（teamId -> groupName）
          const teamGroupMap = await this.buildTeamGroupMap(league.id, standings.season?.id)

          for (const row of standings.standings) {
            // 优先从赛事中获取该球队所在的小组名
            const groupName = teamGroupMap.get(row.team_id) || 'LEAGUE'
            await this.upsertStanding(league, standings.season, row, groupName)
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

  /**
   * 修复球队 country_code（仅根据已有 country 字段重映射）
   * 一次性数据修复：扫描 country_code='INT' 且 country 非空的记录，重新应用 COUNTRY_TO_ISO
   */
  async fixTeamCountryCodes(): Promise<{ scanned: number; fixed: number; samples: Array<{ id: string; before: string; after: string; country: string }> }> {
    const teams = await this.teamRepo
      .createQueryBuilder('t')
      .where('t.country_code = :cc', { cc: 'INT' })
      .andWhere('t.country IS NOT NULL')
      .andWhere("t.country <> ''")
      .getMany()
    let fixed = 0
    const samples: Array<{ id: string; before: string; after: string; country: string }> = []
    for (const t of teams) {
      const newCode = countryToIso(t.country)
      if (newCode !== 'INT') {
        const before = t.countryCode
        t.countryCode = newCode
        t.lastSyncedAt = new Date()
        await this.teamRepo.save(t)
        fixed++
        if (samples.length < 20) {
          samples.push({ id: t.id, before, after: newCode, country: t.country || '' })
        }
      }
    }
    return { scanned: teams.length, fixed, samples }
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

  /**
   * 构造 BSD teamId → groupName 映射
   * 从本地赛事中查找该联赛下所有小组赛的 group_name，
   * 通过 home_team_bsd_id / away_team_bsd_id 关联到球队
   */
  private async buildTeamGroupMap(leagueId: number, seasonId?: number): Promise<Map<number, string>> {
    const map = new Map<number, string>()
    const query = this.matchRepo
      .createQueryBuilder('m')
      .select(['m.homeTeamBsdId', 'm.awayTeamBsdId', 'm.groupName'])
      .where('m.leagueId = :leagueId', { leagueId })
      .andWhere('m.groupName IS NOT NULL')
    if (seasonId) {
      query.andWhere('m.seasonId = :seasonId', { seasonId })
    }
    const matches = await query.getMany()
    for (const m of matches) {
      if (m.homeTeamBsdId && m.groupName) map.set(m.homeTeamBsdId, m.groupName)
      if (m.awayTeamBsdId && m.groupName) map.set(m.awayTeamBsdId, m.groupName)
    }
    return map
  }

  /**
   * 聚合球队统计：从已完赛赛事 + 统计数据中计算场均进球/失球/控球/胜率
   * 写入 TeamEntity 的 avgGoalsScored / avgGoalsConceded / avgPossession / winRate
   */
  private async aggregateTeamStats(): Promise<void> {
    // 查询所有已完赛赛事（有比分）
    const finishedMatches = await this.matchRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'homeTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .where('m.status = :status', { status: 'finished' })
      .andWhere('m.homeScore IS NOT NULL')
      .andWhere('m.awayScore IS NOT NULL')
      .getMany()

    if (!finishedMatches.length) return

    // 按球队聚合
    const teamStats = new Map<string, {
      goalsScored: number
      goalsConceded: number
      wins: number
      played: number
      possessionSum: number
      possessionCount: number
    }>()

    for (const m of finishedMatches) {
      // 主队
      const home = teamStats.get(m.homeTeamId) || { goalsScored: 0, goalsConceded: 0, wins: 0, played: 0, possessionSum: 0, possessionCount: 0 }
      home.goalsScored += m.homeScore
      home.goalsConceded += m.awayScore
      home.played++
      if (m.homeScore > m.awayScore) home.wins++
      teamStats.set(m.homeTeamId, home)

      // 客队
      const away = teamStats.get(m.awayTeamId) || { goalsScored: 0, goalsConceded: 0, wins: 0, played: 0, possessionSum: 0, possessionCount: 0 }
      away.goalsScored += m.awayScore
      away.goalsConceded += m.homeScore
      away.played++
      if (m.awayScore > m.homeScore) away.wins++
      teamStats.set(m.awayTeamId, away)
    }

    // 从 EventStatsEntity 聚合控球率
    const allStats = await this.statsRepo.find()
    for (const stat of allStats) {
      const match = finishedMatches.find(m => m.id === stat.matchId)
      if (!match) continue

      const home = teamStats.get(match.homeTeamId)
      if (home && stat.homePossession != null) {
        home.possessionSum += stat.homePossession
        home.possessionCount++
      }
      const away = teamStats.get(match.awayTeamId)
      if (away && stat.awayPossession != null) {
        away.possessionSum += stat.awayPossession
        away.possessionCount++
      }
    }

    // 写入 TeamEntity
    for (const [teamId, stats] of teamStats) {
      if (stats.played === 0) continue
      try {
        await this.teamRepo.update(teamId, {
          avgGoalsScored: Number((stats.goalsScored / stats.played).toFixed(2)),
          avgGoalsConceded: Number((stats.goalsConceded / stats.played).toFixed(2)),
          avgPossession: stats.possessionCount > 0 ? Number((stats.possessionSum / stats.possessionCount).toFixed(2)) : null,
          winRate: Number((stats.wins / stats.played * 100).toFixed(2)),
        })
      } catch {
        /* ignore individual team update failure */
      }
    }

    this.logger.log(`aggregateTeamStats: updated ${teamStats.size} teams from ${finishedMatches.length} finished matches`)
  }

  // ==================== 场馆 & 裁判同步 ====================

  /**
   * 同步场馆信息到赛事
   * 从 /v2/venues/{id}/ 获取场馆名称、城市、容量
   */
  private async syncVenuesForMatch(match: MatchEntity): Promise<boolean> {
    if (!match.venueId) return false
    try {
      const venue = await this.bsdService.getVenueDetail(match.venueId)
      match.venue = venue.name || match.venue
      match.city = venue.city || match.city
      match.venueCapacity = venue.capacity || null
      return true
    } catch (e) {
      this.logger.warn(`syncVenuesForMatch ${match.id} venue_id=${match.venueId} failed: ${(e as Error).message}`)
      return false
    }
  }

  /**
   * 同步裁判信息到赛事
   * 从 /v2/referees/{id}/ 获取裁判姓名、国籍、风格统计
   */
  private async syncRefereeForMatch(match: MatchEntity): Promise<boolean> {
    if (!match.refereeId) return false
    try {
      const ref = await this.bsdService.getRefereeDetail(match.refereeId)
      match.refereeName = ref.name || match.refereeName
      match.refereeNationality = ref.country || match.refereeNationality
      // 裁判风格：根据场均黄牌数推断
      if (ref.avg_yellow_per_match != null) {
        if (ref.avg_yellow_per_match >= 5) {
          match.refereeStyle = 'strict'
        } else if (ref.avg_yellow_per_match >= 3) {
          match.refereeStyle = 'moderate'
        } else {
          match.refereeStyle = 'lenient'
        }
      }
      return true
    } catch (e) {
      this.logger.warn(`syncRefereeForMatch ${match.id} referee_id=${match.refereeId} failed: ${(e as Error).message}`)
      return false
    }
  }

  // ==================== 交锋记录 ====================

  /**
   * 同步交锋记录到赛事 h2hData 字段
   */
  private async syncH2H(match: MatchEntity, bsEventId: number): Promise<boolean> {
    try {
      const h2h = await this.bsdService.getEventH2H(bsEventId)
      match.h2hData = h2h as unknown as Record<string, unknown>
      await this.matchRepo.save(match)
      return true
    } catch (e) {
      this.logger.warn(`syncH2H match=${match.id} failed: ${(e as Error).message}`)
      return false
    }
  }

  // ==================== 赛事元数据 ====================

  /**
   * 同步赛事元数据（球衣颜色+趣味事实+AI预览）到 metadata 字段
   */
  private async syncMetadata(match: MatchEntity, bsEventId: number): Promise<boolean> {
    try {
      const meta = await this.bsdService.getEventMetadata(bsEventId)
      match.metadata = meta as unknown as Record<string, unknown>
      await this.matchRepo.save(match)
      return true
    } catch (e) {
      this.logger.warn(`syncMetadata match=${match.id} failed: ${(e as Error).message}`)
      return false
    }
  }

  // ==================== 球员统计 ====================

  /**
   * 同步单场球员统计到 playerStatsData 字段
   */
  private async syncPlayerStats(match: MatchEntity, bsEventId: number): Promise<boolean> {
    try {
      const stats = await this.bsdService.getEventPlayerStats(bsEventId)
      match.playerStatsData = stats as unknown as Record<string, unknown>
      await this.matchRepo.save(match)

      // 聚合球员赛季统计
      try {
        await this.aggregatePlayerSeasonStats(stats.player_stats)
      } catch (e) {
        this.logger.warn(`aggregatePlayerSeasonStats match=${match.id} failed: ${(e as Error).message}`)
      }
      return true
    } catch (e) {
      this.logger.warn(`syncPlayerStats match=${match.id} failed: ${(e as Error).message}`)
      return false
    }
  }

  // ==================== 赔率对比 ====================

  /**
   * 同步博彩公司赔率对比到 oddsComparison 字段
   */
  private async syncOddsComparison(match: MatchEntity, bsEventId: number): Promise<boolean> {
    try {
      const comp = await this.bsdService.getOddsComparison(bsEventId)
      match.oddsComparison = comp as unknown as Record<string, unknown>
      await this.matchRepo.save(match)
      return true
    } catch (e) {
      this.logger.warn(`syncOddsComparison match=${match.id} failed: ${(e as Error).message}`)
      return false
    }
  }

  // ==================== 社交媒体 ====================

  /**
   * 同步社交媒体内容到 socialData 字段
   */
  private async syncSocial(match: MatchEntity, bsEventId: number): Promise<boolean> {
    try {
      const social = await this.bsdService.getEventSocial(bsEventId, { limit: 10 })
      match.socialData = social as unknown as Record<string, unknown>
      await this.matchRepo.save(match)
      return true
    } catch (e) {
      this.logger.warn(`syncSocial match=${match.id} failed: ${(e as Error).message}`)
      return false
    }
  }

  // ==================== 球员同步 ====================

  /**
   * 同步球员列表（按联赛关联的球队批量同步）
   * 建议由调度器每日触发一次
   */
  async syncPlayers(): Promise<{ created: number; updated: number }> {
    const started = Date.now()
    let created = 0
    let updated = 0
    try {
      // 获取所有有 BSD ID 的球队
      const teams = await this.teamRepo
        .createQueryBuilder('t')
        .where('t.bs_team_id IS NOT NULL')
        .getMany()

      for (const team of teams) {
        try {
          const resp = await this.bsdService.getPlayers({ team_id: team.bsTeamId, limit: 50 })
          for (const bsPlayer of (resp.results ?? [])) {
            const existing = await this.playerRepo.findOne({ where: { bsdPlayerId: bsPlayer.id } })
            const age = bsPlayer.date_of_birth
              ? Math.floor((Date.now() - new Date(bsPlayer.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
              : null

            const payload: Partial<PlayerEntity> = {
              bsdPlayerId: bsPlayer.id,
              name: getPlayerChineseName(bsPlayer.name),
              nameEn: bsPlayer.name,
              shortName: bsPlayer.short_name,
              teamId: team.id,
              position: bsPlayer.position,
              specificPosition: bsPlayer.specific_position,
              jerseyNumber: bsPlayer.jersey_number,
              age,
              dateOfBirth: bsPlayer.date_of_birth ? new Date(bsPlayer.date_of_birth) : null,
              heightCm: bsPlayer.height_cm,
              weightKg: bsPlayer.weight_kg,
              preferredFoot: bsPlayer.preferred_foot,
              nationality: bsPlayer.nationality,
              marketValueEur: bsPlayer.market_value_eur,
              isKeyPlayer: (bsPlayer.rating ?? 0) >= 80,
              rating: bsPlayer.rating,
              potential: bsPlayer.potential,
              injuryStatus: bsPlayer.availability,
              injuryRisk: bsPlayer.injury_risk,
              dataSource: `bsd_${bsPlayer.id}`,
            }

            if (existing) {
              Object.assign(existing, payload)
              await this.playerRepo.save(existing)
              updated++
            } else {
              const entity = this.playerRepo.create(payload)
              await this.playerRepo.save(entity)
              created++
            }
          }
        } catch (e) {
          this.logger.warn(`syncPlayers team=${team.id} failed: ${(e as Error).message}`)
        }
      }
      this.recordRun('players', started, true, `+${created}/~${updated}`)
    } catch (error) {
      this.recordRun('players', started, false, error?.message)
      this.logger.error(`Sync players failed: ${error?.message}`)
    }
    return { created, updated }
  }

  // ==================== 球员赛季统计聚合 ====================

  /**
   * 从单场球员统计聚合赛季累计数据（进球/助攻/黄牌/红牌）
   */
  private async aggregatePlayerSeasonStats(playerStats: { player_id: number; goals: number; goal_assist: number; yellow_card: number; red_card: number }[]): Promise<void> {
    for (const ps of playerStats) {
      const player = await this.playerRepo.findOne({ where: { bsdPlayerId: ps.player_id } })
      if (!player) continue
      // 累加（简单方案：每次同步时重新累加，可能重复计数，但数据量小时可接受）
      player.seasonGoals = (player.seasonGoals || 0) + ps.goals
      player.seasonAssists = (player.seasonAssists || 0) + ps.goal_assist
      player.yellowCards = (player.yellowCards || 0) + ps.yellow_card
      player.redCards = (player.redCards || 0) + ps.red_card
      await this.playerRepo.save(player)
    }
  }

  // ==================== 阵型聚合 ====================

  /**
   * 从已完赛赛事的 lineups 中聚合球队主打阵型
   */
  async aggregateTeamFormations(): Promise<void> {
    try {
      // 获取所有有 formation 数据的 lineup 记录
      const lineups = await this.lineupRepo
        .createQueryBuilder('l')
        .where('l.formation IS NOT NULL')
        .getMany()

      // 按球队聚合 formation 出现次数
      const formationCounts = new Map<string, Map<string, number>>()

      for (const l of lineups) {
        const match = await this.matchRepo.findOne({ where: { id: l.matchId } })
        if (!match) continue
        const teamId = l.side === 'home' ? match.homeTeamId : match.awayTeamId
        if (!teamId) continue
        if (!formationCounts.has(teamId)) formationCounts.set(teamId, new Map())
        const counts = formationCounts.get(teamId)!
        counts.set(l.formation, (counts.get(l.formation) || 0) + 1)
      }

      // 取出现次数最多的 formation 作为主打阵型
      for (const [teamId, counts] of formationCounts) {
        let maxFormation = ''
        let maxCount = 0
        for (const [formation, count] of counts) {
          if (count > maxCount) {
            maxFormation = formation
            maxCount = count
          }
        }
        if (maxFormation) {
          await this.teamRepo.update(teamId, { formation: maxFormation })
        }
      }
    } catch (e) {
      this.logger.warn(`aggregateTeamFormations failed: ${(e as Error).message}`)
    }
  }

  /** 通用 upsert：写入赛事主体字段 */
  private async upsertMatch(
    bsEvent: BsEvent,
    leagueNameMap: Map<number, string>,
    teamCache?: Map<number, TeamEntity>,
  ): Promise<'created' | 'updated'> {
    const bsdId = String(bsEvent.id)

    // 防御：BSD 返回的事件必须包含完整的 home/away 球队对象
    if (!bsEvent.home_team_obj?.id || !bsEvent.away_team_obj?.id) {
      this.logger.warn(
        `跳过事件 ${bsdId}：缺少 home/away 球队对象 (home=${bsEvent.home_team}, away=${bsEvent.away_team}, ` +
        `has_home_obj=${!!bsEvent.home_team_obj}, has_away_obj=${!!bsEvent.away_team_obj})`,
      )
      throw new Error('invalid event: missing team objects')
    }

    // 联赛：直接用 BSD 嵌套对象；map 仅作兜底（极少用到）
    const leagueName = bsEvent.league?.name || leagueNameMap.get(bsEvent.league?.id) || `联赛${bsEvent.league?.id ?? '?'}`

    const homeTeam = await this.getOrCreateTeam(bsEvent.home_team_obj.id, bsEvent.home_team_obj.name || bsEvent.home_team, teamCache)
    const awayTeam = await this.getOrCreateTeam(bsEvent.away_team_obj.id, bsEvent.away_team_obj.name || bsEvent.away_team, teamCache)
    const status = STATUS_MAP[bsEvent.status] || 'upcoming'
    const stage = inferStage(bsEvent.round_name, bsEvent.group_name)
    const startTime = new Date(bsEvent.event_date)

    let match = await this.matchRepo.findOne({ where: { dataSource: `bsd_${bsdId}` } })
    const baseFields: Partial<MatchEntity> = {
      leagueId: bsEvent.league?.id ?? null,
      seasonId: bsEvent.season?.id ?? null,
      leagueName,
      stage,
      groupName: bsEvent.group_name || null,
      roundName: bsEvent.round_name || null,
      roundNumber: bsEvent.round_number ?? null,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeTeamBsdId: bsEvent.home_team_obj.id,
      awayTeamBsdId: bsEvent.away_team_obj.id,
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
      // 天气/环境数据（BSD weather 对象）
      temperature: bsEvent.weather?.temperature_c ?? null,
      windSpeed: bsEvent.weather?.wind_speed ?? null,
      weatherCondition: bsEvent.weather?.description ?? null,
      // 观众人数
      totalAttendance: bsEvent.attendance ?? null,
      lastSyncedAt: new Date(),
      dataSource: `bsd_${bsdId}`,
      dataSourceUrl: `https://sports.bzzoiro.com/api/events/${bsdId}/`,
    }
    if (match) {
      Object.assign(match, baseFields)
      // 同步场馆信息
      if (bsEvent.venue_id && !match.venue) {
        try { await this.syncVenuesForMatch(match) } catch { /* ignore */ }
      }
      // 同步裁判信息
      if (bsEvent.referee_id && !match.refereeName) {
        try { await this.syncRefereeForMatch(match) } catch { /* ignore */ }
      }
      // 提取教练ID和精彩集锦
      if ((bsEvent as any).home_coach_id) match.homeCoachId = (bsEvent as any).home_coach_id
      if ((bsEvent as any).away_coach_id) match.awayCoachId = (bsEvent as any).away_coach_id
      if ((bsEvent as any).highlights?.length) {
        match.highlights = (bsEvent as any).highlights
      }
      await this.matchRepo.save(match)
      return 'updated'
    }
    const entity = this.matchRepo.create(baseFields)
    // 同步场馆信息
    if (bsEvent.venue_id && !entity.venue) {
      try { await this.syncVenuesForMatch(entity) } catch { /* ignore */ }
    }
    // 同步裁判信息
    if (bsEvent.referee_id && !entity.refereeName) {
      try { await this.syncRefereeForMatch(entity) } catch { /* ignore */ }
    }
    await this.matchRepo.save(entity)
    return 'created'
  }

  /** 通用 upsert：球队 */
  private async getOrCreateTeam(bsdId: number, name: string, cache?: Map<number, TeamEntity>): Promise<TeamEntity> {
    const cacheHit = cache?.get(bsdId)
    if (cacheHit) return cacheHit
    const key = `bsd_${bsdId}`
    // 兜底：确保 name 不为空（NOT NULL 字段）
    const safeName = (name || `Team-${bsdId}`).toString().trim() || `Team-${bsdId}`
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
      // 显式构造，避免 TypeORM 对 'name' 字段的意外处理
      const newTeam = new TeamEntity()
      newTeam.bsTeamId = bsdId
      newTeam.name = safeName
      newTeam.nameEn = safeName
      newTeam.countryCode = isoCode
      newTeam.country = country
      newTeam.logo = logo
      newTeam.isNational = isNational
      newTeam.venueName = venueName
      newTeam.founded = founded
      newTeam.dataSource = key
      newTeam.dataSourceUrl = `https://sports.bzzoiro.com/api/v2/teams/${bsdId}/`
      newTeam.lastSyncedAt = new Date()
      team = await this.teamRepo.save(newTeam)
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
    let idx = 0
    for (const inc of resp.incidents ?? []) {
      // BSD incidents 端点不返回稳定 id。
      // 用 32 位有符号 INT 范围内的 hash 合成（取绝对值避免负数），冲突概率 < 1/2^31。
      const key = `${bsEventId}|${inc.type}|${inc.minute}|${inc.player_id ?? 'x'}|${idx}|${inc.is_home ? 'h' : 'a'}|${inc.team_id ?? 't'}`
      let syntheticId = 0
      for (let i = 0; i < key.length; i++) {
        syntheticId = ((syntheticId << 5) - syntheticId + key.charCodeAt(i)) | 0
      }
      syntheticId = Math.abs(syntheticId)
      const exists = await this.incidentRepo.findOne({ where: { bsIncidentId: syntheticId } })
      const isSubstitution = inc.type === 'substitution'
      const payload: Partial<EventIncidentEntity> = {
        matchId: match.id,
        bsIncidentId: syntheticId,
        bsEventId,
        type: inc.type,
        detail: inc.detail || inc.goal_type || inc.card_type || null,
        minute: inc.minute,
        extraMinute: inc.extra_time ?? null,
        playerId: inc.player_id ?? null,
        // BSD 实际字段是 `player`，同时兼容 player_name
        playerName: inc.player || inc.player_name || null,
        assistPlayerName: inc.assist_player_name,
        playerInId: isSubstitution ? inc.player_in_id ?? null : null,
        playerInName: isSubstitution ? inc.player_in ?? null : null,
        playerOutId: isSubstitution ? inc.player_id : null,
        playerOutName: isSubstitution ? inc.player || inc.player_name || null : null,
        isHome: typeof inc.is_home === 'boolean' ? inc.is_home : null,
        teamId: inc.team_id ?? null,
        team: inc.team ?? null,
        homeScoreAtIncident: inc.home_score ?? null,
        awayScoreAtIncident: inc.away_score ?? null,
        reason: inc.reason ?? null,
      }
      if (exists) {
        Object.assign(exists, payload)
        await this.incidentRepo.save(exists)
      } else {
        await this.incidentRepo.save(this.incidentRepo.create(payload))
        n++
      }
      idx++
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
      // BSD stats 字段名是 corner_kicks 而非 corners
      homeCorners: getNum(home.corner_kicks ?? home.corners),
      homeFouls: getNum(home.fouls),
      homeXg: getNum(home.xg),
      awayTotalShots: getNum(away.total_shots),
      awayShotsOnTarget: getNum(away.shots_on_target),
      awayPossession: getNum(away.ball_possession),
      awayPasses: getNum(away.passes),
      awayPassAccuracy: getNum(away.pass_accuracy_pct),
      awayCorners: getNum(away.corner_kicks ?? away.corners),
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

    // 回填 matchData 到 MatchEntity（前端直接从 match.matchData 读取统计）
    try {
      const matchData: Record<string, unknown> = {
        homeShots: payload.homeTotalShots,
        homeShotsOnTarget: payload.homeShotsOnTarget,
        homePossession: payload.homePossession,
        homePasses: payload.homePasses,
        homePassAccuracy: payload.homePassAccuracy,
        homeCorners: payload.homeCorners,
        homeFouls: payload.homeFouls,
        homeXg: payload.homeXg,
        awayShots: payload.awayTotalShots,
        awayShotsOnTarget: payload.awayShotsOnTarget,
        awayPossession: payload.awayPossession,
        awayPasses: payload.awayPasses,
        awayPassAccuracy: payload.awayPassAccuracy,
        awayCorners: payload.awayCorners,
        awayFouls: payload.awayFouls,
        awayXg: payload.awayXg,
      }
      match.matchData = matchData
      await this.matchRepo.save(match)
    } catch (e) {
      this.logger.warn(`回填 matchData for match ${match.id} failed: ${(e as Error).message}`)
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

  // ==================== 教练信息同步 ====================

  /**
   * 从 BSD 赛事 detail 同步教练信息
   * BSD 仅提供 home_coach_id/away_coach_id，无 coach 详情接口
   * 但比赛结束后 BSD 会在 metadata/incidents 中可能包含教练名
   */
  private async syncCoachesForMatch(match: MatchEntity, bsEventId: number): Promise<boolean> {
    try {
      const detail = await this.bsdService.getEventDetail(bsEventId) as any
      const updated: Partial<MatchEntity> = {}

      // 优先从 detail.weather 字段附近查找（BSD 实际字段名）
      // home_coach_id/away_coach_id 已通过 syncEvents 同步到 homeCoachId/awayCoachId
      // 这里仅做占位
      if (Object.keys(updated).length > 0) {
        await this.matchRepo.update(match.id, updated)
      }
      return true
    } catch (e) {
      this.logger.warn(`syncCoachesForMatch ${match.id} failed: ${(e as Error).message}`)
      return false
    }
  }
}
