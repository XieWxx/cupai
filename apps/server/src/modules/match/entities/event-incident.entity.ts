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
 * 赛事事件流实体
 * 存储进球、红黄牌、换人、VAR 等比赛事件
 *
 * 同步来源：BSD /api/v2/events/{id}/incidents/
 * 同步策略：仅在赛事进行中或结束后 24h 内同步（避免无效请求）
 */
@Entity('event_incidents')
@Index('idx_incidents_match', ['matchId'])
@Index('idx_incidents_minute', ['matchId', 'minute'])
export class EventIncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** 关联的本地赛事 ID */
  @Column({ name: 'match_id', type: 'uuid', comment: '本地赛事 ID' })
  matchId: string

  /** BSD 事件 ID（用于幂等更新） */
  @Column({ name: 'bs_incident_id', type: 'int', unique: true, comment: 'BSD 事件 ID' })
  bsIncidentId: number

  /** BSD event ID（冗余便于反查） */
  @Column({ name: 'bs_event_id', type: 'int', comment: 'BSD 赛事 ID' })
  bsEventId: number

  /** 事件类型：goal / card / substitution / period / injuryTime / varDecision */
  @Column({ length: 30, comment: '事件类型' })
  type: string

  /** 事件子类型：goal→none/penalty/own_goal；card→yellow/red/yellowRed */
  @Column({ length: 30, nullable: true, comment: '子类型' })
  detail: string

  /** 发生分钟 */
  @Column({ type: 'int', comment: '发生分钟' })
  minute: number

  /** 伤停补时分钟 */
  @Column({ name: 'extra_minute', type: 'int', nullable: true, comment: '补时分钟' })
  extraMinute: number

  /** 关联球员（BSD player_id） */
  @Column({ name: 'player_id', type: 'int', nullable: true, comment: 'BSD 球员 ID' })
  playerId: number

  @Column({ name: 'player_name', length: 100, nullable: true, comment: '球员姓名' })
  playerName: string

  /** 助攻球员 */
  @Column({ name: 'assist_player_name', length: 100, nullable: true, comment: '助攻球员' })
  assistPlayerName: string

  /** 换人：换上球员 ID */
  @Column({ name: 'player_in_id', type: 'int', nullable: true, comment: '换上球员 BSD ID' })
  playerInId: number

  @Column({ name: 'player_in_name', length: 100, nullable: true, comment: '换上球员姓名' })
  playerInName: string

  /** 换人：换下球员 ID */
  @Column({ name: 'player_out_id', type: 'int', nullable: true, comment: '换下球员 BSD ID' })
  playerOutId: number

  @Column({ name: 'player_out_name', length: 100, nullable: true, comment: '换下球员姓名' })
  playerOutName: string

  /** 是否主队事件 */
  @Column({ name: 'is_home', type: 'boolean', nullable: true, comment: '是否主队' })
  isHome: boolean

  @Column({ name: 'team_id', type: 'int', nullable: true, comment: 'BSD 球队 ID' })
  teamId: number

  @Column({ length: 100, nullable: true, comment: '球队名' })
  team: string

  /** 事件发生时比分 */
  @Column({ name: 'home_score_at_incident', type: 'int', nullable: true, comment: '主队当时比分' })
  homeScoreAtIncident: number

  @Column({ name: 'away_score_at_incident', type: 'int', nullable: true, comment: '客队当时比分' })
  awayScoreAtIncident: number

  @Column({ length: 500, nullable: true, comment: '备注/原因' })
  reason: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => MatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: MatchEntity
}
