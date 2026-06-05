import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common'
import { SentimentService } from './sentiment.service'

/**
 * 舆情数据控制器
 * 海外舆情精准识别 API
 */
@Controller('sentiment')
export class SentimentController {
  constructor(private readonly sentimentService: SentimentService) {}

  /**
   * 提交单条舆情数据并自动分析
   */
  @Post('analyze')
  async submitAndAnalyze(
    @Body() body: {
      teamId?: string
      matchId?: string
      sourcePlatform: string
      originalText: string
      language?: string
      region?: string
      publishedAt?: string
      sourceUrl?: string
      author?: string
      engagement?: number
    },
  ) {
    return this.sentimentService.submitAndAnalyze({
      ...body,
      language: body.language as any,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    })
  }

  /**
   * 批量提交舆情数据
   */
  @Post('batch')
  async batchSubmit(
    @Body() body: {
      items: Array<{
        teamId?: string
        matchId?: string
        sourcePlatform: string
        originalText: string
        language?: string
        region?: string
        engagement?: number
      }>
    },
  ) {
    return this.sentimentService.batchSubmit(
      body.items.map((item) => ({ ...item, language: item.language as any })),
    )
  }

  /**
   * 获取球队舆情聚合数据
   */
  @Get('team/:teamId')
  async getTeamSentiment(@Param('teamId') teamId: string) {
    return this.sentimentService.getTeamSentiment(teamId)
  }

  /**
   * 获取赛事舆情聚合数据
   */
  @Get('match/:matchId')
  async getMatchSentiment(@Param('matchId') matchId: string) {
    return this.sentimentService.getMatchSentiment(matchId)
  }

  /**
   * 全局舆情概览
   */
  @Get('overview')
  async getOverview() {
    return this.sentimentService.getOverview()
  }

  /**
   * 舆情时间线
   */
  @Get('timeline')
  async getTimeline(
    @Query('teamId') teamId?: string,
    @Query('matchId') matchId?: string,
    @Query('interval') interval?: 'hour' | 'day',
  ) {
    return this.sentimentService.getTimeline(teamId, matchId, interval || 'hour')
  }
}
