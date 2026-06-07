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
 * BSD AI 预测实体
 * 由 BSD SportsData 自带的机器学习模型产出
 * 包含 match_result / expected_goals / over_under / btts / score 五个市场
 *
 * 同步来源：BSD /api/v2/events/{id}/predictions/
 */
@Entity('event_predictions')
@Index('idx_predictions_match', ['matchId'])
@Index('idx_predictions_bs_event', ['bsEventId'])
export class EventPredictionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'match_id', type: 'uuid', comment: '本地赛事 ID' })
  matchId: string

  @Column({ name: 'bs_event_id', type: 'int', comment: 'BSD 赛事 ID' })
  bsEventId: number

  @Column({ name: 'bs_prediction_id', type: 'int', comment: 'BSD 预测记录 ID' })
  bsPredictionId: number

  // ==================== 比赛结果概率 ====================

  @Column({ name: 'prob_home', type: 'float', nullable: true, comment: '主胜概率 0-1' })
  probHome: number

  @Column({ name: 'prob_draw', type: 'float', nullable: true, comment: '平局概率 0-1' })
  probDraw: number

  @Column({ name: 'prob_away', type: 'float', nullable: true, comment: '客胜概率 0-1' })
  probAway: number

  @Column({ length: 10, nullable: true, comment: 'BSD 预测结果: home/draw/away' })
  predicted: string

  // ==================== 预期进球 ====================

  @Column({ name: 'expected_goals_home', type: 'float', nullable: true, comment: '主队预期进球' })
  expectedGoalsHome: number

  @Column({ name: 'expected_goals_away', type: 'float', nullable: true, comment: '客队预期进球' })
  expectedGoalsAway: number

  // ==================== 大小盘 ====================

  @Column({ name: 'prob_over_15', type: 'float', nullable: true, comment: '大 1.5 球概率' })
  probOver15: number

  @Column({ name: 'prob_over_25', type: 'float', nullable: true, comment: '大 2.5 球概率' })
  probOver25: number

  @Column({ name: 'prob_over_35', type: 'float', nullable: true, comment: '大 3.5 球概率' })
  probOver35: number

  // ==================== BTTS ====================

  @Column({ name: 'prob_btts_yes', type: 'float', nullable: true, comment: 'BTTS 概率' })
  probBttsYes: number

  // ==================== 最可能比分 ====================

  @Column({ name: 'most_likely_score', length: 10, nullable: true, comment: '最可能比分' })
  mostLikelyScore: string

  // ==================== 推荐 ====================

  @Column({ length: 10, nullable: true, comment: 'BSD 倾向: home/draw/away' })
  favorite: string

  @Column({ name: 'favorite_prob', type: 'float', nullable: true, comment: '倾向概率' })
  favoriteProb: number

  // ==================== 模型元数据 ====================

  @Column({ length: 50, nullable: true, comment: 'BSD 模型版本' })
  modelVersion: string

  @Column({ type: 'float', nullable: true, comment: '模型置信度 0-1' })
  confidence: number

  @Column({ name: 'recommendations', type: 'json', nullable: true, comment: '完整推荐 JSON' })
  recommendations: Record<string, unknown>

  @Column({ name: 'bs_created_at', type: 'datetime', nullable: true, comment: 'BSD 创建时间' })
  bsCreatedAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => MatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: MatchEntity
}
