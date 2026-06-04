import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './config/database.config'
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
  providers: [AppService],
})
export class AppModule {}
