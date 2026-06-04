import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SensitiveWordEntity } from './entities/sensitive-word.entity'
import { RiskService } from './risk.service'
import { RiskController } from './risk.controller'

// 风控模块 - 内容审核、敏感词过滤、博彩词汇屏蔽、AI内容二次审核
@Module({
  imports: [TypeOrmModule.forFeature([SensitiveWordEntity])],
  controllers: [RiskController],
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
