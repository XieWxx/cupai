import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnalysisReportEntity } from './entities/analysis-report.entity'
import { AgentService } from './agent.service'
import { AgentController } from './agent.controller'
import { SquareGateway } from './square.gateway'

// Agent 定时任务模块 - 自动扫描赛事、批量生成分析报告、数据巡检
@Module({
  imports: [TypeOrmModule.forFeature([AnalysisReportEntity])],
  controllers: [AgentController],
  providers: [AgentService, SquareGateway],
  exports: [AgentService, SquareGateway],
})
export class AgentModule {}
