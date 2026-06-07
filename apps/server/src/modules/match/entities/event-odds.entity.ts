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
 * 赛事赔率实体
 * 1X2 + Over/Under + BTTS 三个市场
 *
 * 同步来源：BSD /api/v2/events/{id}/odds/
 * 同步策略：每 5min 同步一次进行中或即将开始的比赛赔率
 */
@Entity('event_odds')
@Index('idx_odds_match', ['matchId'])
@Index('idx_odds_bs_event', ['bsEventId'])
export class EventOddsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'match_id', type: 'uuid', comment: '本地赛事 ID' })
  matchId: string

  @Column({ name: 'bs_event_id', type: 'int', comment: 'BSD 赛事 ID' })
  bsEventId: number

  // ==================== 1X2 ====================

  @Column({ name: 'home_win', type: 'float', nullable: true, comment: '主胜赔率' })
  homeWin: number

  @Column({ name: 'draw', type: 'float', nullable: true, comment: '平局赔率' })
  draw: number

  @Column({ name: 'away_win', type: 'float', nullable: true, comment: '客胜赔率' })
  awayWin: number

  // ==================== Over/Under ====================

  @Column({ name: 'over_15_goals', type: 'float', nullable: true, comment: '大 1.5 球' })
  over15Goals: number

  @Column({ name: 'over_25_goals', type: 'float', nullable: true, comment: '大 2.5 球' })
  over25Goals: number

  @Column({ name: 'over_35_goals', type: 'float', nullable: true, comment: '大 3.5 球' })
  over35Goals: number

  @Column({ name: 'under_15_goals', type: 'float', nullable: true, comment: '小 1.5 球' })
  under15Goals: number

  @Column({ name: 'under_25_goals', type: 'float', nullable: true, comment: '小 2.5 球' })
  under25Goals: number

  @Column({ name: 'under_35_goals', type: 'float', nullable: true, comment: '小 3.5 球' })
  under35Goals: number

  // ==================== BTTS ====================

  @Column({ name: 'btts_yes', type: 'float', nullable: true, comment: '两队都进球 是' })
  bttsYes: number

  @Column({ name: 'btts_no', type: 'float', nullable: true, comment: '两队都进球 否' })
  bttsNo: number

  /** BSD 赔率更新时间（用于前端显示赔率时效） */
  @Column({ name: 'bs_updated_at', type: 'datetime', nullable: true, comment: 'BSD 赔率更新时间' })
  bsUpdatedAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => MatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: MatchEntity
}
