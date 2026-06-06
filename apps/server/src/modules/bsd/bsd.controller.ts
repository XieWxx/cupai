import { Controller, Get, Post, Param, Query, BadRequestException } from '@nestjs/common'
import { BsdcBusinessService } from './bsd.business.service'

/**
 * BSD 数据控制器
 * 暴露 BSD API 赛事/联赛/球队/赔率/预测等数据
 */
@Controller('bsd')
export class BsdcController {
  constructor(private readonly bsdService: BsdcBusinessService) {}

  // ==================== 赛事 ====================

  @Get('events')
  async getEvents(
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('league_id') league_id?: string,
    @Query('team_id') team_id?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.bsdService.getEvents({
      date_from,
      date_to,
      league_id: league_id ? Number(league_id) : undefined,
      team_id: team_id ? Number(team_id) : undefined,
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    })
  }

  @Get('events/live')
  async getLiveEvents(
    @Query('league_id') league_id?: string,
    @Query('season_id') season_id?: string,
    @Query('team_id') team_id?: string,
  ) {
    return this.bsdService.getLiveEvents({
      league_id: league_id ? Number(league_id) : undefined,
      season_id: season_id ? Number(season_id) : undefined,
      team_id: team_id ? Number(team_id) : undefined,
    })
  }

  @Get('events/:id')
  async getEventDetail(@Param('id') id: string) {
    const eventId = Number(id)
    if (isNaN(eventId)) throw new BadRequestException('Invalid event ID')
    return this.bsdService.getEventDetail(eventId)
  }

  @Get('events/:id/stats')
  async getEventStats(@Param('id') id: string) {
    const eventId = Number(id)
    if (isNaN(eventId)) throw new BadRequestException('Invalid event ID')
    return this.bsdService.getEventStats(eventId)
  }

  @Get('events/:id/incidents')
  async getEventIncidents(@Param('id') id: string) {
    const eventId = Number(id)
    if (isNaN(eventId)) throw new BadRequestException('Invalid event ID')
    return this.bsdService.getEventIncidents(eventId)
  }

  @Get('events/:id/lineups')
  async getEventLineups(@Param('id') id: string) {
    const eventId = Number(id)
    if (isNaN(eventId)) throw new BadRequestException('Invalid event ID')
    return this.bsdService.getEventLineups(eventId)
  }

  @Get('events/:id/odds')
  async getEventOdds(@Param('id') id: string) {
    const eventId = Number(id)
    if (isNaN(eventId)) throw new BadRequestException('Invalid event ID')
    return this.bsdService.getEventOdds(eventId)
  }

  // ==================== 联赛 ====================

  @Get('leagues')
  async getLeagues(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.bsdService.getLeagues({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    })
  }

  @Get('leagues/:id/standings')
  async getLeagueStandings(
    @Param('id') id: string,
    @Query('season_id') season_id?: string,
  ) {
    const leagueId = Number(id)
    if (isNaN(leagueId)) throw new BadRequestException('Invalid league ID')
    return this.bsdService.getLeagueStandings(leagueId, season_id ? Number(season_id) : undefined)
  }

  // ==================== 球队 ====================

  @Get('teams')
  async getTeams(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.bsdService.getTeams({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    })
  }

  @Get('teams/:id')
  async getTeamDetail(@Param('id') id: string) {
    const teamId = Number(id)
    if (isNaN(teamId)) throw new BadRequestException('Invalid team ID')
    return this.bsdService.getTeamDetail(teamId)
  }

  // ==================== 赔率/预测 ====================

  @Get('odds/best')
  async getBestOdds(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.bsdService.getBestOdds({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    })
  }

  @Get('predictions')
  async getPredictions(
    @Query('event_id') event_id?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.bsdService.getPredictions({
      event_id: event_id ? Number(event_id) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    })
  }
}
