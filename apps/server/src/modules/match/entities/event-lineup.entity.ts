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
 * 赛事阵容实体
 * 一行 = 一名球员（首发或替补），通过 is_starter 区分
 *
 * 同步来源：BSD /api/v2/events/{id}/lineups/
 * lineup_status: confirmed / predicted / unavailable
 */
@Entity('event_lineups')
@Index('idx_lineups_match', ['matchId'])
@Index('idx_lineups_player', ['bsPlayerId'])
export class EventLineupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'match_id', type: 'uuid', comment: '本地赛事 ID' })
  matchId: string

  @Column({ name: 'bs_event_id', type: 'int', comment: 'BSD 赛事 ID' })
  bsEventId: number

  /** 主队 home / 客队 away */
  @Column({ length: 10, comment: 'side: home/away' })
  side: string

  /** 是否首发；false=替补 */
  @Column({ name: 'is_starter', type: 'boolean', default: true, comment: '是否首发' })
  isStarter: boolean

  @Column({ name: 'bs_player_id', type: 'int', comment: 'BSD 球员 ID' })
  bsPlayerId: number

  @Column({ name: 'player_name', length: 100, comment: '球员姓名' })
  playerName: string

  @Column({ name: 'short_name', length: 50, nullable: true, comment: '球员简称' })
  shortName: string

  /** 位置 G / D / M / F 等 */
  @Column({ length: 10, nullable: true, comment: '位置' })
  position: string

  @Column({ name: 'jersey_number', type: 'int', nullable: true, comment: '球衣号' })
  jerseyNumber: number

  /** BSD AI 评分 0-1 */
  @Column({ name: 'ai_score', type: 'float', nullable: true, comment: 'AI 评分 0-1' })
  aiScore: number

  /** lineup_status: confirmed / predicted / unavailable */
  @Column({ name: 'lineup_status', length: 20, default: 'predicted', comment: '阵容状态' })
  lineupStatus: string

  /** 阵型（如 4-3-3） */
  @Column({ length: 20, nullable: true, comment: '阵型' })
  formation: string

  /** AI 预测置信度 0-1 */
  @Column({ type: 'float', nullable: true, comment: 'AI 置信度 0-1' })
  confidence: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => MatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: MatchEntity
}
