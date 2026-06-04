import { Controller, Post, Get, Delete, Body, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
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
    const filteredContent = await this.riskService.filterContent(body.content)
    return { original: body.content, filtered: filteredContent }
  }

  // AI 内容二次审核
  @Post('review/ai')
  async reviewAiContent(@Body() body: { content: string }) {
    return this.riskService.reviewAiContent(body.content)
  }

  // 获取自定义敏感词列表（需登录）
  @Get('sensitive-words')
  @UseGuards(AuthGuard('jwt'))
  async getSensitiveWords() {
    return this.riskService.getSensitiveWords()
  }

  // 添加自定义敏感词（需登录）
  @Post('sensitive-words')
  @UseGuards(AuthGuard('jwt'))
  async addSensitiveWord(@Req() req: { user: { id: string } }, @Body() body: { word: string }) {
    return this.riskService.addSensitiveWord(body.word, req.user.id)
  }

  // 移除自定义敏感词（需登录）
  @Delete('sensitive-words')
  @UseGuards(AuthGuard('jwt'))
  async removeSensitiveWord(@Body() body: { word: string }) {
    await this.riskService.removeSensitiveWord(body.word)
    return { success: true }
  }
}
