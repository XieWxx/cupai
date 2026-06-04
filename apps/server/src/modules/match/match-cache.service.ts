import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchEntity } from './entities/match.entity'
import { TeamEntity } from './entities/team.entity'

/**
 * 赛事缓存服务
 * 使用内存缓存（V1.0），后续升级为 Redis
 */
@Injectable()
export class MatchCacheService {
  private readonly logger = new Logger(MatchCacheService.name)

  // 内存缓存（V1.0 简易实现，后续替换为 Redis）
  private cache = new Map<string, { data: unknown; expireAt: number }>()

  // 默认缓存时间：5分钟
  private readonly DEFAULT_TTL = 5 * 60 * 1000

  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
  ) {}

  /**
   * 获取赛事列表（带缓存）
   */
  async getMatchesWithCache(status?: string, page = 1, pageSize = 20) {
    const cacheKey = `matches:${status || 'all'}:${page}:${pageSize}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

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
    this.setToCache(cacheKey, result, this.DEFAULT_TTL)
    return result
  }

  /**
   * 获取球队列表（带缓存）
   */
  async getTeamsWithCache() {
    const cacheKey = 'teams:all'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const teams = await this.teamRepo.find({ order: { fifaRank: 'ASC' } })
    this.setToCache(cacheKey, teams, this.DEFAULT_TTL * 6) // 球队数据缓存30分钟
    return teams
  }

  /**
   * 清除赛事相关缓存
   */
  clearMatchCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('matches:')) {
        this.cache.delete(key)
      }
    }
    this.logger.log('赛事缓存已清除')
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this.cache.clear()
    this.logger.log('全部缓存已清除')
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache(key: string): unknown | null {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() > item.expireAt) {
      this.cache.delete(key)
      return null
    }
    return item.data
  }

  /**
   * 写入缓存
   */
  private setToCache(key: string, data: unknown, ttl: number) {
    this.cache.set(key, { data, expireAt: Date.now() + ttl })
  }
}
