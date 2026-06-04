import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { UserEntity } from '../../user/entities/user.entity'
import { AnalysisReportEntity } from '../../agent/entities/analysis-report.entity'

/**
 * 互动记录实体（点赞/收藏）
 * 统一管理点赞和收藏行为，通过 type 字段区分
 */
@Entity('interactions')
export class InteractionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid', comment: '操作者用户ID' })
  userId: string

  @Column({ name: 'report_id', type: 'uuid', comment: '分析报告ID' })
  reportId: string

  /** 互动类型: like(点赞) / collect(收藏) */
  @Column({ length: 20, comment: '互动类型: like/collect' })
  type: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  // 关联用户
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  // 关联报告
  @ManyToOne(() => AnalysisReportEntity)
  @JoinColumn({ name: 'report_id' })
  report: AnalysisReportEntity
}
