import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GroupStandingEntity } from './entities/group-standing.entity'
import { MatchEntity } from './entities/match.entity'
import { RedisCacheService } from '../../config/redis-cache.service'

/**
 * 积分榜服务
 * 小组积分统计 + 出线形势推演
 */
@Injectable()
export class StandingService {
  private readonly logger = new Logger(StandingService.name)

  constructor(
    @InjectRepository(GroupStandingEntity)
    private readonly standingRepo: Repository<GroupStandingEntity>,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    private readonly redisCache: RedisCacheService,
  ) {}

  /**
   * 获取小组积分榜
   * @param groupName 小组名称（如 A），不传则返回所有小组
   * @param leagueId 联赛ID，不传则返回所有联赛
   */
  async getStandings(groupName?: string, leagueId?: number) {
    const cacheKey = `standings:${leagueId || 'all'}:${groupName || 'all'}`

    const cached = await this.redisCache.get<any>(cacheKey)
    if (cached) return cached

    const query = this.standingRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.team', 'team')
      .orderBy('s.groupName', 'ASC')
      .addOrderBy('s.points', 'DESC')
      .addOrderBy('s.goalDifference', 'DESC')
      .addOrderBy('s.goalsFor', 'DESC')

    if (groupName) query.andWhere('s.groupName = :groupName', { groupName })
    if (leagueId) query.andWhere('s.leagueId = :leagueId', { leagueId })

    const standings = await query.getMany()
    this.logger.log(`[getStandings] queried ${standings.length} rows, groupName=${groupName || 'all'}`)

    // 按小组分组（序列化时剥离循环引用：team.standings → undefined）
    const grouped: Record<string, any[]> = {}
    for (const s of standings) {
      if (!grouped[s.groupName]) grouped[s.groupName] = []
      // 将 Entity 转为纯 POJO，避免 JSON.stringify 循环引用报错
      const plain = { ...s }
      if (plain.team) {
        plain.team = { ...(plain.team as any) }
        delete (plain.team as any).standings
      }
      grouped[s.groupName].push(plain)
    }

    const result = { groups: grouped, total: standings.length }
    this.logger.log(`[getStandings] result groups keys: ${Object.keys(grouped).join(',')}, total: ${standings.length}`)
    await this.redisCache.set(cacheKey, result, 300)
    return result
  }

  /**
   * 获取出线形势分析
   * 基于当前积分和剩余赛程，推演出线概率
   */
  async getAdvanceAnalysis(groupName: string) {
    const cacheKey = `advance:${groupName}`

    const cached = await this.redisCache.get<any>(cacheKey)
    if (cached) return cached

    const standings = await this.standingRepo.find({
      where: { groupName },
      relations: ['team'],
      order: { points: 'DESC', goalDifference: 'DESC', goalsFor: 'DESC' },
    })

    if (standings.length === 0) return { groupName, teams: [], analysis: '暂无数据' }

    // 简单出线形势推演
    const maxPoints = Math.max(...standings.map((s) => s.points))
    const teams = standings.map((s, index) => {
      const remainingGames = 3 - s.played // 假设小组赛3场
      const maxPossiblePoints = s.points + remainingGames * 3
      const canAdvance = index < 2 || maxPossiblePoints >= maxPoints

      return {
        rank: index + 1,
        teamId: s.teamId,
        teamName: (s as any).team?.name || '未知',
        points: s.points,
        played: s.played,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalDifference: s.goalDifference,
        maxPossiblePoints,
        advanceProbability: s.advanceProbability || (canAdvance ? Math.max(20, 100 - index * 25) : 5),
        status: index < 2 ? '出线区' : canAdvance ? '有望出线' : '基本出局',
      }
    })

    const result = { groupName, teams }
    await this.redisCache.set(cacheKey, result, 300)
    return result
  }

  /**
   * 更新积分榜（赛事结束后调用）
   */
  async updateStandings(matchId: string) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } })
    if (!match || match.status !== 'finished') return

    // 更新主队积分
    await this.updateTeamStanding(match.homeTeamId, match.groupName || 'A', match.homeScore, match.awayScore)
    // 更新客队积分
    await this.updateTeamStanding(match.awayTeamId, match.groupName || 'A', match.awayScore, match.homeScore)

    // 清除积分榜缓存
    await this.redisCache.delByPattern('standings:*')
    await this.redisCache.delByPattern('advance:*')

    this.logger.log(`赛事 ${matchId} 积分榜已更新`)
  }

  /**
   * 更新单支球队积分
   */
  private async updateTeamStanding(teamId: string, groupName: string, goalsFor: number, goalsAgainst: number) {
    let standing = await this.standingRepo.findOne({ where: { teamId, groupName } })

    if (!standing) {
      standing = this.standingRepo.create({ teamId, groupName, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, rankPosition: 0 })
    }

    standing.played += 1
    standing.goalsFor += goalsFor
    standing.goalsAgainst += goalsAgainst
    standing.goalDifference = standing.goalsFor - standing.goalsAgainst

    if (goalsFor > goalsAgainst) {
      standing.wins += 1
      standing.points += 3
    } else if (goalsFor === goalsAgainst) {
      standing.draws += 1
      standing.points += 1
    } else {
      standing.losses += 1
    }

    await this.standingRepo.save(standing)
  }
}
