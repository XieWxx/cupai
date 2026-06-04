import { Module } from '@nestjs/common'
import { RiskService } from './risk.service'
import { RiskController } from './risk.controller'

// 风控模块 - 内容审核、敏感词过滤、博彩词汇屏蔽、违规处罚
@Module({
  controllers: [RiskController],
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
