import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'

// 根模块 - 注册全局配置与业务模块
@Module({
  imports: [
    // 环境变量配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // 定时任务模块
    ScheduleModule.forRoot(),
    // 业务模块（后续逐步注册）
    // UserModule,
    // AiModule,
    // MatchModule,
    // PromptModule,
    // RankingModule,
    // AgentModule,
    // RiskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
