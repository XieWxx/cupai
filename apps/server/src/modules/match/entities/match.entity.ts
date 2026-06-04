import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { TeamEntity } from './team.entity'

/**
 * 赛事实体
 * 对应 PRD 3.4-3.6 全维度赛事数据
 * 包含赛事基础信息、比分、环境、裁判等
 */
@Entity('matches')
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'league_name', length: 100, comment: '联赛/赛事名称' })
  leagueName: string

  @Column({ length: 50, comment: '赛事阶段' })
  stage: string

  @Column({ name: 'group_name', length: 10, nullable: true, comment: '小组名称（小组赛时使用）' })
  groupName: string

  @Column({ name: 'home_team_id', type: 'uuid', comment: '主队ID' })
  homeTeamId: string

  @Column({ name: 'away_team_id', type: 'uuid', comment: '客队ID' })
  awayTeamId: string

  @Column({ name: 'start_time', type: 'datetime', comment: '开赛时间' })
  startTime: Date

  @Column({ length: 20, default: 'upcoming', comment: '赛事状态: upcoming/live/finished' })
  status: string

  @Column({ name: 'home_score', type: 'int', nullable: true, comment: '主队比分' })
  homeScore: number

  @Column({ name: 'away_score', type: 'int', nullable: true, comment: '客队比分' })
  awayScore: number

  @Column({ name: 'half_time_home', type: 'int', nullable: true, comment: '半场主队比分' })
  halfTimeHome: number

  @Column({ name: 'half_time_away', type: 'int', nullable: true, comment: '半场客队比分' })
  halfTimeAway: number

  @Column({ length: 100, nullable: true, comment: '比赛场馆' })
  venue: string

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

  @Column({ name: 'match_data', type: 'json', nullable: true, comment: '赛事详细数据(射门/控球/角球等)' })
  matchData: Record<string, unknown>

  @Column({ name: 'data_source', length: 255, nullable: true, comment: '数据来源' })
  dataSource: string

  @Column({ name: 'data_source_url', length: 500, nullable: true, comment: '数据源链接' })
  dataSourceUrl: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 关联主队
  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'home_team_id' })
  homeTeam: TeamEntity

  // 关联客队
  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'away_team_id' })
  awayTeam: TeamEntity
}
