import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnalysisReportEntity } from './entities/analysis-report.entity'
import { InteractionEntity } from './entities/interaction.entity'
import { MatchEntity } from '../match/entities/match.entity'
import { UserAiConfigEntity } from '../ai/entities/user-ai-config.entity'
import { WeightModelEntity } from '../ranking/entities/weight-model.entity'
import { PromptTemplateEntity } from '../prompt/entities/prompt-template.entity'
import { AgentService } from './agent.service'
import { AgentController } from './agent.controller'
import { OpenAgentController } from './open-agent.controller'
import { SquareGateway } from './square.gateway'
import { AgentSchedulerService } from './agent-scheduler.service'
import { AlgorithmService } from './algorithm.service'
import { InteractionService } from './interaction.service'
import { AiModule } from '../ai/ai.module'
import { RedisModule } from '../../config/redis.module'

// Agent 模块 - 分析报告生成、算法引擎、社区互动、定时任务
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalysisReportEntity,
      InteractionEntity,
      MatchEntity,
      UserAiConfigEntity,
      WeightModelEntity,
      PromptTemplateEntity,
    ]),
    AiModule,
    RedisModule,
  ],
  controllers: [AgentController, OpenAgentController],
  providers: [AgentService, SquareGateway, AgentSchedulerService, AlgorithmService, InteractionService],
  exports: [AgentService, SquareGateway, AlgorithmService, InteractionService],
})
export class AgentModule {}
