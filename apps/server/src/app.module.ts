import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule, ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './config/database.config'
import { RedisModule } from './config/redis.module'
import { RedisThrottlerStorage } from './common/guards/redis-throttler.storage'
import { UserModule } from './modules/user/user.module'
import { AiModule } from './modules/ai/ai.module'
import { MatchModule } from './modules/match/match.module'
import { PromptModule } from './modules/prompt/prompt.module'
import { RankingModule } from './modules/ranking/ranking.module'
import { AgentModule } from './modules/agent/agent.module'
import { RiskModule } from './modules/risk/risk.module'

// 根模块 - 注册全局配置与业务模块
@Module({
  imports: [
    // 环境变量配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // 数据库配置
    DatabaseModule,
    // Redis 缓存配置
    RedisModule,
    // 限流配置：三级限流策略
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 60 },
    ]),
    // 定时任务模块
    ScheduleModule.forRoot(),
    // 业务模块
    UserModule,
    AiModule,
    MatchModule,
    PromptModule,
    RankingModule,
    AgentModule,
    RiskModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Redis 限流存储（覆盖默认内存存储）
    { provide: ThrottlerStorage, useClass: RedisThrottlerStorage },
    // 全局限流守卫（通过 DI 注入，自动获取 ThrottlerStorage）
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  })
export class AppModule {}
