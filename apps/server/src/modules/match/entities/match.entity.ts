import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { TeamEntity } from './team.entity'

/**
 * 赛事实体
 * 对应 PRD 3.4-3.6 全维度赛事数据
 * 包含赛事基础信息、比分、环境、裁判等
 *
 * 同步来源：BSD SportsData v2
 * 同步频率：live 10s / 列表 5min（见 bsd-sync.scheduler.ts）
 */
@Entity('matches')
@Index('idx_matches_status_start', ['status', 'startTime'])
@Index('idx_matches_league_season', ['leagueId', 'seasonId'])
@Index('idx_matches_data_source', ['dataSource'])
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // ==================== 基础信息 ====================

  /** BSD 联赛 ID（用于跨表关联与回查 BSD） */
  @Column({ name: 'league_id', type: 'int', nullable: true, comment: 'BSD 联赛 ID' })
  leagueId: number

  /** BSD 赛季 ID */
  @Column({ name: 'season_id', type: 'int', nullable: true, comment: 'BSD 赛季 ID' })
  seasonId: number

  @Column({ name: 'league_name', length: 100, comment: '联赛/赛事名称' })
  leagueName: string

  /** 标准化阶段：group / round16 / quarter / semi / final / league */
  @Column({ length: 50, comment: '赛事阶段' })
  stage: string

  @Column({ name: 'group_name', length: 10, nullable: true, comment: '小组名称（小组赛时使用）' })
  groupName: string

  /** BSD 原始 round_name（如 "Group A"、"Quarter-finals"） */
  @Column({ name: 'round_name', length: 100, nullable: true, comment: 'BSD 原始阶段名' })
  roundName: string

  /** BSD round_number（轮次序号） */
  @Column({ name: 'round_number', type: 'int', nullable: true, comment: '轮次序号' })
  roundNumber: number

  // ==================== 球队 ====================

  @Column({ name: 'home_team_id', type: 'uuid', comment: '主队ID' })
  homeTeamId: string

  @Column({ name: 'away_team_id', type: 'uuid', comment: '客队ID' })
  awayTeamId: string

  @Column({ name: 'home_team_bsd_id', type: 'int', nullable: true, comment: 'BSD 主队 ID' })
  homeTeamBsdId: number

  @Column({ name: 'away_team_bsd_id', type: 'int', nullable: true, comment: 'BSD 客队 ID' })
  awayTeamBsdId: number

  // ==================== 时间/状态 ====================

  @Column({ name: 'start_time', type: 'datetime', comment: '开赛时间' })
  startTime: Date

  /** 标准化状态：upcoming / live / finished */
  @Column({ length: 20, default: 'upcoming', comment: '赛事状态: upcoming/live/finished' })
  status: string

  /** BSD 原始状态：notstarted / inprogress / finished / postponed / cancelled */
  @Column({ name: 'bs_status', length: 20, nullable: true, comment: 'BSD 原始状态' })
  bsStatus: string

  /** 比赛时段：1T / HT / 2T / FT / ET / PEN */
  @Column({ length: 10, nullable: true, comment: '比赛时段' })
  period: string

  /** 当前比赛分钟（进行中时） */
  @Column({ name: 'current_minute', type: 'int', nullable: true, comment: '当前分钟' })
  currentMinute: number

  // ==================== 比分 ====================

  @Column({ name: 'home_score', type: 'int', nullable: true, comment: '主队比分' })
  homeScore: number

  @Column({ name: 'away_score', type: 'int', nullable: true, comment: '客队比分' })
  awayScore: number

  @Column({ name: 'half_time_home', type: 'int', nullable: true, comment: '半场主队比分' })
  halfTimeHome: number

  @Column({ name: 'half_time_away', type: 'int', nullable: true, comment: '半场客队比分' })
  halfTimeAway: number

  /** 点球大战比分 JSON：`{home: number, away: number}` */
  @Column({ name: 'penalty_shootout', type: 'json', nullable: true, comment: '点球大战比分' })
  penaltyShootout: { home: number; away: number } | null

  // ==================== 元数据 ====================

  @Column({ length: 100, nullable: true, comment: '比赛场馆' })
  venue: string

  @Column({ length: 100, nullable: true, comment: '所在城市' })
  city: string

  @Column({ name: 'venue_id', type: 'int', nullable: true, comment: 'BSD 场馆 ID' })
  venueId: number

  @Column({ name: 'home_coach_id', type: 'int', nullable: true, comment: 'BSD 主教练 ID' })
  homeCoachId: number

  @Column({ name: 'away_coach_id', type: 'int', nullable: true, comment: 'BSD 客教练 ID' })
  awayCoachId: number

  @Column({ name: 'referee_id', type: 'int', nullable: true, comment: 'BSD 主裁 ID' })
  refereeId: number

  @Column({ name: 'referee_name', length: 100, nullable: true, comment: '主裁姓名' })
  refereeName: string

  @Column({ name: 'referee_nationality', length: 50, nullable: true, comment: '主裁国籍' })
  refereeNationality: string

  @Column({ name: 'referee_style', length: 50, nullable: true, comment: '裁判风格' })
  refereeStyle: string

  @Column({ name: 'temperature', type: 'decimal', precision: 5, scale: 1, nullable: true, comment: '温度(℃)' })
  temperature: number

  @Column({ name: 'humidity', type: 'decimal', precision: 5, scale: 1, nullable: true, comment: '湿度(%)' })
  humidity: number

  @Column({ length: 50, nullable: true, comment: '天气状况' })
  weatherCondition: string

  @Column({ name: 'wind_speed', type: 'decimal', precision: 5, scale: 1, nullable: true, comment: '风速(km/h)' })
  windSpeed: number

  @Column({ name: 'home_attendance', type: 'int', nullable: true, comment: '主队球迷人数' })
  homeAttendance: number

  @Column({ name: 'away_attendance', type: 'int', nullable: true, comment: '客队球迷人数' })
  awayAttendance: number

  @Column({ name: 'total_attendance', type: 'int', nullable: true, comment: '总观众人数' })
  totalAttendance: number

  /** 是否同城德比 */
  @Column({ name: 'is_local_derby', type: 'boolean', default: false, comment: '是否德比' })
  isLocalDerby: boolean

  /** 是否中立场 */
  @Column({ name: 'is_neutral_ground', type: 'boolean', default: false, comment: '是否中立场' })
  isNeutralGround: boolean

  /** BSD 是否提供 WebSocket 实时推送（用于前端按需订阅） */
  @Column({ name: 'live_websocket', type: 'boolean', default: false, comment: '是否支持 WebSocket 推送' })
  liveWebsocket: boolean

  @Column({ name: 'match_data', type: 'json', nullable: true, comment: '赛事详细数据(射门/控球/角球等)' })
  matchData: Record<string, unknown>

  // ==================== 数据来源 ====================

  @Column({ name: 'data_source', length: 255, nullable: true, comment: '数据来源唯一标识 (如 bsd_12345)' })
  dataSource: string

  @Column({ name: 'data_source_url', length: 500, nullable: true, comment: '数据源链接' })
  dataSourceUrl: string

  /** 最近一次同步时间（用于监控 10s 同步是否健康） */
  @Column({ name: 'last_synced_at', type: 'datetime', nullable: true, comment: '最近一次 BSD 同步时间' })
  lastSyncedAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // ==================== 关联 ====================

  // 关联主队
  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'home_team_id' })
  homeTeam: TeamEntity

  // 关联客队
  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'away_team_id' })
  awayTeam: TeamEntity
}
