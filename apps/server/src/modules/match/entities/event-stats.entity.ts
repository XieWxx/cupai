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
import { MatchEntity } from './match.entity'

/**
 * 赛事统计实体
 * 主队 / 客队两侧的统计指标（xG、控球率、传球成功率、危险进攻次数等）
 * 复杂嵌套（shotmap / momentum / xg_per_minute）以 JSON 存储到 matchData 字段
 *
 * 同步来源：BSD /api/v2/events/{id}/stats/
 */
@Entity('event_stats')
@Index('idx_stats_match', ['matchId'], { unique: true })
@Index('idx_stats_bs_event', ['bsEventId'], { unique: true })
export class EventStatsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'match_id', type: 'uuid', comment: '本地赛事 ID' })
  matchId: string

  @Column({ name: 'bs_event_id', type: 'int', comment: 'BSD 赛事 ID' })
  bsEventId: number

  // ==================== 主队指标 ====================

  @Column({ name: 'home_total_shots', type: 'int', nullable: true, comment: '主队总射门' })
  homeTotalShots: number

  @Column({ name: 'home_shots_on_target', type: 'int', nullable: true, comment: '主队射正' })
  homeShotsOnTarget: number

  @Column({ name: 'home_possession', type: 'int', nullable: true, comment: '主队控球率 %' })
  homePossession: number

  @Column({ name: 'home_passes', type: 'int', nullable: true, comment: '主队传球数' })
  homePasses: number

  @Column({ name: 'home_pass_accuracy', type: 'float', nullable: true, comment: '主队传球成功率 %' })
  homePassAccuracy: number

  @Column({ name: 'home_corners', type: 'int', nullable: true, comment: '主队角球' })
  homeCorners: number

  @Column({ name: 'home_fouls', type: 'int', nullable: true, comment: '主队犯规' })
  homeFouls: number

  @Column({ name: 'home_xg', type: 'float', nullable: true, comment: '主队预期进球 xG' })
  homeXg: number

  // ==================== 客队指标 ====================

  @Column({ name: 'away_total_shots', type: 'int', nullable: true, comment: '客队总射门' })
  awayTotalShots: number

  @Column({ name: 'away_shots_on_target', type: 'int', nullable: true, comment: '客队射正' })
  awayShotsOnTarget: number

  @Column({ name: 'away_possession', type: 'int', nullable: true, comment: '客队控球率 %' })
  awayPossession: number

  @Column({ name: 'away_passes', type: 'int', nullable: true, comment: '客队传球数' })
  awayPasses: number

  @Column({ name: 'away_pass_accuracy', type: 'float', nullable: true, comment: '客队传球成功率 %' })
  awayPassAccuracy: number

  @Column({ name: 'away_corners', type: 'int', nullable: true, comment: '客队角球' })
  awayCorners: number

  @Column({ name: 'away_fouls', type: 'int', nullable: true, comment: '客队犯规' })
  awayFouls: number

  @Column({ name: 'away_xg', type: 'float', nullable: true, comment: '客队预期进球 xG' })
  awayXg: number

  // ==================== 复杂数据 ====================

  /** 完整 stats 原始数据（含 BSD 全部字段） */
  @Column({ type: 'json', nullable: true, comment: '完整统计 JSON' })
  stats: Record<string, unknown>

  /** 射门点位图 */
  @Column({ type: 'json', nullable: true, comment: '射门点位图' })
  shotmap: Record<string, unknown>[]

  /** 比赛压力指数（每分钟） */
  @Column({ type: 'json', nullable: true, comment: 'momentum 每分钟压力' })
  momentum: Record<string, unknown>[]

  /** 球员平均位置 */
  @Column({ name: 'average_positions', type: 'json', nullable: true, comment: '球员平均位置' })
  averagePositions: Record<string, unknown>

  /** 每分钟 xG 累积 */
  @Column({ name: 'xg_per_minute', type: 'json', nullable: true, comment: '每分钟 xG' })
  xgPerMinute: Record<string, unknown>[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => MatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: MatchEntity
}
