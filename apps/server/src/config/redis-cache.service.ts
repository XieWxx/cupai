import { Injectable, Inject } from '@nestjs/common'
import Redis from 'ioredis'

/**
 * Redis 缓存服务
 * 替代 V1.0 的内存缓存，支持分布式部署
 */
@Injectable()
export class RedisCacheService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值（自动 JSON 解析）
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    if (!data) return null
    try {
      return JSON.parse(data) as T
    } catch {
      return data as unknown as T
    }
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值（自动 JSON 序列化）
   * @param ttl 过期时间（秒），默认 300（5分钟）
   */
  async set(key: string, value: unknown, ttl = 300): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    if (ttl > 0) {
      await this.redis.setex(key, ttl, serialized)
    } else {
      await this.redis.set(key, serialized)
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }

  /**
   * 批量删除缓存（按前缀匹配）
   * @param pattern 键名模式（如 'matches:*'）
   */
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key)
    return result === 1
  }

  /**
   * 递增计数器（用于限流）
   * @param key 计数器键
   * @param ttl 过期时间（秒）
   * @returns 递增后的值
   */
  async incr(key: string, ttl: number): Promise<number> {
    const count = await this.redis.incr(key)
    // 首次创建时设置过期时间
    if (count === 1) {
      await this.redis.expire(key, ttl)
    }
    return count
  }
}
