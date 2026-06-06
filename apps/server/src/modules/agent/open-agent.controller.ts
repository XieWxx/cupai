import { Controller, Get, Post, Body, Query } from '@nestjs/common'
import { RedisCacheService } from '../../config/redis-cache.service'

/**
 * Agent 公开接口
 * 无需登录即可访问的 Agent 相关 API
 *
 * 路由：/agent/open/*
 */
@Controller('agent/open')
export class OpenAgentController {
  constructor(private readonly redisCache: RedisCacheService) {}

  // ==================== 指令相关 ====================

  /**
   * 获取待办指令清单
   * GET /agent/open/instructions
   */
  @Get('instructions')
  async listInstructions(
    @Query('matchId') matchId?: string,
    @Query('dimKey') dimKey?: string,
    @Query('status') status?: 'pending' | 'archived',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return {
      list: [],
      total: 0,
      page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
      lastRefreshAt: new Date().toISOString(),
    }
  }

  /**
   * 创建指令（内部使用，Agent 初始化时调用）
   * POST /agent/open/instructions
   */
  @Post('instructions')
  async createInstruction(@Body() body: Record<string, unknown>) {
    return { success: true, instruction: body }
  }

  // ==================== 维度报告相关 ====================

  /**
   * 获取某赛事已完成的单维度报告
   * GET /agent/open/dimensions?matchId=xxx&range=24h&pageSize=50
   */
  @Get('dimensions')
  async listDimensions(
    @Query('matchId') matchId: string,
    @Query('range') range?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const cacheKey = `dimensions:${matchId}:${range || 'all'}`
    const cached = await this.redisCache.get<any[]>(cacheKey)
    if (cached) {
      return { list: cached, total: cached.length }
    }

    // 暂无维度报告数据源，返回空列表
    return { list: [], total: 0 }
  }

  /**
   * 提交单维度预测结果（供 Agent 回传）
   * POST /agent/open/dimension/submit
   */
  @Post('dimension/submit')
  async submitDimension(@Body() body: Record<string, unknown>) {
    const cacheKey = `dimensions:${body.matchId}:all`
    const existing = await this.redisCache.get<any[]>(cacheKey) || []
    const entry = {
      id: `dim_${body.dimKey}_${body.matchId}`,
      dimKey: body.dimKey,
      topOption: body.topOption,
      topProbability: body.topProbability,
      distribution: body.distribution,
      summary: body.summary,
      model: body.model,
      updatedAt: new Date().toISOString(),
    }
    const updated = existing.filter((e: any) => e.dimKey !== body.dimKey)
    updated.push(entry)
    await this.redisCache.set(cacheKey, updated, 3600)
    return { success: true, dimension: entry }
  }

  /**
   * 提交分析回答（Agent 完成分析后的回传）
   * POST /agent/open/answer
   */
  @Post('answer')
  async submitAnswer(@Body() body: Record<string, unknown>) {
    return { success: true, answerId: `answer_${Date.now()}` }
  }

  // ==================== 指令交互 ====================

  /**
   * 提交指令交互（点赞/收藏）
   * POST /agent/open/instruction/interaction
   */
  @Post('instruction/interaction')
  async instructionInteraction(@Body() body: Record<string, unknown>) {
    return { success: true, action: body.type }
  }
}

