import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { UserEntity } from '../../user/entities/user.entity'

/**
 * 用户排行实体
 * 记录用户的预测准确率和积分
 * 赛事完赛后自动结算更新
 */
@Entity('user_rankings')
export class UserRankingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid', unique: true, comment: '用户ID' })
  userId: string

  /** 总预测次数 */
  @Column({ name: 'total_predictions', type: 'int', default: 0, comment: '总预测次数' })
  totalPredictions: number

  /** 精准匹配次数（预测比分完全正确） */
  @Column({ name: 'exact_matches', type: 'int', default: 0, comment: '精准匹配次数' })
  exactMatches: number

  /** 基本匹配次数（预测胜负正确） */
  @Column({ name: 'basic_matches', type: 'int', default: 0, comment: '基本匹配次数' })
  basicMatches: number

  /** 偏差次数（预测方向正确但比分差距大） */
  @Column({ name: 'deviations', type: 'int', default: 0, comment: '偏差次数' })
  deviations: number

  /** 完全偏差次数（预测方向错误） */
  @Column({ name: 'total_misses', type: 'int', default: 0, comment: '完全偏差次数' })
  totalMisses: number

  /** 总积分（精准10+基本6+偏差2+完全0） */
  @Column({ name: 'total_score', type: 'int', default: 0, comment: '总积分' })
  totalScore: number

  /** 准确率（百分比） */
  @Column({ name: 'accuracy_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '准确率(%)' })
  accuracyRate: number

  /** 最近使用的模型名称（Agent 回调时更新） */
  @Column({ name: 'last_model', length: 100, nullable: true, comment: '最近使用的模型' })
  lastModel: string

  /** 最近使用的 Agent 平台（Agent 回调时更新） */
  @Column({ name: 'last_platform', length: 100, nullable: true, comment: '最近使用的Agent平台' })
  lastPlatform: string

  /** 赛季ID（用于区分不同赛季排行） */
  @Column({ name: 'season_id', length: 50, nullable: true, comment: '赛季ID' })
  seasonId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 关联用户
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
