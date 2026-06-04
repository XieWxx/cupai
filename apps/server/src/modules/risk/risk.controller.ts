import { Controller, Post, Body } from '@nestjs/common'
import { RiskService } from './risk.service'

/**
 * 风控控制器
 */
@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  // 内容审核接口
  @Post('review')
  async reviewContent(@Body() body: { content: string }) {
    return this.riskService.reviewContent(body.content)
  }

  // 内容过滤接口
  @Post('filter')
  async filterContent(@Body() body: { content: string }) {
    return {
      original: body.content,
      filtered: this.riskService.filterContent(body.content),
    }
  }
}
