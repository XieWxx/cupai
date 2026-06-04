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
 * 自定义权重模型实体
 * 对应 PRD 10.3 自定义权重模型表
 * 8大因子权重，总和强制=100%
 */
@Entity('weight_models')
export class WeightModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid', comment: '用户ID' })
  userId: string

  @Column({ length: 50, comment: '模型名称' })
  name: string

  @Column({ name: 'historical_record', type: 'decimal', precision: 5, scale: 2, default: 18, comment: '历史战绩权重' })
  historicalRecord: number

  @Column({ name: 'team_strength', type: 'decimal', precision: 5, scale: 2, default: 18, comment: '球队实力权重' })
  teamStrength: number

  @Column({ name: 'player_status', type: 'decimal', precision: 5, scale: 2, default: 14, comment: '球星状态权重' })
  playerStatus: number

  @Column({ name: 'realtime_dynamic', type: 'decimal', precision: 5, scale: 2, default: 12, comment: '实时动态权重' })
  realtimeDynamic: number

  @Column({ name: 'environment', type: 'decimal', precision: 5, scale: 2, default: 10, comment: '临场环境权重' })
  environment: number

  @Column({ name: 'tactical_counter', type: 'decimal', precision: 5, scale: 2, default: 5, comment: '战术克制权重' })
  tacticalCounter: number

  @Column({ name: 'social_sentiment', type: 'decimal', precision: 5, scale: 2, default: 8, comment: '社交舆情权重' })
  socialSentiment: number

  @Column({ name: 'hidden_factors', type: 'decimal', precision: 5, scale: 2, default: 15, comment: '隐性赛事因子权重' })
  hiddenFactors: number

  @Column({ name: 'is_default', default: false, comment: '是否为默认模型' })
  isDefault: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 关联用户
  @ManyToOne(() => UserEntity, (user) => user.weightModels)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
