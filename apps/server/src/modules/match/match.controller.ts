import { Controller, Get, Param, Query } from '@nestjs/common'
import { MatchService } from './match.service'
import { StandingService } from './standing.service'

/**
 * 赛事数据控制器
 */
@Controller('match')
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly standingService: StandingService,
  ) {}

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

  // 获取赛事详情
  @Get(':id')
  async getMatchDetail(@Param('id') id: string) {
    return this.matchService.getMatchDetail(id)
  }

  // 获取所有球队
  @Get('teams/all')
  async getTeams() {
    return this.matchService.getTeams()
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

  // 获取小组积分榜
  @Get('standings/:group')
  async getStandings(@Param('group') group: string) {
    return this.standingService.getStandings(group)
  }

  // 获取所有小组积分榜
  @Get('standings')
  async getAllStandings() {
    return this.standingService.getStandings()
  }

  // 获取出线形势分析
  @Get('advance/:group')
  async getAdvanceAnalysis(@Param('group') group: string) {
    return this.standingService.getAdvanceAnalysis(group)
  }
}
