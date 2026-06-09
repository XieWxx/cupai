import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common'
import { MatchService } from './match.service'
import { StandingService } from './standing.service'
import { BsdcBusinessService } from '../bsd/bsd.business.service'

/**
 * 赛事数据控制器
 */
@Controller(['match', 'matches'])
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly standingService: StandingService,
    private readonly bsdService: BsdcBusinessService,
  ) {}

  // 首页"赛事动态"：进行中 + 24h 内即将开始
  @Get('dynamics')
  async getDynamics(@Query('limit') limit?: string) {
    return this.matchService.getMatchDynamics(Number(limit) || 6)
  }

  // 获取淘汰赛对阵图数据（按 bracketStage 分组，默认仅世界杯）
  @Get('bracket')
  async getBracketData(@Query('leagueId') leagueId?: string) {
    const parsedLeagueId = leagueId ? parseInt(leagueId, 10) || undefined : undefined
    return this.matchService.getBracketData(parsedLeagueId)
  }

  // 获取所有球队
  @Get('teams/all')
  async getTeams() {
    return this.matchService.getTeams()
  }

  // 获取所有小组积分榜
  @Get('standings')
  async getAllStandings(@Query('leagueId') leagueId?: string) {
    const parsedLeagueId = leagueId ? parseInt(leagueId, 10) || undefined : undefined
    return this.standingService.getStandings(undefined, parsedLeagueId)
  }

  // 获取小组积分榜
  @Get('standings/:group')
  async getStandings(@Param('group') group: string, @Query('leagueId') leagueId?: string) {
    const parsedLeagueId = leagueId ? parseInt(leagueId, 10) || undefined : undefined
    return this.standingService.getStandings(group, parsedLeagueId)
  }

  // 获取出线形势分析
  @Get('advance/:group')
  async getAdvanceAnalysis(@Param('group') group: string) {
    return this.standingService.getAdvanceAnalysis(group)
  }

  // 获取赛事列表
  @Get()
  async getMatches(
    @Query('status') status?: string,
    @Query('stage') stage?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.matchService.getMatches(status, stage, Number(page) || 1, Number(pageSize) || 20)
  }

  // ==================== 赛事扩展数据 ====================

  /** 获取赛事交锋记录 */
  @Get(':id/h2h')
  async getH2H(@Param('id') id: string) {
    const match = await this.matchService.getMatchDetail(id)
    if (!match) throw new NotFoundException('Match not found')
    return match.h2hData || null
  }

  /** 获取赛事元数据（球衣颜色+趣味事实+AI预览） */
  @Get(':id/metadata')
  async getMetadata(@Param('id') id: string) {
    const match = await this.matchService.getMatchDetail(id)
    if (!match) throw new NotFoundException('Match not found')
    return match.metadata || null
  }

  /** 获取赛事球员统计 */
  @Get(':id/player-stats')
  async getPlayerStats(@Param('id') id: string) {
    const match = await this.matchService.getMatchDetail(id)
    if (!match) throw new NotFoundException('Match not found')
    return match.playerStatsData || null
  }

  /** 获取赛事赔率对比 */
  @Get(':id/odds-comparison')
  async getOddsComparison(@Param('id') id: string) {
    const match = await this.matchService.getMatchDetail(id)
    if (!match) throw new NotFoundException('Match not found')
    return match.oddsComparison || null
  }

  /** 获取赛事社交媒体内容 */
  @Get(':id/social')
  async getSocial(@Param('id') id: string) {
    const match = await this.matchService.getMatchDetail(id)
    if (!match) throw new NotFoundException('Match not found')
    return match.socialData || null
  }

  /** 获取比赛精彩集锦 */
  @Get(':id/highlights')
  async getHighlights(@Param('id') id: string) {
    const match = await this.matchService.getMatchDetail(id)
    if (!match) throw new NotFoundException('Match not found')
    return match.highlights || []
  }

  // 获取赛事详情（必须在所有固定路由之后，避免 :id 通配吞掉固定路径）
  @Get(':id')
  async getMatchDetail(@Param('id') id: string) {
    return this.matchService.getMatchDetail(id)
  }

  // 获取赛事预测
  @Get(':id/prediction')
  async getMatchPrediction(@Param('id') id: string) {
    return this.matchService.getMatchPrediction(id)
  }

  // 获取赛事阵容（首发+替补）
  @Get(':id/lineups')
  async getMatchLineups(@Param('id') id: string) {
    return this.matchService.getMatchLineups(id)
  }

  // 获取赛事事件流（进球/红黄牌/换人）
  @Get(':id/incidents')
  async getMatchIncidents(@Param('id') id: string) {
    return this.matchService.getMatchIncidents(id)
  }

  // 获取赛事赔率（1X2 + Over/Under + BTTS）
  @Get(':id/odds')
  async getMatchOdds(@Param('id') id: string) {
    return this.matchService.getMatchOdds(id)
  }

  // 获取球队详情
  @Get('teams/:id')
  async getTeamDetail(@Param('id') id: string) {
    return this.matchService.getTeamDetail(id)
  }

  // 获取球员详情
  @Get('players/:id')
  async getPlayerDetail(@Param('id') id: string) {
    return this.matchService.getPlayerDetail(id)
  }
}
