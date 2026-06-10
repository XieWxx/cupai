import { Injectable } from '@nestjs/common'
import { BsdcService } from './bsd.service'
import { BsEvent, BsLeague, BsTeam, BsOdds, BsBestOdds, BsPrediction, BsStanding, BsIncidents, BsLineups, BsStats, BsEventDetail, BsPaginated, BsLiveEventsResponse, BsVenueDetail, BsRefereeDetail, BsPlayer, BsPlayerStats, BsEventPlayerStats, BsH2H, BsEventMetadata, BsOddsComparison, BsSocial, BsBroadcast, BsBookmaker, BsLeagueSeasons, BsPlayerTransfer } from './bsd.interfaces'

/**
 * BSD 业务服务 — 将 BSD API 数据映射为 CupAI 业务层使用的格式
 */
@Injectable()
export class BsdcBusinessService {
  constructor(private readonly bsdc: BsdcService) {}

  // ==================== 赛事相关 ====================

  /** 获取赛事列表（支持日期/联赛/状态筛选） */
  async getEvents(params?: {
    date_from?: string
    date_to?: string
    league_id?: number
    team_id?: number
    status?: string
    limit?: number
    offset?: number
  }): Promise<BsPaginated<BsEvent>> {
    return this.bsdc.get<BsPaginated<BsEvent>>('/api/events/', params)
  }

  /** 获取直播窗口赛事（high-frequency polling 用） */
  async getLiveEvents(params?: { league_id?: number; season_id?: number; team_id?: number }): Promise<BsLiveEventsResponse> {
    // 注意：实时接口在 v2 路径下，响应结构为 { count, events[] }，不是分页结构
    return this.bsdc.get<BsLiveEventsResponse>('/api/v2/events/live/', params)
  }

  /** 获取赛事详情 */
  async getEventDetail(eventId: number): Promise<BsEventDetail> {
    return this.bsdc.get<BsEventDetail>(`/api/events/${eventId}/`)
  }

  /** 获取赛事统计数据 */
  async getEventStats(eventId: number): Promise<BsStats> {
    return this.bsdc.get<BsStats>(`/api/events/${eventId}/stats/`)
  }

  /** 获取赛事事件（进球、红黄牌等） */
  async getEventIncidents(eventId: number): Promise<BsIncidents> {
    return this.bsdc.get<BsIncidents>(`/api/events/${eventId}/incidents/`)
  }

  /** 获取赛事阵容 */
  async getEventLineups(eventId: number): Promise<BsLineups> {
    return this.bsdc.get<BsLineups>(`/api/events/${eventId}/lineups/`)
  }

  /** 获取赛事赔率 */
  async getEventOdds(eventId: number): Promise<BsOdds> {
    return this.bsdc.get<BsOdds>(`/api/events/${eventId}/odds/`)
  }

  /** 获取赛事预测 */
  async getEventPredictions(eventId: number): Promise<BsPaginated<BsPrediction>> {
    return this.bsdc.get<BsPaginated<BsPrediction>>(`/api/events/${eventId}/predictions/`)
  }

  // ==================== 联赛相关 ====================

  /** 获取所有联赛（v2：包含 is_active / is_current_season 字段） */
  async getLeagues(params?: { limit?: number; offset?: number; league_id?: number }): Promise<BsPaginated<BsLeague>> {
    return this.bsdc.get<BsPaginated<BsLeague>>('/api/v2/leagues/', params)
  }

  /** 获取所有活跃联赛（全量） */
  async getAllActiveLeagues(): Promise<BsLeague[]> {
    return this.bsdc.getAll<BsLeague>('/api/v2/leagues/', { limit: 200 })
  }

  /** 获取联赛详情 */
  async getLeagueDetail(leagueId: number) {
    return this.bsdc.get<unknown>(`/api/leagues/${leagueId}/`)
  }

  /** 获取联赛积分榜 */
  async getLeagueStandings(leagueId: number, seasonId?: number): Promise<BsStanding> {
    return this.bsdc.get<BsStanding>(`/api/leagues/${leagueId}/standings/`, seasonId ? { season_id: String(seasonId) } : undefined)
  }

  // ==================== 球队相关 ====================

  /** 获取所有球队 */
  async getTeams(params?: { limit?: number; offset?: number; page?: number }): Promise<BsPaginated<BsTeam>> {
    return this.bsdc.get<BsPaginated<BsTeam>>('/api/teams/', params)
  }

  /** 获取球队详情 */
  async getTeamDetail(teamId: number) {
    return this.bsdc.get<unknown>(`/api/teams/${teamId}/`)
  }

  // ==================== 赔率相关 ====================

  /** 获取最佳赔率（所有即将开始的比赛） */
  async getBestOdds(params?: { limit?: number; offset?: number }): Promise<BsPaginated<BsBestOdds>> {
    return this.bsdc.get<BsPaginated<BsBestOdds>>('/api/odds/best/', params)
  }

  /** 获取赔率列表 */
  async getOdds(params?: { event_id?: number; limit?: number; offset?: number }): Promise<BsPaginated<unknown>> {
    return this.bsdc.get<BsPaginated<unknown>>('/api/odds/', params)
  }

  // ==================== 预测相关 ====================

  /** 获取预测列表 */
  async getPredictions(params?: { event_id?: number; limit?: number; offset?: number }): Promise<BsPaginated<BsPrediction>> {
    return this.bsdc.get<BsPaginated<BsPrediction>>('/api/predictions/', params)
  }

  /** 获取单场预测详情 */
  async getPredictionDetail(predictionId: number) {
    return this.bsdc.get<unknown>(`/api/predictions/${predictionId}/`)
  }

  // ==================== 场馆相关 ====================

  /** 获取场馆详情（v2） */
  async getVenueDetail(venueId: number): Promise<BsVenueDetail> {
    return this.bsdc.get<BsVenueDetail>(`/api/v2/venues/${venueId}/`)
  }

  /** 获取场馆列表 */
  async getVenues(params?: { limit?: number; offset?: number }): Promise<BsPaginated<BsVenueDetail>> {
    return this.bsdc.get<BsPaginated<BsVenueDetail>>('/api/v2/venues/', params)
  }

  /** 获取裁判详情（v2） */
  async getRefereeDetail(refereeId: number): Promise<BsRefereeDetail> {
    return this.bsdc.get<BsRefereeDetail>(`/api/v2/referees/${refereeId}/`)
  }

  // ==================== 球员相关 ====================

  /** 获取球员列表 */
  async getPlayers(params?: {
    limit?: number
    offset?: number
    name?: string
    national_team_id?: number
    team_id?: number
    nationality?: string
    position?: string
  }): Promise<BsPaginated<BsPlayer>> {
    return this.bsdc.get<BsPaginated<BsPlayer>>('/api/players/', params)
  }

  /** 获取球员详情 */
  async getPlayerDetail(playerId: number): Promise<BsPlayer> {
    return this.bsdc.get<BsPlayer>(`/api/players/${playerId}/`)
  }

  /** 获取球员赛季统计（逐场） */
  async getPlayerStats(playerId: number): Promise<BsPaginated<BsPlayerStats>> {
    return this.bsdc.get<BsPaginated<BsPlayerStats>>(`/api/players/${playerId}/stats/`)
  }

  /** 获取球员转会记录 */
  async getPlayerTransfers(playerId: number): Promise<BsPlayerTransfer> {
    return this.bsdc.get<BsPlayerTransfer>(`/api/players/${playerId}/transfers/`)
  }

  /** 获取单场球员统计 */
  async getEventPlayerStats(eventId: number): Promise<BsEventPlayerStats> {
    return this.bsdc.get<BsEventPlayerStats>(`/api/events/${eventId}/player-stats/`)
  }

  // ==================== 交锋记录 ====================

  /** 获取交锋记录 */
  async getEventH2H(eventId: number): Promise<BsH2H> {
    return this.bsdc.get<BsH2H>(`/api/events/${eventId}/h2h/`)
  }

  // ==================== 赛事元数据 ====================

  /** 获取赛事元数据（球衣颜色+趣味事实+AI预览） */
  async getEventMetadata(eventId: number): Promise<BsEventMetadata> {
    return this.bsdc.get<BsEventMetadata>(`/api/events/${eventId}/metadata/`)
  }

  // ==================== 赔率对比 ====================

  /** 获取博彩公司赔率对比 */
  async getOddsComparison(eventId: number): Promise<BsOddsComparison> {
    return this.bsdc.get<BsOddsComparison>(`/api/events/${eventId}/odds/comparison/`)
  }

  // ==================== 社交媒体 ====================

  /** 获取赛事社交媒体内容 */
  async getEventSocial(eventId: number, params?: { limit?: number; offset?: number; type?: string }): Promise<BsSocial> {
    return this.bsdc.get<BsSocial>(`/api/events/${eventId}/social/`, params)
  }

  // ==================== 转播信息 ====================

  /** 获取赛事转播信息 */
  async getEventBroadcasts(eventId: number, params?: { country_code?: string; limit?: number; offset?: number }): Promise<BsPaginated<BsBroadcast>> {
    return this.bsdc.get<BsPaginated<BsBroadcast>>(`/api/events/${eventId}/broadcasts/`, params)
  }

  // ==================== 博彩公司 ====================

  /** 获取博彩公司列表 */
  async getBookmakers(): Promise<BsPaginated<BsBookmaker>> {
    return this.bsdc.get<BsPaginated<BsBookmaker>>('/api/bookmakers/')
  }

  // ==================== 联赛赛季 ====================

  /** 获取联赛赛季列表 */
  async getLeagueSeasons(leagueId: number): Promise<BsLeagueSeasons> {
    return this.bsdc.get<BsLeagueSeasons>(`/api/leagues/${leagueId}/seasons/`)
  }
}
