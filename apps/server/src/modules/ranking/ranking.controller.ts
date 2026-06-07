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
  // 支持参数：
  //   - seasonId: 赛季筛选
  //   - page / pageSize: 分页（兼容旧调用）
  //   - sort: total（总准确率）/ exact（精准比分命中率）/ funny（趣味数据命中率）
  //   - limit: 限制返回条数（首页摘要用，与 page/pageSize 互斥，limit 优先）
  @Get('users')
  async getUserRankings(
    @Query('seasonId') seasonId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rankingService.getUserRankings(
      seasonId,
      Number(page) || 1,
      Number(pageSize) || 20,
      sort,
      limit ? Number(limit) : undefined,
    )
  }

  // 大模型准确率排行
  // 支持参数：
  //   - seasonId: 赛季筛选
  //   - page / pageSize: 分页
  //   - limit: 限制返回条数（首页摘要用）
  @Get('models')
  async getModelRankings(
    @Query('seasonId') seasonId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rankingService.getModelRankings(
      seasonId,
      Number(page) || 1,
      Number(pageSize) || 20,
      limit ? Number(limit) : undefined,
    )
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
   * 热门 Agent 平台排行（首页摘要用）
   * GET /ranking/platforms
   *
   * 数据来源：聚合 user_ai_configs.apiEndpoint，按域名归一化后按用户数降序
   * 返回结构：{ list: [{ platform, platformKey, userCount, totalPredictions }] }
   */
  @Get('platforms')
  async getPlatformRankings(@Query('limit') limit?: string) {
    return this.rankingService.getPlatformRankings(limit ? Number(limit) : undefined)
  }

  /**
   * 获取热门 AI 平台排行
   * GET /ranking/platforms/top
   * 复用 getPlatformRankings 逻辑，默认返回 TOP 6
   */
  @Get('platforms/top')
  async getTopPlatforms(@Query('limit') limit?: string) {
    return this.rankingService.getPlatformRankings(limit ? Number(limit) : 6)
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
