import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchEntity } from './entities/match.entity'
import { TeamEntity } from './entities/team.entity'
import { PlayerEntity } from './entities/player.entity'
import { EventPredictionEntity } from './entities/event-prediction.entity'
import { EventLineupEntity } from './entities/event-lineup.entity'
import { EventIncidentEntity } from './entities/event-incident.entity'
import { EventOddsEntity } from './entities/event-odds.entity'
import { RedisCacheService } from '../../config/redis-cache.service'

/** 21 个维度的候选项 */
const DIM_OPTION_MAP: Record<string, string[]> = {
  match_result: ['home', 'draw', 'away'],
  total_goal_level: ['0', '1', '2', '3+'],
  half_full_result: ['H-H', 'H-D', 'H-A', 'D-H', 'D-D', 'D-A', 'A-H', 'A-D', 'A-A'],
  exact_score: ['1-0', '2-1', '2-0', '1-1', '0-0'],
  first_half_goal: ['yes', 'no'],
  first_goal_team: ['home', 'away', 'none'],
  last_goal_team: ['home', 'away', 'none'],
  own_goal: ['yes', 'no'],
  player_goal: ['yes', 'no'],
  stoppage_goal: ['yes', 'no'],
  clean_sheet: ['home', 'away', 'none'],
  goal_odd_even: ['odd', 'even'],
  normal_penalty: ['yes', 'no'],
  var_cancel_goal: ['yes', 'no'],
  extra_penalty_tournament: ['extra', 'penalty', 'normal'],
  red_card: ['yes', 'no'],
  yellow_total_level: ['0', '1-2', '3+'],
  yellow_compare: ['home', 'away', 'equal'],
  corner_level: ['0-3', '4-6', '7+'],
  free_kick_goal: ['yes', 'no'],
  substitute_compare: ['home', 'away', 'equal'],
}

function randn(): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function genDistribution(options: string[], homeBias: number): Array<{ option: string; probability: number }> {
  const weights = options.map((_, i) => {
    const center = options.length === 1 ? 0 : (i / (options.length - 1)) * 2 - 1
    const noise = randn() * 0.15
    const z = -((center - homeBias) ** 2) + 0.5 + noise
    return Math.max(0.02, Math.exp(z))
  })
  const sum = weights.reduce((a, b) => a + b, 0)
  return options.map((option, i) => ({ option, probability: Number((weights[i] / sum).toFixed(3)) }))
}

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name)

  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
    @InjectRepository(EventPredictionEntity)
    private readonly predictionRepo: Repository<EventPredictionEntity>,
    @InjectRepository(EventLineupEntity)
    private readonly lineupRepo: Repository<EventLineupEntity>,
    @InjectRepository(EventIncidentEntity)
    private readonly incidentRepo: Repository<EventIncidentEntity>,
    @InjectRepository(EventOddsEntity)
    private readonly oddsRepo: Repository<EventOddsEntity>,
    private readonly redisCache: RedisCacheService,
  ) {}

  /**
   * 首页"赛事动态"接口
   * 返回 live（进行中，最多 limit 条） + upcoming（24h 内即将开始，最多 limit 条）
   *
   * 注意：BSD 同步的 startTime 已是 UTC（容器 +08:00 时区已统一处理），
   * 所以这里 `new Date()` 取 UTC 时刻，与 DB 中存的 UTC 时间一致。
   */
  async getMatchDynamics(limit = 6) {
    const now = new Date()

    // 进行中：status=live，按 startTime 升序
    const live = await this.matchRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'homeTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .where('m.status = :status', { status: 'live' })
      .orderBy('m.startTime', 'ASC')
      .take(limit)
      .getMany()

    // 待开赛：status=upcoming 且 startTime 在 [now, now+30天]
    // 时间窗拉到 30 天确保能展示近期比赛；首页按开球时间升序
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const upcoming = await this.matchRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'homeTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .where('m.status = :status', { status: 'upcoming' })
      .andWhere('m.startTime BETWEEN :now AND :nextMonth', { now, nextMonth })
      .orderBy('m.startTime', 'ASC')
      .take(limit)
      .getMany()

    // 兜底：若 7 天内没有待开赛，回退展示任意 upcoming 比赛（不限时间窗）
    // 这样可保证首页"待开赛"模块始终有内容
    if (upcoming.length === 0) {
      const fallback = await this.matchRepo
        .createQueryBuilder('m')
        .leftJoinAndSelect('m.homeTeam', 'homeTeam')
        .leftJoinAndSelect('m.awayTeam', 'awayTeam')
        .where('m.status = :status', { status: 'upcoming' })
        .orderBy('m.startTime', 'ASC')
        .take(limit)
        .getMany()
      return { live, upcoming: fallback }
    }

    return { live, upcoming }
  }

  async getMatches(status?: string, stage?: string, page = 1, pageSize = 20) {
    const statusAlias: Record<string, string> = { upcoming: 'upcoming', live: 'live', finished: 'finished' }
    const mappedStatus = status ? statusAlias[status] ?? status : status

    const query = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .orderBy('match.startTime', 'ASC')

    if (mappedStatus) query.andWhere('match.status = :status', { status: mappedStatus })

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { list, total, page, pageSize }
  }

  /** 获取淘汰赛对阵图数据（按 stage 字段分组，支持 1/16 决赛起） */
  async getBracketData(leagueId?: string) {
    const query = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .where('match.stage IN (:...stages)', { stages: ['round32', 'round16', 'quarter', 'semi', 'final', 'playoff'] })

    // 按联赛过滤（默认仅展示世界杯数据）
    if (leagueId) {
      query.andWhere('match.leagueId = :leagueId', { leagueId })
    } else {
      // 默认：筛选 leagueName 包含 "World Cup" 或 "世界杯" 的赛事
      query.andWhere('(match.leagueName LIKE :wc OR match.leagueName LIKE :wcCn)', {
        wc: '%World Cup%',
        wcCn: '%世界杯%',
      })
    }

    query.orderBy('match.startTime', 'ASC')

    const matches = await query.getMany()

    // 按 stage 字段分组（1/16 决赛 → 1/8 决赛 → 1/4 决赛 → 半决赛 → 决赛）
    const grouped = { r32: [], r16: [], qf: [], sf: [], final: [] as MatchEntity[] }
    for (const match of matches) {
      const stage = match.stage?.toLowerCase()
      if (stage === 'round32' || stage === 'r32' || stage === '32') {
        grouped.r32.push(match)
      } else if (stage === 'round16' || stage === 'r16' || stage === '16') {
        grouped.r16.push(match)
      } else if (stage === 'quarter' || stage === 'qf' || stage === '8') {
        grouped.qf.push(match)
      } else if (stage === 'semi' || stage === 'sf' || stage === '4') {
        grouped.sf.push(match)
      } else if (stage === 'final' || stage === 'finalmatch' || stage === 'fm' || stage === 'playoff') {
        grouped.final.push(match)
      }
    }

    return { list: matches, bracketStage: grouped }
  }

  async getMatchDetail(matchId: string) {
    return this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['homeTeam', 'awayTeam'],
    })
  }

  async getMatchPrediction(matchId: string) {
    const cacheKey = `prediction:${matchId}`
    const cached = await this.redisCache.get<any>(cacheKey)
    if (cached) return cached

    // 优先从 event_predictions 表读取 BSD 真实预测数据
    const realPred = await this.predictionRepo.findOne({
      where: { matchId },
      order: { updatedAt: 'DESC' },
    })

    if (realPred && typeof realPred.probHome === 'number') {
      const result = {
        homeWin: realPred.probHome,
        draw: realPred.probDraw,
        awayWin: realPred.probAway,
        reasoning: realPred.favorite
          ? `BSD AI 模型预测（${realPred.modelVersion || 'v1'}），倾向: ${realPred.favorite}，置信度: ${((realPred.confidence || 0) * 100).toFixed(0)}%`
          : `BSD AI 模型预测（${realPred.modelVersion || 'v1'}）`,
        source: `bsd-ml${realPred.modelVersion ? '-' + realPred.modelVersion : ''}`,
        expectedGoals: {
          home: realPred.expectedGoalsHome,
          away: realPred.expectedGoalsAway,
        },
        overUnder: {
          probOver15: realPred.probOver15,
          probOver25: realPred.probOver25,
          probOver35: realPred.probOver35,
        },
        btts: realPred.probBttsYes,
        mostLikelyScore: realPred.mostLikelyScore,
      }
      await this.redisCache.set(cacheKey, result, 300)
      return result
    }

    // 无真实预测数据时返回 null，前端展示"暂无预测数据"
    return null
  }

  async getTeams() {
    return this.teamRepo.find({ order: { fifaRank: 'ASC' } })
  }

  async getTeamDetail(teamId: string) {
    const team = await this.teamRepo.findOne({ where: { id: teamId } })
    const players = await this.playerRepo.find({ where: { teamId } })
    return { ...team, players }
  }

  async getPlayerDetail(playerId: string) {
    return this.playerRepo.findOne({ where: { id: playerId }, relations: ['team'] })
  }

  /**
   * 获取赛事阵容（首发+替补）
   * 数据来源：EventLineupEntity（由 BSD 同步服务写入）
   * 返回格式：{ home: { starters: [], substitutes: [], formation }, away: { ... } }
   */
  async getMatchLineups(matchId: string) {
    const rows = await this.lineupRepo.find({
      where: { matchId },
      order: { side: 'ASC', isStarter: 'DESC', jerseyNumber: 'ASC' },
    })

    const home = {
      starters: rows.filter((r) => r.side === 'home' && r.isStarter),
      substitutes: rows.filter((r) => r.side === 'home' && !r.isStarter),
      formation: rows.find((r) => r.side === 'home' && r.formation)?.formation || null,
    }
    const away = {
      starters: rows.filter((r) => r.side === 'away' && r.isStarter),
      substitutes: rows.filter((r) => r.side === 'away' && !r.isStarter),
      formation: rows.find((r) => r.side === 'away' && r.formation)?.formation || null,
    }

    return { home, away }
  }

  /**
   * 获取赛事事件流（进球/红黄牌/换人等）
   * 数据来源：EventIncidentEntity（由 BSD 同步服务写入）
   * 返回格式：按时间升序的事件数组
   */
  async getMatchIncidents(matchId: string) {
    return this.incidentRepo.find({
      where: { matchId },
      order: { minute: 'ASC', id: 'ASC' },
    })
  }

  /**
   * 获取赛事赔率（1X2 + Over/Under + BTTS）
   * 数据来源：EventOddsEntity（由 BSD 同步服务写入）
   * 返回格式：单条记录或 null
   */
  async getMatchOdds(matchId: string) {
    return this.oddsRepo.findOne({ where: { matchId } })
  }
}
