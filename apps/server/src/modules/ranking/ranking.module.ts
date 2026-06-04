import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WeightModelEntity } from './entities/weight-model.entity'
import { RankingService } from './ranking.service'
import { RankingController } from './ranking.controller'

// 榜单排行模块 - 权重模型管理、用户预测准确率排行
@Module({
  imports: [TypeOrmModule.forFeature([WeightModelEntity])],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
