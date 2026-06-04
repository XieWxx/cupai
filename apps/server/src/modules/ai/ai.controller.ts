import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AiService } from './ai.service'
import { CreateAiConfigDto } from './dto/create-ai-config.dto'

/**
 * AI 中转控制器
 */
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // 创建/更新 AI 配置（需登录）
  @Post('config')
  @UseGuards(AuthGuard('jwt'))
  async upsertConfig(@Req() req: { user: { id: string } }, @Body() dto: CreateAiConfigDto) {
    return this.aiService.upsertConfig(req.user.id, dto)
  }

  // 获取用户所有 AI 配置（需登录）
  @Get('config')
  @UseGuards(AuthGuard('jwt'))
  async getConfigs(@Req() req: { user: { id: string } }) {
    return this.aiService.getUserConfigs(req.user.id)
  }

  // 删除 AI 配置（需登录）
  @Delete('config/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteConfig(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.aiService.deleteConfig(req.user.id, id)
  }

  // 测试 API 连通性（需登录，密钥临时传入不存储）
  @Post('test-connection')
  @UseGuards(AuthGuard('jwt'))
  async testConnection(@Body() body: { apiEndpoint: string; apiKey: string }) {
    return this.aiService.testConnection(body.apiEndpoint, body.apiKey)
  }

  // 中转调用 AI（需登录，密钥临时传入）
  @Post('proxy')
  @UseGuards(AuthGuard('jwt'))
  async proxyRequest(@Body() body: { apiEndpoint: string; apiKey: string; payload: Record<string, unknown> }) {
    return this.aiService.proxyAiRequest(body.apiEndpoint, body.apiKey, body.payload)
  }
}
