import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WeightModelEntity } from './entities/weight-model.entity'
import { UserRankingEntity } from './entities/user-ranking.entity'
import { ModelRankingEntity } from './entities/model-ranking.entity'
import { AnalysisReportEntity } from '../agent/entities/analysis-report.entity'
import { RankingService } from './ranking.service'
import { RankingController } from './ranking.controller'

// 榜单排行模块 - 权重模型管理、用户预测准确率排行、大模型排行
@Module({
  imports: [TypeOrmModule.forFeature([WeightModelEntity, UserRankingEntity, ModelRankingEntity, AnalysisReportEntity])],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
