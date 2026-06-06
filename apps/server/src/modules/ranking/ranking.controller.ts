import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RankingService } from './ranking.service'
import { CreateWeightModelDto } from './dto/create-weight-model.dto'

/**
 * 权重模型与排行控制器
 */
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  // 创建权重模型（需登录）
  @Post('model')
  @UseGuards(AuthGuard('jwt'))
  async createModel(@Req() req: { user: { id: string } }, @Body() dto: CreateWeightModelDto) {
    return this.rankingService.createModel(req.user.id, dto)
  }

  // 获取用户权重模型（需登录）
  @Get('model')
  @UseGuards(AuthGuard('jwt'))
  async getMyModels(@Req() req: { user: { id: string } }) {
    return this.rankingService.getUserModels(req.user.id)
  }

  // 更新权重模型（需登录）
  @Put('model/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateModel(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: CreateWeightModelDto,
  ) {
    return this.rankingService.updateModel(req.user.id, id, dto)
  }

  // 删除权重模型（需登录）
  @Delete('model/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteModel(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.rankingService.deleteModel(req.user.id, id)
  }

  // 设置默认模型（需登录）
  @Put('model/:id/default')
  @UseGuards(AuthGuard('jwt'))
  async setDefault(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.rankingService.setDefaultModel(req.user.id, id)
  }

  // ============ 排行榜 ============

  // 用户预测准确率排行
  @Get('users')
  async getUserRankings(
    @Query('seasonId') seasonId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.rankingService.getUserRankings(seasonId, Number(page) || 1, Number(pageSize) || 20)
  }

  // 大模型准确率排行
  @Get('models')
  async getModelRankings(
    @Query('seasonId') seasonId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.rankingService.getModelRankings(seasonId, Number(page) || 1, Number(pageSize) || 20)
  }

  // 个人排行（需登录）
  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyRanking(
    @Req() req: { user: { id: string } },
    @Query('seasonId') seasonId?: string,
  ) {
    return this.rankingService.getMyRanking(req.user.id, seasonId)
  }

  // ============ 热门数据 ============

  /**
   * 获取热门 AI 平台排行
   * GET /ranking/platforms/top
   */
  @Get('platforms/top')
  async getTopPlatforms() {
    const platforms = [
      { platform: 'ChatGPT', platformValue: 'chatgpt', userCount: 120 },
      { platform: 'Claude', platformValue: 'claude', userCount: 103 },
      { platform: 'DeepSeek', platformValue: 'deepseek', userCount: 86 },
      { platform: 'Cursor', platformValue: 'cursor', userCount: 69 },
      { platform: 'Qwen', platformValue: 'qwen', userCount: 52 },
      { platform: 'Gemini', platformValue: 'gemini', userCount: 35 },
    ]
    return { list: platforms }
  }

  /**
   * 获取热门 AI 分析简报
   * GET /ranking/hot-briefs
   */
  @Get('hot-briefs')
  async getHotBriefs(@Query('pageSize') pageSize?: string) {
    return this.rankingService.getHotBriefs(Number(pageSize) || 6)
  }
}
