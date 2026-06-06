import { Injectable } from '@nestjs/common'
import { BsdcService } from './bsd.service'
import { BsEvent, BsLeague, BsTeam, BsOdds, BsBestOdds, BsPrediction, BsStanding, BsIncidents, BsLineups, BsStats, BsEventDetail, BsPaginated } from './bsd.interfaces'

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
    return this.bsdc.get<BsPaginated<BsEvent>>('/events/', params)
  }

  /** 获取直播窗口赛事（high-frequency polling 用） */
  async getLiveEvents(params?: { league_id?: number; season_id?: number; team_id?: number }): Promise<BsPaginated<BsEvent>> {
    return this.bsdc.get<BsPaginated<BsEvent>>('/events/live/', params)
  }

  /** 获取赛事详情 */
  async getEventDetail(eventId: number): Promise<BsEventDetail> {
    return this.bsdc.get<BsEventDetail>(`/events/${eventId}/`)
  }

  /** 获取赛事统计数据 */
  async getEventStats(eventId: number): Promise<BsStats> {
    return this.bsdc.get<BsStats>(`/events/${eventId}/stats/`)
  }

  /** 获取赛事事件（进球、红黄牌等） */
  async getEventIncidents(eventId: number): Promise<BsIncidents> {
    return this.bsdc.get<BsIncidents>(`/events/${eventId}/incidents/`)
  }

  /** 获取赛事阵容 */
  async getEventLineups(eventId: number): Promise<BsLineups> {
    return this.bsdc.get<BsLineups>(`/events/${eventId}/lineups/`)
  }

  /** 获取赛事赔率 */
  async getEventOdds(eventId: number): Promise<BsOdds> {
    return this.bsdc.get<BsOdds>(`/events/${eventId}/odds/`)
  }

  /** 获取赛事预测 */
  async getEventPredictions(eventId: number): Promise<BsPaginated<BsPrediction>> {
    return this.bsdc.get<BsPaginated<BsPrediction>>(`/events/${eventId}/predictions/`)
  }

  // ==================== 联赛相关 ====================

  /** 获取所有联赛 */
  async getLeagues(params?: { limit?: number; offset?: number }): Promise<BsPaginated<BsLeague>> {
    return this.bsdc.get<BsPaginated<BsLeague>>('/leagues/', params)
  }

  /** 获取所有活跃联赛（全量） */
  async getAllActiveLeagues(): Promise<BsLeague[]> {
    return this.bsdc.getAll<BsLeague>('/leagues/', { limit: 200 })
  }

  /** 获取联赛详情 */
  async getLeagueDetail(leagueId: number) {
    return this.bsdc.get<unknown>(`/leagues/${leagueId}/`)
  }

  /** 获取联赛积分榜 */
  async getLeagueStandings(leagueId: number, seasonId?: number): Promise<BsStanding> {
    return this.bsdc.get<BsStanding>(`/leagues/${leagueId}/standings/`, seasonId ? { season_id: String(seasonId) } : undefined)
  }

  // ==================== 球队相关 ====================

  /** 获取所有球队 */
  async getTeams(params?: { limit?: number; offset?: number }): Promise<BsPaginated<BsTeam>> {
    return this.bsdc.get<BsPaginated<BsTeam>>('/teams/', params)
  }

  /** 获取球队详情 */
  async getTeamDetail(teamId: number) {
    return this.bsdc.get<unknown>(`/teams/${teamId}/`)
  }

  // ==================== 赔率相关 ====================

  /** 获取最佳赔率（所有即将开始的比赛） */
  async getBestOdds(params?: { limit?: number; offset?: number }): Promise<BsPaginated<BsBestOdds>> {
    return this.bsdc.get<BsPaginated<BsBestOdds>>('/odds/best/', params)
  }

  /** 获取赔率列表 */
  async getOdds(params?: { event_id?: number; limit?: number; offset?: number }): Promise<BsPaginated<unknown>> {
    return this.bsdc.get<BsPaginated<unknown>>('/odds/', params)
  }

  // ==================== 预测相关 ====================

  /** 获取预测列表 */
  async getPredictions(params?: { event_id?: number; limit?: number; offset?: number }): Promise<BsPaginated<BsPrediction>> {
    return this.bsdc.get<BsPaginated<BsPrediction>>('/predictions/', params)
  }

  /** 获取单场预测详情 */
  async getPredictionDetail(predictionId: number) {
    return this.bsdc.get<unknown>(`/predictions/${predictionId}/`)
  }
}
