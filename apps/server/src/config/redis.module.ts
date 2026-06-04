import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

/**
 * Redis 全局模块
 * 提供全局可注入的 Redis 客户端实例
 */
@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost')
        const port = configService.get<number>('REDIS_PORT', 6379)
        const password = configService.get<string>('REDIS_PASSWORD', '')

        const client = new Redis({
          host,
          port,
          password: password || undefined,
          retryStrategy: (times) => {
            // 重试策略：最多重试10次，间隔递增
            if (times > 10) return null
            return Math.min(times * 200, 5000)
          },
        })

        client.on('connect', () => {
          console.log('[Redis] 连接成功')
        })

        client.on('error', (err) => {
          console.error('[Redis] 连接错误:', err.message)
        })

        return client
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
