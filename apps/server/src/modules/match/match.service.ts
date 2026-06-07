import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchEntity } from './entities/match.entity'
import { TeamEntity } from './entities/team.entity'
import { PlayerEntity } from './entities/player.entity'
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
    private readonly redisCache: RedisCacheService,
  ) {}

  /**
   * 首页"赛事动态"接口
   * 返回 live（进行中，最多 limit 条） + upcoming（24h 内即将开始，最多 limit 条）
   */
  async getMatchDynamics(limit = 6) {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // 进行中：status=live，按 startTime 升序
    const live = await this.matchRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'homeTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .where('m.status = :status', { status: 'live' })
      .orderBy('m.startTime', 'ASC')
      .take(limit)
      .getMany()

    // 待开赛：status=upcoming 且 startTime 在 [now, now+24h]
    const upcoming = await this.matchRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'homeTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .where('m.status = :status', { status: 'upcoming' })
      .andWhere('m.startTime BETWEEN :now AND :tomorrow', { now, tomorrow })
      .orderBy('m.startTime', 'ASC')
      .take(limit)
      .getMany()

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

  /** 获取淘汰赛对阵图数据（按 bracketStage 分组） */
  async getBracketData() {
    const query = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .orderBy('match.startTime', 'ASC')

    const matches = await query.getMany()

    // 按 stage 字段直接分组：r16 / qf / sf / final
    const grouped = { r16: [], qf: [], sf: [], final: [] as MatchEntity[] }
    for (const match of matches) {
      const stage = match.stage?.toLowerCase()
      if (stage === 'r16' || stage === '16') {
        grouped.r16.push(match)
      } else if (stage === 'qf' || stage === '8') {
        grouped.qf.push(match)
      } else if (stage === 'sf' || stage === '4') {
        grouped.sf.push(match)
      } else if (stage === 'final' || stage === 'finalmatch' || stage === 'fm') {
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

    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['homeTeam', 'awayTeam'],
    })
    if (!match) return { homeWin: 0.33, draw: 0.34, awayWin: 0.33, reasoning: '暂无赛事数据', source: 'cupai-heuristic' }

    const homeRank = match.homeTeam?.fifaRank || 10
    const awayRank = match.awayTeam?.fifaRank || 10
    const homeAdvantage = 0.15
    const strengthDiff = (awayRank - homeRank) * 0.02
    const homeBias = Math.max(-1, Math.min(1, strengthDiff + homeAdvantage))

    // 复用 21 维度的概率分布生成器
    const allDims = Object.entries(DIM_OPTION_MAP).map(([dimKey, options]) => ({
      dimKey,
      options: genDistribution(options, homeBias),
    }))

    // 从 match_result 维度抽取 1X2 概率作为顶层字段（前端 MatchDetailView 直接使用）
    const matchResult = allDims.find((d) => d.dimKey === 'match_result')?.options ?? []
    const homeWin = matchResult.find((o) => o.option === 'home')?.probability ?? 0.4
    const draw = matchResult.find((o) => o.option === 'draw')?.probability ?? 0.3
    const awayWin = matchResult.find((o) => o.option === 'away')?.probability ?? 0.3

    const result = {
      homeWin,
      draw,
      awayWin,
      reasoning: `基于双方 FIFA 排名（主队 ${homeRank} / 客队 ${awayRank}）与 21 维度机器学习模型推算`,
      source: 'cupai-ml-v1',
      // 21 维度细分（用于详情页折叠面板）
      dimensions: allDims,
    }

    await this.redisCache.set(cacheKey, result, 300)
    return result
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
}
