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

    // 进行中：status=live，按 startTime 升序，仅返回 2026 世界杯数据
    const live = await this.matchRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'homeTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .where('m.status = :status', { status: 'live' })
      .andWhere('(m.leagueId = :leagueId OR m.leagueName LIKE :wc)', {
        leagueId: 27,
        wc: '%World Cup%',
      })
      .orderBy('m.startTime', 'ASC')
      .take(limit)
      .getMany()

    // 待开赛：status=upcoming 且 startTime 在 [now, now+30天]，仅返回 2026 世界杯数据
    // 时间窗拉到 30 天确保能展示近期比赛；首页按开球时间升序
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const upcoming = await this.matchRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'homeTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .where('m.status = :status', { status: 'upcoming' })
      .andWhere('m.startTime BETWEEN :now AND :nextMonth', { now, nextMonth })
      .andWhere('(m.leagueId = :leagueId OR m.leagueName LIKE :wc)', {
        leagueId: 27,
        wc: '%World Cup%',
      })
      .orderBy('m.startTime', 'ASC')
      .take(limit)
      .getMany()

    // 解析占位符队伍（淘汰赛阶段的 "1A"/"G1" 等占位队名替换为实际球队）
    const groupTeamsMap = await this.buildGroupTeamsMap(27)
    const groupStageFinished = await this.isGroupStageFinished(27)
    const resolveMatch = (m: MatchEntity) =>
      this.resolvePlaceholderTeams(m, groupTeamsMap, groupStageFinished)

    // 兜底：若 7 天内没有待开赛，回退展示任意 upcoming 比赛（仅 2026 世界杯）
    // 这样可保证首页"待开赛"模块始终有内容
    if (upcoming.length === 0) {
      const fallback = await this.matchRepo
        .createQueryBuilder('m')
        .leftJoinAndSelect('m.homeTeam', 'homeTeam')
        .leftJoinAndSelect('m.awayTeam', 'awayTeam')
        .where('m.status = :status', { status: 'upcoming' })
        .andWhere('(m.leagueId = :leagueId OR m.leagueName LIKE :wc)', {
          leagueId: 27,
          wc: '%World Cup%',
        })
        .orderBy('m.startTime', 'ASC')
        .take(limit)
        .getMany()
      return { live: live.map(resolveMatch), upcoming: fallback.map(resolveMatch) }
    }

    return { live: live.map(resolveMatch), upcoming: upcoming.map(resolveMatch) }
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

    // 仅返回 2026 世界杯数据
    query.andWhere('(match.leagueId = :leagueId OR match.leagueName LIKE :wc OR match.leagueName LIKE :wcCn)', {
      leagueId: 27,
      wc: '%World Cup%',
      wcCn: '%世界杯%',
    })

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    // 解析占位符队伍（淘汰赛阶段的 "1A"/"G1" 等占位队名替换为实际球队）
    const groupTeamsMap = await this.buildGroupTeamsMap(27)
    const groupStageFinished = await this.isGroupStageFinished(27)
    const resolvedList = list.map(m =>
      this.resolvePlaceholderTeams(m, groupTeamsMap, groupStageFinished)
    )

    return { list: resolvedList, total, page, pageSize }
  }

  /** 获取淘汰赛对阵图数据（按 stage 字段分组，支持 1/16 决赛起） */
  async getBracketData(leagueId?: number) {
    const query = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .where('match.stage IN (:...stages)', { stages: ['round32', 'round16', 'quarter', 'semi', 'final', 'playoff'] })

    // 按联赛过滤（默认仅展示世界杯数据）
    if (leagueId) {
      query.andWhere('match.leagueId = :leagueId', { leagueId })
    } else {
      // 默认：筛选 2026 世界杯（league_id=27, league_name='World Cup 2026'）
      query.andWhere('(match.leagueName LIKE :wc OR match.leagueName LIKE :wcCn)', {
        wc: '%World Cup%',
        wcCn: '%世界杯%',
      })
    }

    query.orderBy('match.startTime', 'ASC')

    const matches = await query.getMany()

    // 提取实际 leagueId 用于后续查询（确保小组赛和淘汰赛属于同一赛事）
    const actualLeagueId = leagueId || (matches.length > 0 ? matches[0].leagueId : undefined)

    // 检查小组赛是否全部结束
    const groupStageFinished = await this.isGroupStageFinished(actualLeagueId)

    // 构建小组→球队映射（R32 始终从小组赛解析，后续轮次仅在小组赛结束时解析）
    const groupTeamsMap = await this.buildGroupTeamsMap(actualLeagueId)

    // 解析占位球队：R32 始终解析，后续轮次仅小组赛结束后解析
    const resolvedMatches = matches.map(m => this.resolvePlaceholderTeams(m, groupTeamsMap, groupStageFinished))

    // 按 stage 字段分组（1/16 决赛 → 1/8 决赛 → 1/4 决赛 → 半决赛 → 决赛）
    const grouped = { r32: [], r16: [], qf: [], sf: [], final: [] as MatchEntity[] }
    for (const match of resolvedMatches) {
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

    return { list: resolvedMatches, bracketStage: grouped }
  }

  /**
   * 检查小组赛是否全部结束
   * 如果所有小组赛比赛状态都是 finished，则返回 true
   */
  private async isGroupStageFinished(leagueId?: number): Promise<boolean> {
    const groupQuery = this.matchRepo
      .createQueryBuilder('match')
      .where('match.stage = :stage', { stage: 'group' })

    if (leagueId) {
      groupQuery.andWhere('match.leagueId = :leagueId', { leagueId })
    } else {
      groupQuery.andWhere('(match.leagueName LIKE :wc OR match.leagueName LIKE :wcCn)', {
        wc: '%World Cup%',
        wcCn: '%世界杯%',
      })
    }

    const totalGroupMatches = await groupQuery.getCount()
    if (totalGroupMatches === 0) return false

    const finishedGroupMatches = await groupQuery
      .clone()
      .andWhere('match.status = :status', { status: 'finished' })
      .getCount()

    return finishedGroupMatches === totalGroupMatches
  }

  /**
   * 构建小组→球队映射
   * 从小组赛比赛中提取每个小组的参赛队伍及其当前排名
   * 返回格式：{ "A": [{ rank: 1, team: TeamEntity }, ...], "B": [...] }
   */
  private async buildGroupTeamsMap(leagueId?: number): Promise<Record<string, Array<{ rank: number; team: TeamEntity }>>> {
    const groupQuery = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .where('match.stage = :stage', { stage: 'group' })

    if (leagueId) {
      groupQuery.andWhere('match.leagueId = :leagueId', { leagueId })
    } else {
      groupQuery.andWhere('(match.leagueName LIKE :wc OR match.leagueName LIKE :wcCn)', {
        wc: '%World Cup%',
        wcCn: '%世界杯%',
      })
    }

    const groupMatches = await groupQuery.getMany()

    // 提取每个小组的参赛队伍（去重）
    const groupTeamIds: Record<string, Set<string>> = {}
    const teamCache: Record<string, TeamEntity> = {}

    for (const m of groupMatches) {
      const groupName = m.groupName?.replace('Group ', '').trim()
      if (!groupName) continue

      if (!groupTeamIds[groupName]) groupTeamIds[groupName] = new Set()

      // 主队
      if (m.homeTeam && m.homeTeam.countryCode !== 'INT') {
        groupTeamIds[groupName].add(m.homeTeam.id)
        teamCache[m.homeTeam.id] = m.homeTeam
      }
      // 客队
      if (m.awayTeam && m.awayTeam.countryCode !== 'INT') {
        groupTeamIds[groupName].add(m.awayTeam.id)
        teamCache[m.awayTeam.id] = m.awayTeam
      }
    }

    // 查询积分榜数据（如果有），用于确定排名
    const standingsMap = await this.getGroupStandingsMap(leagueId)

    // 构建每个小组的排名列表
    const result: Record<string, Array<{ rank: number; team: TeamEntity }>> = {}
    for (const [groupName, teamIds] of Object.entries(groupTeamIds)) {
      const teamList = Array.from(teamIds).map(id => teamCache[id]).filter(Boolean)

      // 如果有积分榜数据，按排名排序
      if (standingsMap[groupName]) {
        const standings = standingsMap[groupName]
        teamList.sort((a, b) => {
          const sa = standings.find(s => s.teamId === a.id)
          const sb = standings.find(s => s.teamId === b.id)
          // 按积分→净胜球→进球排序
          if (sa && sb) {
            if (sa.points !== sb.points) return sb.points - sa.points
            if (sa.goalDifference !== sb.goalDifference) return sb.goalDifference - sa.goalDifference
            return sb.goalsFor - sa.goalsFor
          }
          return 0
        })
      }

      result[groupName] = teamList.map((team, idx) => ({
        rank: idx + 1,
        team,
      }))
    }

    return result
  }

  /**
   * 获取小组积分榜映射
   * 返回格式：{ "A": [{ teamId, points, goalDifference, goalsFor, played }, ...], ... }
   */
  private async getGroupStandingsMap(leagueId?: number): Promise<Record<string, Array<{ teamId: string; points: number; goalDifference: number; goalsFor: number; played: number }>>> {
    try {
      // 从 group_standings 表查询（如果有世界杯小组积分数据）
      const standingRepo = this.matchRepo.manager.getRepository('GroupStandingEntity')
      const standings = await standingRepo
        .createQueryBuilder('s')
        .leftJoinAndSelect('s.team', 'team')
        .orderBy('s.groupName', 'ASC')
        .addOrderBy('s.points', 'DESC')
        .addOrderBy('s.goalDifference', 'DESC')
        .addOrderBy('s.goalsFor', 'DESC')
        .getMany()

      const result: Record<string, Array<{ teamId: string; points: number; goalDifference: number; goalsFor: number; played: number }>> = {}
      for (const s of standings) {
        // 将 "Group A" → "A"，"A" → "A"
        const groupName = (s.groupName || '').replace('Group ', '').trim()
        if (!groupName || groupName === 'LEAGUE') continue
        if (!result[groupName]) result[groupName] = []
        result[groupName].push({
          teamId: s.teamId,
          points: s.points || 0,
          goalDifference: s.goalDifference || 0,
          goalsFor: s.goalsFor || 0,
          played: s.played || 0,
        })
      }
      return result
    } catch {
      return {}
    }
  }

  /**
   * 解析占位球队
   * R32（1/16 决赛）：始终从小组赛解析，显示各小组当前排名队伍
   * 后续轮次（R16/QF/SF/Final）：仅小组赛全部结束后才解析
   */
  private resolvePlaceholderTeams(match: MatchEntity, groupTeamsMap: Record<string, Array<{ rank: number; team: TeamEntity }>>, groupStageFinished: boolean): any {
    const result: any = { ...match }
    const stage = match.stage?.toLowerCase()
    // R32/league 阶段始终解析；后续轮次仅在小组赛全部结束后解析
    // BSD API 将1/16决赛标记为 league，需一并支持
    const isEarlyRound = ['round32', 'r32', '32', 'league'].includes(stage)

    // 早期轮次始终解析；后续轮次仅小组赛结束后解析
    if (!isEarlyRound && !groupStageFinished) return result

    // 解析主队占位
    if (match.homeTeam?.countryCode === 'INT' && this.isPlaceholderTeam(match.homeTeam.name)) {
      const resolved = this.resolvePlaceholder(match.homeTeam.name, groupTeamsMap)
      if (resolved) {
        result.homeTeam = resolved.team
        result.homeTeamPlaceholder = match.homeTeam.name
        // 小组赛未结束时标记为待确认
        if (!groupStageFinished) result.homeTeamConfirmed = false
      }
    }

    // 解析客队占位
    if (match.awayTeam?.countryCode === 'INT' && this.isPlaceholderTeam(match.awayTeam.name)) {
      const resolved = this.resolvePlaceholder(match.awayTeam.name, groupTeamsMap)
      if (resolved) {
        result.awayTeam = resolved.team
        result.awayTeamPlaceholder = match.awayTeam.name
        if (!groupStageFinished) result.awayTeamConfirmed = false
      }
    }

    return result
  }

  /** 判断是否为占位球队（如 "1A", "2L", "3A/3B/3C/3D/3F", "G1", "H2"） */
  private isPlaceholderTeam(name: string): boolean {
    if (!name) return false
    // 匹配 "1A"-"9Z" 或 "3A/3B/..." 格式（排名+组名）
    // 匹配 "G1"/"H2" 或 "G1/H2/..." 格式（组名+排名）
    // 匹配 "W74"/"L77" 格式（Winner/Loser of match）
    return /^(\d[A-Z](\/\d[A-Z])*)$/.test(name)
      || /^([A-Z]\d(\/[A-Z]\d)*)$/.test(name)
      || /^[WL]\d+$/.test(name)
  }

  /**
   * 解析单个占位符为实际球队
   * "1A" → Group A 排名第1的球队
   * "G1" → G组 排名第1的球队（组名+排名格式）
   * "3A/3B/3C/3D/3F" → 这些小组第3名中成绩最好的球队
   */
  private resolvePlaceholder(placeholder: string, groupTeamsMap: Record<string, Array<{ rank: number; team: TeamEntity }>>): { rank: number; team: TeamEntity } | null {
    // 简单占位符：如 "1A", "2L"（排名+组名）
    const simpleMatch = placeholder.match(/^(\d)([A-L])$/)
    if (simpleMatch) {
      const rank = parseInt(simpleMatch[1])
      const group = simpleMatch[2]
      const groupTeams = groupTeamsMap[group]
      if (groupTeams && groupTeams.length >= rank) {
        return groupTeams[rank - 1]
      }
      return null
    }

    // 反向占位符：如 "G1", "H2"（组名+排名）
    const reverseMatch = placeholder.match(/^([A-Z])(\d)$/)
    if (reverseMatch) {
      const group = reverseMatch[1]
      const rank = parseInt(reverseMatch[2])
      const groupTeams = groupTeamsMap[group]
      if (groupTeams && groupTeams.length >= rank) {
        return groupTeams[rank - 1]
      }
      return null
    }

    // 复杂占位符：如 "3A/3B/3C/3D/3F"（多个小组第3名中的最佳）
    const complexMatch = placeholder.match(/^3([A-Z](?:\/3[A-Z])*)$/)
    if (complexMatch) {
      const groups = complexMatch[1].split('/3')
      const thirdPlaceTeams = groups
        .map(g => groupTeamsMap[g]?.[2]) // 第3名（索引2）
        .filter(Boolean)

      if (thirdPlaceTeams.length > 0) {
        // 返回第一个有数据的第3名球队（实际应按成绩排序，但小组赛未结束无法确定）
        return thirdPlaceTeams[0]
      }
      return null
    }

    return null
  }

  /**
   * 获取占位符对应的候选球队列表
   * 用于前端展示 "1A" 对应的 Group A 所有参赛队伍
   */
  private getCandidates(placeholder: string, groupTeamsMap: Record<string, Array<{ rank: number; team: TeamEntity }>>): Array<{ rank: number; team: any }> {
    // 简单占位符
    const simpleMatch = placeholder.match(/^(\d)([A-L])$/)
    if (simpleMatch) {
      const group = simpleMatch[1] === '0' ? simpleMatch[2] : simpleMatch[2]
      return groupTeamsMap[group] || []
    }

    // 复杂占位符
    const complexMatch = placeholder.match(/^3([A-Z](?:\/3[A-Z])*)$/)
    if (complexMatch) {
      const groups = complexMatch[1].split('/3')
      const candidates: Array<{ rank: number; team: any }> = []
      for (const g of groups) {
        const groupTeams = groupTeamsMap[g]
        if (groupTeams) {
          candidates.push(...groupTeams)
        }
      }
      return candidates
    }

    return []
  }

  async getMatchDetail(matchId: string) {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['homeTeam', 'awayTeam'],
    })
    if (!match) return null

    // 解析占位符队伍（淘汰赛阶段的 "1A"/"G1" 等占位队名替换为实际球队）
    const leagueId = match.leagueId || 27
    const groupTeamsMap = await this.buildGroupTeamsMap(leagueId)
    const groupStageFinished = await this.isGroupStageFinished(leagueId)
    return this.resolvePlaceholderTeams(match, groupTeamsMap, groupStageFinished)
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
