import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchEntity } from './entities/match.entity'
import { TeamEntity } from './entities/team.entity'
import { RedisCacheService } from '../../config/redis-cache.service'

/**
 * 赛事缓存服务
 * V1.1 升级为 Redis 缓存，支持分布式部署
 */
@Injectable()
export class MatchCacheService {
  private readonly logger = new Logger(MatchCacheService.name)

  // 默认缓存时间：5分钟（秒）
  private readonly DEFAULT_TTL = 300

  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
    private readonly redisCache: RedisCacheService,
  ) {}

  /**
   * 获取赛事列表（带 Redis 缓存）
   */
  async getMatchesWithCache(status?: string, page = 1, pageSize = 20) {
    const cacheKey = `matches:${status || 'all'}:${page}:${pageSize}`

    // 先查 Redis 缓存
    const cached = await this.redisCache.get<any>(cacheKey)
    if (cached) return cached

    // 缓存未命中，查询数据库
    const query = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .orderBy('match.startTime', 'ASC')

    if (status) query.andWhere('match.status = :status', { status })

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    const result = { list, total, page, pageSize }
    await this.redisCache.set(cacheKey, result, this.DEFAULT_TTL)
    return result
  }

  /**
   * 获取球队列表（带 Redis 缓存）
   */
  async getTeamsWithCache() {
    const cacheKey = 'teams:all'

    const cached = await this.redisCache.get<any>(cacheKey)
    if (cached) return cached

    const teams = await this.teamRepo.find({ order: { fifaRank: 'ASC' } })
    await this.redisCache.set(cacheKey, teams, this.DEFAULT_TTL * 6) // 球队数据缓存30分钟
    return teams
  }

  /**
   * 清除赛事相关缓存
   */
  async clearMatchCache() {
    await this.redisCache.delByPattern('matches:*')
    this.logger.log('赛事缓存已清除')
  }

  /**
   * 清除所有缓存
   */
  async clearAllCache() {
    await this.redisCache.delByPattern('matches:*')
    await this.redisCache.delByPattern('teams:*')
    this.logger.log('全部缓存已清除')
  }
}
