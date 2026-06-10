import { Injectable, Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { BsdcBusinessService } from './bsd.business.service'
import { getPlayerChineseName } from '../../utils/player-translate'
import { translateTeamName, translateTeamNameTo } from './team-translate'
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
import { MatchGateway } from '../match/match.gateway'
import {
  BsEvent,
  BsLineupSide,
  BsLineups,
  BsOdds,
  BsPrediction,
  BsStandingRow,
  BsStats,
  BsTeam,
} from './bsd.interfaces'

/** 2026 世界杯联赛 ID（BSD 固定值） */
const WORLD_CUP_LEAGUE_ID = 27

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
  postponed: 'postponed',
  cancelled: 'finished',
  abandoned: 'finished',
  interrupted: 'live',
  delayed: 'upcoming',
  walkover: 'finished',
  awaiting: 'upcoming',
}

/**
 * 从 extra_time_score 字符串解析点球大战比分
 * BSD API 的 extra_time_score 格式通常为 "3-2"（主-客）
 * 当 penalty_shootout 有值但 extra_time_score 无法解析时返回 null
 */
function parsePenaltyScore(extraTimeScore: string | null): { home: number; away: number } | null {
  if (!extraTimeScore) return null
  // 尝试匹配 "数字-数字" 格式（如 "3-2"、"5-4"）
  const match = extraTimeScore.match(/^(\d+)\s*[-:]\s*(\d+)$/)
  if (match) {
    return { home: parseInt(match[1], 10), away: parseInt(match[2], 10) }
  }
  return null
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
    private readonly moduleRef: ModuleRef,
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

  /**
   * 获取 MatchGateway 实例（延迟获取，避免循环依赖）
   * 使用 ModuleRef 动态解析，因为 BsdcModule 是 @Global() 而 MatchGateway 在 MatchModule 中
   */
  private getMatchGateway(): MatchGateway | null {
    try {
      return this.moduleRef.get(MatchGateway, { strict: false })
    } catch {
      // MatchGateway 可能尚未初始化（极少见），静默处理
      return null
    }
  }

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
      // 分页循环拉取所有球队（BSD API 每页固定返回 50 条，忽略 limit 参数）
      const allTeams: BsTeam[] = []
      let page = 1
      while (true) {
        const resp = await this.bsdService.getTeams({ limit: 200, page })
        const batch = resp.results ?? []
        allTeams.push(...batch)
        this.logger.log(`syncTeams: fetched page ${page}, batch=${batch.length}, total_fetched=${allTeams.length}`)
        // BSD API 可能忽略 limit 参数，每页固定 50 条，需根据 next 判断是否继续
        if (!resp.next) break
        page++
      }
      this.logger.log(`syncTeams: total teams fetched=${allTeams.length}`)

      for (const bsTeam of allTeams) {
        const bsdId = String(bsTeam.id)
        const isoCode = countryToIso(bsTeam.country)
        // 多语言队名翻译
        const nameJa = translateTeamNameTo(bsTeam.name, 'ja')
        const nameKo = translateTeamNameTo(bsTeam.name, 'ko')
        const nameEs = translateTeamNameTo(bsTeam.name, 'es')
        const nameFr = translateTeamNameTo(bsTeam.name, 'fr')
        const namePt = translateTeamNameTo(bsTeam.name, 'pt')
        const nameAr = translateTeamNameTo(bsTeam.name, 'ar')

        const existing = await this.teamRepo.findOne({ where: { dataSource: `bsd_${bsdId}` } })
        if (existing) {
          existing.name = translateTeamName(bsTeam.name) || bsTeam.name
          existing.nameEn = bsTeam.name
          existing.nameJa = nameJa
          existing.nameKo = nameKo
          existing.nameEs = nameEs
          existing.nameFr = nameFr
          existing.namePt = namePt
          existing.nameAr = nameAr
          existing.shortName = (bsTeam as any).short_name || null
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
            name: translateTeamName(bsTeam.name) || bsTeam.name,
            nameEn: bsTeam.name,
            nameJa,
            nameKo,
            nameEs,
            nameFr,
            namePt,
            nameAr,
            shortName: (bsTeam as any).short_name || null,
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

      // BSD /api/events/ 不支持 league_id 过滤，需要分页获取所有赛事后在本地过滤
      // 世界杯 48 队 6 组（新赛制 12 组），赛事约 100+ 场，需要分页拉取
      const allEvents: BsEvent[] = []
      let offset = 0
      const pageSize = 200
      while (true) {
        const events = await this.bsdService.getEvents({
          date_from: fromDate.toISOString().split('T')[0],
          date_to: toDate.toISOString().split('T')[0],
          limit: pageSize,
          offset,
        })
        const batch = events.results ?? []
        allEvents.push(...batch)
        this.logger.log(`syncEvents: fetched page ${offset/pageSize + 1}, batch=${batch.length}, total_fetched=${allEvents.length}`)
        if (batch.length < pageSize) break
        offset += pageSize
      }
      this.logger.log(`syncEvents: total events fetched=${allEvents.length}`)

      // 联赛 ID → 联赛名称
      const leagueNameMap = await this.buildLeagueNameMap()
      // 球队 ID → 实体
      const teamCache = new Map<number, TeamEntity>()

      for (const bsEvent of allEvents) {
        try {
          const result = await this.upsertMatch(bsEvent, leagueNameMap, teamCache)
          if (result === 'created') created++
          else updated++
        } catch (e) {
          this.logger.warn(`upsert event ${bsEvent.id} failed: ${(e as Error).message}`)
        }
      }
      // 清理非世界杯赛事（BSD API 返回了所有联赛，upsertMatch 已过滤非世界杯赛事，但数据库中的旧数据需要清理）
      const deletedCount = await this.matchRepo.delete({ leagueId: Not(WORLD_CUP_LEAGUE_ID) })
      if (deletedCount.affected > 0) {
        this.logger.log(`syncEvents: 清理 ${deletedCount.affected} 条非世界杯赛事`)
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
      const live = await this.bsdService.getLiveEvents({ league_id: 27 }) // 只同步 2026 世界杯
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
        // 已结束赛事不再更新（prevStatus 为 finished 时跳过，但首次变为 finished 的那次仍需执行）
        if (match.status === 'finished') {
          continue
        }
        // 检测状态变化（如 upcoming → live）
        const prevStatus = match.status
        const prevBsStatus = match.bsStatus
        // 保存更新前的比分，用于检测比分变化
        const prevHomeScore = match.homeScore
        const prevAwayScore = match.awayScore
        match.status = STATUS_MAP[bsEvent.status] || match.status
        match.bsStatus = bsEvent.status
        match.period = bsEvent.period || match.period
        match.currentMinute = bsEvent.current_minute ?? match.currentMinute
        match.homeScore = bsEvent.home_score ?? match.homeScore
        match.awayScore = bsEvent.away_score ?? match.awayScore
        match.halfTimeHome = bsEvent.home_score_ht ?? match.halfTimeHome
        match.halfTimeAway = bsEvent.away_score_ht ?? match.halfTimeAway
        // 点球大战比分：优先从 extra_time_score 解析主客队各自比分，
        // fallback 到 penalty_shootout（仅一个数字，无法区分主客队时设为 null）
        if (bsEvent.penalty_shootout != null) {
          const parsed = parsePenaltyScore(bsEvent.extra_time_score)
          match.penaltyShootout = parsed ?? match.penaltyShootout
        } else {
          match.penaltyShootout = null
        }
        match.liveWebsocket = !!bsEvent.live_websocket
        match.lastSyncedAt = new Date()
        // 补充基本信息：场馆、裁判（从嵌套对象直接提取，或通过 ID 查询详情 API）
        // 优先从 venue/referee 嵌套对象提取（live API 可能返回）
        if (bsEvent.venue && !match.venue) {
          match.venueId = bsEvent.venue.id ?? match.venueId
          match.venue = bsEvent.venue.name || match.venue
          match.city = bsEvent.venue.city || match.city
          match.venueCapacity = bsEvent.venue.capacity || match.venueCapacity
          match.venueLatitude = bsEvent.venue.latitude ?? match.venueLatitude
          match.venueLongitude = bsEvent.venue.longitude ?? match.venueLongitude
        } else if (!match.venue && match.venueId) {
          // fallback：通过 venue_id 查询场馆详情 API
          try { await this.syncVenuesForMatch(match) } catch { /* ignore */ }
        }
        if (bsEvent.referee && typeof bsEvent.referee === 'object' && !match.refereeName) {
          match.refereeId = bsEvent.referee.id ?? match.refereeId
          match.refereeName = typeof bsEvent.referee.name === 'string' ? bsEvent.referee.name : match.refereeName
          match.refereeNationality = typeof bsEvent.referee.country === 'string' ? bsEvent.referee.country : match.refereeNationality
          if (bsEvent.referee.career_yellow_cards != null && bsEvent.referee.career_games != null && bsEvent.referee.career_games > 0) {
            const avgYellow = bsEvent.referee.career_yellow_cards / bsEvent.referee.career_games
            match.refereeStyle = avgYellow >= 5 ? 'strict' : avgYellow >= 3 ? 'moderate' : 'lenient'
          }
        } else if (!match.refereeName && match.refereeId) {
          // fallback：通过 referee_id 查询裁判详情 API
          try { await this.syncRefereeForMatch(match) } catch { /* ignore */ }
        }
        await this.matchRepo.save(match)

        // 通过 WebSocket 推送实时更新给前端订阅者
        const gateway = this.getMatchGateway()
        if (gateway) {
          try {
            gateway.broadcastMatchUpdate(match.id, {
              status: match.status,
              period: match.period,
              currentMinute: match.currentMinute,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              halfTimeHome: match.halfTimeHome,
              halfTimeAway: match.halfTimeAway,
              penaltyShootout: match.penaltyShootout,
              bsStatus: match.bsStatus,
            })
            // 状态变化时额外推送状态变更事件
            if (prevStatus !== match.status) {
              gateway.broadcastMatchStatusChange(match.id, match.status)
            }
          } catch (e) {
            this.logger.warn(`WebSocket push for match ${match.id} failed: ${(e as Error).message}`)
          }
        }

        // 仅在状态变化或比分变化时同步子数据（避免每5秒重复请求）
        const statusChanged = prevStatus !== match.status || prevBsStatus !== match.bsStatus
        const scoreChanged = match.homeScore !== prevHomeScore || match.awayScore !== prevAwayScore
        if (statusChanged || scoreChanged) {
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
   * 优化：一次获取 event detail，传递给各子方法减少重复 API 调用
   */
  private async syncLiveDataForMatch(match: MatchEntity, bsEventId: number): Promise<void> {
    // 一次性获取 event detail，供多个子方法 fallback 使用
    let detail: any = null
    try { detail = await this.bsdService.getEventDetail(bsEventId) } catch { /* ignore */ }

    // 从 event detail 提取场馆/裁判信息（仅当缺失时补充）
    try {
      if (!match.venue && detail?.venue) {
        match.venueId = detail.venue.id ?? match.venueId
        match.venue = detail.venue.name || match.venue
        match.city = detail.venue.city || match.city
        match.venueCapacity = detail.venue.capacity || match.venueCapacity
        match.venueLatitude = detail.venue.latitude ?? match.venueLatitude
        match.venueLongitude = detail.venue.longitude ?? match.venueLongitude
      }
      if (!match.refereeName && detail?.referee && typeof detail.referee === 'object') {
        match.refereeId = detail.referee.id ?? match.refereeId
        match.refereeName = typeof detail.referee.name === 'string' ? detail.referee.name : match.refereeName
        match.refereeNationality = typeof detail.referee.country === 'string' ? detail.referee.country : match.refereeNationality
        if (detail.referee.career_yellow_cards != null && detail.referee.career_games != null && detail.referee.career_games > 0) {
          const avgYellow = detail.referee.career_yellow_cards / detail.referee.career_games
          match.refereeStyle = avgYellow >= 5 ? 'strict' : avgYellow >= 3 ? 'moderate' : 'lenient'
        }
      }
      if (match.venue || match.refereeName) {
        await this.matchRepo.save(match)
      }
    } catch { /* ignore */ }

    try {
      await this.syncLineups(match, bsEventId, detail)
    } catch { /* ignore */ }
    try {
      await this.syncPlayerStats(match, bsEventId, detail)
    } catch { /* ignore */ }
    try {
      await this.syncIncidents(match, bsEventId)
    } catch { /* ignore */ }
    try {
      await this.syncStats(match, bsEventId)
    } catch { /* ignore */ }
    try {
      await this.syncCoachesForMatch(match, bsEventId, detail)
    } catch { /* ignore */ }
    try {
      await this.syncMetadata(match, bsEventId, detail)
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
        // 已结束赛事跳过子数据同步（避免对已结束赛事重复请求 BSD API）
        if (m.status === 'finished') continue
        result.matches++
        // 一次性获取 event detail，供多个子方法 fallback 使用
        let detail: any = null
        try { detail = await this.bsdService.getEventDetail(bsEventId) } catch { /* ignore */ }
        // 补充场馆和裁判信息（优先从 event detail 的嵌套对象提取，fallback 到通过 ID 查详情 API）
        if (!m.venue) {
          // 优先从 event detail 的 venue 嵌套对象提取
          if (detail?.venue) {
            m.venueId = detail.venue.id ?? m.venueId
            m.venue = detail.venue.name || m.venue
            m.city = detail.venue.city || m.city
            m.venueCapacity = detail.venue.capacity || m.venueCapacity
            m.venueLatitude = detail.venue.latitude ?? m.venueLatitude
            m.venueLongitude = detail.venue.longitude ?? m.venueLongitude
          } else if (m.venueId) {
            // fallback：通过 venue_id 查询场馆详情 API
            try { await this.syncVenuesForMatch(m) } catch { /* ignore */ }
          }
        }
        if (!m.refereeName) {
          // 优先从 event detail 的 referee 嵌套对象提取
          if (detail?.referee && typeof detail.referee === 'object') {
            m.refereeId = detail.referee.id ?? m.refereeId
            m.refereeName = typeof detail.referee.name === 'string' ? detail.referee.name : m.refereeName
            m.refereeNationality = typeof detail.referee.country === 'string' ? detail.referee.country : m.refereeNationality
            if (detail.referee.career_yellow_cards != null && detail.referee.career_games != null && detail.referee.career_games > 0) {
              const avgYellow = detail.referee.career_yellow_cards / detail.referee.career_games
              m.refereeStyle = avgYellow >= 5 ? 'strict' : avgYellow >= 3 ? 'moderate' : 'lenient'
            }
          } else if (m.refereeId) {
            // fallback：通过 referee_id 查询裁判详情 API
            try { await this.syncRefereeForMatch(m) } catch { /* ignore */ }
          }
        }
        // 保存场馆/裁判补充结果
        if (m.venue || m.refereeName) {
          await this.matchRepo.save(m)
        }
        // 同步教练信息（仅当缺失时）
        if (!m.homeCoach || !m.awayCoach) {
          try { await this.syncCoachesForMatch(m, bsEventId, detail) } catch { /* ignore */ }
        }
        try {
          // 事件流（已结束 24h 内 / 进行中）
          if (m.status === 'live' || m.status === 'finished') {
            result.incidents += await this.syncIncidents(m, bsEventId)
            result.stats += (await this.syncStats(m, bsEventId)) ? 1 : 0
          }
          // 阵容（即将开始 6h 内 / 进行中 / 已结束 24h 内）
          if (m.startTime <= lookahead) {
            result.lineups += await this.syncLineups(m, bsEventId, detail)
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
            result.metadata += (await this.syncMetadata(m, bsEventId, detail)) ? 1 : 0
          } catch { /* ignore */ }
          // 球员统计（进行中/已结束）
          if (m.status === 'live' || m.status === 'finished') {
            try {
              result.playerStats += (await this.syncPlayerStats(m, bsEventId, detail)) ? 1 : 0
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
   * BSD standings API 返回 grouped 数据（groups 对象），优先使用
   */
  async syncStandings(): Promise<{ leagues: number; rows: number }> {
    const started = Date.now()
    let leagues = 0
    let rows = 0
    try {
      // 只同步 2026 世界杯联赛（league_id=27）
      const leaguesList = await this.bsdService.getLeagues({ limit: 200 })
      const targetLeague = leaguesList.results?.find((l) => l.id === WORLD_CUP_LEAGUE_ID)
      if (!targetLeague) {
        this.logger.warn(`syncStandings: 未找到世界杯联赛 (league_id=${WORLD_CUP_LEAGUE_ID})`)
      }
      const leaguesToSync = targetLeague ? [targetLeague] : []
      for (const league of leaguesToSync) {
        if (!league.is_active) continue
        try {
          const standings = await this.bsdService.getLeagueStandings(league.id)
          if (!standings?.groups) {
            this.logger.warn(`sync standings for league ${league.id} failed: no groups data`)
            continue
          }
          leagues++

          for (const [groupName, groupRows] of Object.entries(standings.groups)) {
            for (const row of groupRows) {
              await this.upsertStanding(league, standings.season, row, groupName)
              rows++
            }
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
   * 获取各表数据数量（供冷启动数据稳定检测使用）
   * @returns 各表记录数的键值对
   */
  async getDataCounts(): Promise<Record<string, number>> {
    const [matchCount, teamCount, leagueCount, standingCount, playerCount] =
      await Promise.all([
        this.matchRepo.count(),
        this.teamRepo.count(),
        this.leagueRepo.count(),
        this.standingRepo.count(),
        this.playerRepo.count(),
      ])
    return {
      match: matchCount,
      team: teamCount,
      league: leagueCount,
      standing: standingCount,
      player: playerCount,
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
      match.venueLatitude = venue.latitude ?? null
      match.venueLongitude = venue.longitude ?? null
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
      match.refereeName = typeof ref.name === 'string' ? ref.name : match.refereeName
      match.refereeNationality = typeof ref.country === 'string' ? ref.country : match.refereeNationality
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
   * 支持从 event detail 内嵌数据 fallback
   */
  private async syncMetadata(match: MatchEntity, bsEventId: number, detailFallback?: any): Promise<boolean> {
    try {
      let meta: any = null
      // 优先尝试独立接口
      try {
        meta = await this.bsdService.getEventMetadata(bsEventId)
      } catch { /* 独立接口可能 404，fallback 到 event detail */ }
      // fallback：从 event detail 提取内嵌元数据
      if (!meta) {
        const detail = detailFallback ?? await this.bsdService.getEventDetail(bsEventId) as any
        meta = {
          jerseys: detail?.jerseys ?? null,
          funfacts: detail?.funfacts ?? null,
          ai_preview: detail?.ai_preview ?? null,
        }
      }
      match.metadata = meta as Record<string, unknown>
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
   * 支持从 event detail 内嵌数据 fallback
   */
  private async syncPlayerStats(match: MatchEntity, bsEventId: number, detailFallback?: any): Promise<boolean> {
    try {
      let stats: any = null
      // 优先尝试独立接口
      try {
        stats = await this.bsdService.getEventPlayerStats(bsEventId)
      } catch { /* 独立接口可能 404，fallback 到 event detail */ }
      // fallback：从 event detail 提取内嵌球员统计
      if (!stats) {
        const detail = detailFallback ?? await this.bsdService.getEventDetail(bsEventId) as any
        if (detail?.player_stats) {
          stats = { event_id: bsEventId, player_stats: detail.player_stats }
        } else if (detail?.sr_stats?.player_stats) {
          stats = { event_id: bsEventId, player_stats: detail.sr_stats.player_stats }
        }
      }
      if (!stats) return false
      match.playerStatsData = stats as Record<string, unknown>
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
              strengths: bsPlayer.strengths || null,
              weaknesses: bsPlayer.weaknesses || null,
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

    // 仅同步 2026 世界杯赛事（league_id=27），非世界杯赛事直接跳过
    const bsEventLeagueId = (bsEvent.league as any)?.id
    if (bsEventLeagueId != null && bsEventLeagueId !== WORLD_CUP_LEAGUE_ID) {
      return 'skipped' as any
    }

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
      // 点球大战比分：优先从 extra_time_score 解析主客队各自比分，
      // fallback 到 penalty_shootout（仅一个数字，无法区分主客队时设为 null）
      penaltyShootout: bsEvent.penalty_shootout != null
        ? (parsePenaltyScore(bsEvent.extra_time_score) ?? null)
        : null,
      // 场馆 ID：优先从 venue_id 字段获取（列表 API），fallback 到 venue 嵌套对象的 id（详情 API）
      venueId: bsEvent.venue_id ?? bsEvent.venue?.id ?? null,
      // 教练 ID：优先从 coach_id 字段获取，fallback 到 coach 嵌套对象的 id
      homeCoachId: bsEvent.home_coach_id ?? bsEvent.home_coach?.id ?? null,
      awayCoachId: bsEvent.away_coach_id ?? bsEvent.away_coach?.id ?? null,
      // 裁判 ID：优先从 referee_id 字段获取（列表 API），fallback 到 referee 嵌套对象的 id（详情 API）
      refereeId: bsEvent.referee_id ?? bsEvent.referee?.id ?? null,
      isLocalDerby: !!bsEvent.is_local_derby,
      isNeutralGround: !!bsEvent.is_neutral_ground,
      liveWebsocket: !!bsEvent.live_websocket,
      // 天气/环境数据（优先使用顶层字段，fallback 到 weather 嵌套对象）
      temperature: bsEvent.temperature_c ?? bsEvent.weather?.temperature_c ?? null,
      windSpeed: bsEvent.wind_speed ?? bsEvent.weather?.wind_speed ?? null,
      weatherCondition: bsEvent.weather?.description ?? null,
      // 观众人数
      totalAttendance: bsEvent.attendance ?? null,
      pitchCondition: bsEvent.pitch_condition ?? null,
      travelDistanceKm: bsEvent.travel_distance_km ?? null,
      lastSyncedAt: new Date(),
      dataSource: `bsd_${bsdId}`,
      dataSourceUrl: `https://sports.bzzoiro.com/api/events/${bsdId}/`,
    }
    // 从 venue 嵌套对象直接提取场馆信息（详情 API 返回时）
    if (bsEvent.venue) {
      baseFields.venue = bsEvent.venue.name || null
      baseFields.city = bsEvent.venue.city || null
      baseFields.venueCapacity = bsEvent.venue.capacity || null
      baseFields.venueLatitude = bsEvent.venue.latitude ?? null
      baseFields.venueLongitude = bsEvent.venue.longitude ?? null
    }
    // 从 referee 嵌套对象直接提取裁判信息（详情 API 返回时）
    // 类型守卫：确保 refereeName/refereeNationality 只接受 string，防止 [object Object]
    if (bsEvent.referee && typeof bsEvent.referee === 'object') {
      const refName = bsEvent.referee.name
      baseFields.refereeName = typeof refName === 'string' ? refName : null
      const refCountry = bsEvent.referee.country
      baseFields.refereeNationality = typeof refCountry === 'string' ? refCountry : null
      // 裁判风格：根据生涯黄牌数推断
      if (bsEvent.referee.career_yellow_cards != null && bsEvent.referee.career_games != null && bsEvent.referee.career_games > 0) {
        const avgYellow = bsEvent.referee.career_yellow_cards / bsEvent.referee.career_games
        if (avgYellow >= 5) {
          baseFields.refereeStyle = 'strict'
        } else if (avgYellow >= 3) {
          baseFields.refereeStyle = 'moderate'
        } else {
          baseFields.refereeStyle = 'lenient'
        }
      }
    }
    // 从 coach 嵌套对象直接提取教练姓名（详情 API 返回时）
    if (bsEvent.home_coach) {
      baseFields.homeCoach = bsEvent.home_coach.name || null
    }
    if (bsEvent.away_coach) {
      baseFields.awayCoach = bsEvent.away_coach.name || null
    }
    if (match) {
      Object.assign(match, baseFields)
      // 同步场馆信息（仅当 venue 嵌套对象未提供数据时，通过 venue_id 查询场馆详情 API）
      if (!match.venue && match.venueId) {
        try { await this.syncVenuesForMatch(match) } catch { /* ignore */ }
      }
      // 同步裁判信息（仅当 referee 嵌套对象未提供数据时，通过 referee_id 查询裁判详情 API）
      if (!match.refereeName && match.refereeId) {
        try { await this.syncRefereeForMatch(match) } catch { /* ignore */ }
      }
      // 提取精彩集锦
      if ((bsEvent as any).highlights?.length) {
        match.highlights = (bsEvent as any).highlights
      }
      await this.matchRepo.save(match)
      return 'updated'
    }
    const entity = this.matchRepo.create(baseFields)
    // 同步场馆信息（仅当 venue 嵌套对象未提供数据时）
    if (!entity.venue && entity.venueId) {
      try { await this.syncVenuesForMatch(entity) } catch { /* ignore */ }
    }
    // 同步裁判信息（仅当 referee 嵌套对象未提供数据时）
    if (!entity.refereeName && entity.refereeId) {
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
    let team = await this.teamRepo.findOne({ where: { dataSource: key } })
    if (!team) {
      let isoCode = 'INT'
      let country: string | null = null
      let logo: string | null = null
      let venueName: string | null = null
      let isNational = false
      let founded: number | null = null
      let shortName: string | null = null
      let detailName: string | null = null
      try {
        const detail = (await this.bsdService.getTeamDetail(bsdId)) as {
          name?: string
          country?: string
          logo?: string
          is_national?: boolean
          venue_name?: string
          founded?: number
          short_name?: string
        }
        detailName = detail?.name || null
        isoCode = countryToIso(detail?.country)
        country = detail?.country || null
        logo = detail?.logo || null
        venueName = detail?.venue_name || null
        isNational = !!detail?.is_national
        founded = detail?.founded || null
        shortName = detail?.short_name || null
      } catch {
        /* 兜底用默认值 */
      }
      // 优先使用详情 API 返回的 name，其次使用传入的 name，最后兜底 Team-{id}
      const realName = detailName || name || `Team-${bsdId}`
      const safeName = realName.toString().trim() || `Team-${bsdId}`
      // 显式构造，避免 TypeORM 对 'name' 字段的意外处理
      const newTeam = new TeamEntity()
      newTeam.bsTeamId = bsdId
      newTeam.name = translateTeamName(safeName) || safeName
      newTeam.nameEn = safeName
      newTeam.nameJa = translateTeamNameTo(safeName, 'ja')
      newTeam.nameKo = translateTeamNameTo(safeName, 'ko')
      newTeam.nameEs = translateTeamNameTo(safeName, 'es')
      newTeam.nameFr = translateTeamNameTo(safeName, 'fr')
      newTeam.namePt = translateTeamNameTo(safeName, 'pt')
      newTeam.nameAr = translateTeamNameTo(safeName, 'ar')
      newTeam.shortName = shortName
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
    } else {
      // 已有队伍：补充缺失的多语言字段和占位符队名
      const needsI18n = !team.nameJa || !team.nameKo || !team.nameEs || !team.nameFr || !team.namePt || !team.nameAr
      // 如果队名是占位符（Team-{id}），尝试通过详情 API 获取真实名称
      const isPlaceholder = team.nameEn?.startsWith('Team-') || team.name?.startsWith('Team-')
      if (isPlaceholder) {
        try {
          const detail = (await this.bsdService.getTeamDetail(bsdId)) as {
            name?: string
            country?: string
            logo?: string
          }
          if (detail?.name) {
            team.name = translateTeamName(detail.name) || detail.name
            team.nameEn = detail.name
            if (needsI18n) {
              team.nameJa = translateTeamNameTo(detail.name, 'ja')
              team.nameKo = translateTeamNameTo(detail.name, 'ko')
              team.nameEs = translateTeamNameTo(detail.name, 'es')
              team.nameFr = translateTeamNameTo(detail.name, 'fr')
              team.namePt = translateTeamNameTo(detail.name, 'pt')
              team.nameAr = translateTeamNameTo(detail.name, 'ar')
            }
          }
          if (detail?.country) {
            team.countryCode = countryToIso(detail.country)
            team.country = detail.country
          }
          if (detail?.logo) team.logo = detail.logo
        } catch {
          /* ignore */
        }
      } else if (needsI18n) {
        team.nameJa = team.nameJa || translateTeamNameTo(team.nameEn, 'ja')
        team.nameKo = team.nameKo || translateTeamNameTo(team.nameEn, 'ko')
        team.nameEs = team.nameEs || translateTeamNameTo(team.nameEn, 'es')
        team.nameFr = team.nameFr || translateTeamNameTo(team.nameEn, 'fr')
        team.namePt = team.namePt || translateTeamNameTo(team.nameEn, 'pt')
        team.nameAr = team.nameAr || translateTeamNameTo(team.nameEn, 'ar')
      }
      if (team.countryCode === 'INT') {
        // 已有但 country 为默认值，尝试补充
        try {
          const detail = (await this.bsdService.getTeamDetail(bsdId)) as { country?: string; logo?: string }
          if (detail?.country) {
            team.countryCode = countryToIso(detail.country)
            team.country = detail.country
            if (detail.logo) team.logo = detail.logo
          }
        } catch {
          /* ignore */
        }
      }
      if (needsI18n || team.countryCode === 'INT') {
        team.lastSyncedAt = new Date()
        await this.teamRepo.save(team)
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

  /** 同步阵容：返回写入条数；支持从 event detail 内嵌数据 fallback */
  private async syncLineups(match: MatchEntity, bsEventId: number, detailFallback?: any): Promise<number> {
    let resp: BsLineups | null = null
    // 优先尝试独立接口
    try {
      resp = (await this.bsdService.getEventLineups(bsEventId)) as BsLineups
    } catch { /* 独立接口可能 404，fallback 到 event detail */ }
    // fallback：从 event detail 内嵌 lineups 提取
    if (!resp?.lineups) {
      try {
        const detail = detailFallback ?? await this.bsdService.getEventDetail(bsEventId) as any
        if (detail?.lineups) {
          resp = {
            event_id: bsEventId,
            lineup_status: detail.lineup_status || (detail.lineups?.confirmed ? 'confirmed' : 'predicted'),
            beta: false,
            lineups: detail.lineups,
          } as BsLineups
        }
      } catch { /* ignore */ }
    }
    if (!resp?.lineups) return 0
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
  private async syncCoachesForMatch(match: MatchEntity, bsEventId: number, detailFallback?: any): Promise<boolean> {
    try {
      const detail = detailFallback ?? await this.bsdService.getEventDetail(bsEventId) as any
      const updated: Partial<MatchEntity> = {}

      // 从嵌套的 home_team_obj/away_team_obj.coach 中提取教练姓名
      if (detail?.home_team_obj?.coach?.name && !match.homeCoach) {
        updated.homeCoach = detail.home_team_obj.coach.name
      }
      if (detail?.away_team_obj?.coach?.name && !match.awayCoach) {
        updated.awayCoach = detail.away_team_obj.coach.name
      }

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
