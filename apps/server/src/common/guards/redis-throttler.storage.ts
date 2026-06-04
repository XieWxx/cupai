import { Injectable, Inject } from '@nestjs/common'
import { ThrottlerStorage } from '@nestjs/throttler'
import Redis from 'ioredis'

/** 限流存储记录 */
interface StorageRecord {
  totalHits: number
  timeToExpire: number
  isBlocked: boolean
  timeToBlockExpire: number
}

/**
 * 基于 Redis 的限流存储
 * 实现 ThrottlerStorage 接口，支持分布式部署
 * 使用 Redis incr + expire 实现滑动窗口限流
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  @Inject('REDIS_CLIENT') private readonly redis: Redis

  /**
   * 递增计数并返回限流记录
   * @param key - 限流键（由 tracker + 请求信息生成）
   * @param ttl - 过期时间（毫秒）
   * @param limit - 请求上限
   * @param blockDuration - 封禁时长（毫秒）
   * @param throttlerName - 限流器名称
   */
  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<StorageRecord> {
    const redisKey = `throttle:${throttlerName}:${key}`
    // 将毫秒转为秒（Redis TTL 最小单位为秒，向上取整保证精度）
    const ttlSeconds = Math.ceil(ttl / 1000)
    const blockSeconds = Math.ceil(blockDuration / 1000)

    // 递增计数
    const totalHits = await this.redis.incr(redisKey)

    // 首次访问设置过期时间
    if (totalHits === 1) {
      await this.redis.expire(redisKey, ttlSeconds)
    }

    // 获取剩余过期时间（秒 → 毫秒）
    const ttlRemaining = await this.redis.ttl(redisKey)
    const timeToExpire = Math.max(ttlRemaining, 0) * 1000

    // 判断是否触发限流
    const isBlocked = totalHits > limit
    let timeToBlockExpire = 0

    if (isBlocked) {
      // 触发限流时，设置封禁键
      const blockKey = `throttle:block:${throttlerName}:${key}`
      const blockExists = await this.redis.exists(blockKey)
      if (!blockExists) {
        await this.redis.setex(blockKey, blockSeconds, '1')
      }
      const blockTtl = await this.redis.ttl(blockKey)
      timeToBlockExpire = Math.max(blockTtl, 0) * 1000
    }

    return { totalHits, timeToExpire, isBlocked, timeToBlockExpire }
  }
}
