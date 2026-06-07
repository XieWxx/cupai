import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'
import { TeamEntity } from './team.entity'

/**
 * 积分榜实体
 * 记录小组赛积分、净胜球、出线形势
 *
 * 同步来源：BSD /api/v2/leagues/{id}/standings/
 * 注意：BSD standings 是平铺数组，本实体在同步时按 group_name 分组写入
 */
@Entity('group_standings')
@Index('idx_standings_group', ['groupName'])
@Index('idx_standings_league_season', ['leagueId', 'seasonId'])
export class GroupStandingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** BSD 联赛 ID */
  @Column({ name: 'league_id', type: 'int', nullable: true, comment: 'BSD 联赛 ID' })
  leagueId: number

  /** BSD 赛季 ID */
  @Column({ name: 'season_id', type: 'int', nullable: true, comment: 'BSD 赛季 ID' })
  seasonId: number

  /** 小组名称（如 A组、B组） */
  @Column({ name: 'group_name', length: 10, comment: '小组名称' })
  groupName: string

  /** 球队ID */
  @Column({ name: 'team_id', type: 'uuid', comment: '球队ID' })
  teamId: string

  /** 已赛场次 */
  @Column({ name: 'played', type: 'int', default: 0, comment: '已赛场次' })
  played: number

  /** 胜场 */
  @Column({ type: 'int', default: 0, comment: '胜场' })
  wins: number

  /** 平场 */
  @Column({ type: 'int', default: 0, comment: '平场' })
  draws: number

  /** 负场 */
  @Column({ type: 'int', default: 0, comment: '负场' })
  losses: number

  /** 进球数 */
  @Column({ name: 'goals_for', type: 'int', default: 0, comment: '进球数' })
  goalsFor: number

  /** 失球数 */
  @Column({ name: 'goals_against', type: 'int', default: 0, comment: '失球数' })
  goalsAgainst: number

  /** 净胜球 */
  @Column({ name: 'goal_difference', type: 'int', default: 0, comment: '净胜球' })
  goalDifference: number

  /** 积分 */
  @Column({ type: 'int', default: 0, comment: '积分' })
  points: number

  /** 小组排名 */
  @Column({ name: 'rank_position', type: 'int', default: 0, comment: '小组排名' })
  rankPosition: number

  /** 出线概率（0-100，AI 预测） */
  @Column({ name: 'advance_probability', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '出线概率(%)' })
  advanceProbability: number

  /** BSD 预期进球（场均） */
  @Column({ name: 'xgf', type: 'float', nullable: true, comment: '预期进球场均' })
  xgf: number

  /** BSD 预期失球（场均） */
  @Column({ name: 'xga', type: 'float', nullable: true, comment: '预期失球场均' })
  xga: number

  /** BSD 近 5 场战绩字符串（如 WWDLW） */
  @Column({ length: 20, nullable: true, comment: '近 5 场战绩' })
  form: string

  /** BSD 内部 position */
  @Column({ name: 'bs_position', type: 'int', nullable: true, comment: 'BSD 排名' })
  bsPosition: number

  /** 数据来源唯一标识（BSD 同步用） */
  @Column({ name: 'data_source', length: 255, nullable: true, comment: '数据来源唯一标识 (如 bsd_<league>_<season>_<team>)' })
  dataSource: string

  @Column({ name: 'last_synced_at', type: 'datetime', nullable: true, comment: '最近一次同步时间' })
  lastSyncedAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 关联球队
  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity
}
