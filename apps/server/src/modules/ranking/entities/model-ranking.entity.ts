import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * 大模型排行实体
 * 记录各 AI 模型的预测准确率
 */
@Entity('model_rankings')
export class ModelRankingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** 模型名称（如 deepseek、gpt-4o 等） */
  @Column({ name: 'model_name', length: 50, comment: '模型名称' })
  modelName: string

  /** 总预测次数 */
  @Column({ name: 'total_predictions', type: 'int', default: 0, comment: '总预测次数' })
  totalPredictions: number

  /** 精准匹配次数 */
  @Column({ name: 'exact_matches', type: 'int', default: 0, comment: '精准匹配次数' })
  exactMatches: number

  /** 基本匹配次数 */
  @Column({ name: 'basic_matches', type: 'int', default: 0, comment: '基本匹配次数' })
  basicMatches: number

  /** 总积分 */
  @Column({ name: 'total_score', type: 'int', default: 0, comment: '总积分' })
  totalScore: number

  /** 准确率 */
  @Column({ name: 'accuracy_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '准确率(%)' })
  accuracyRate: number

  /** 赛季ID */
  @Column({ name: 'season_id', length: 50, nullable: true, comment: '赛季ID' })
  seasonId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
