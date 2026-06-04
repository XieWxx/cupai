import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { UserEntity } from '../../user/entities/user.entity'
import { WeightModelEntity } from '../../ranking/entities/weight-model.entity'
import { PromptTemplateEntity } from '../../prompt/entities/prompt-template.entity'

/**
 * AI 分析报告实体
 * 对应 PRD 10.4 AI分析报告表
 */
@Entity('analysis_reports')
export class AnalysisReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid', comment: '用户ID（Agent默认系统ID）' })
  userId: string

  @Column({ name: 'match_id', type: 'uuid', comment: '赛事ID' })
  matchId: string

  @Column({ name: 'model_id', type: 'uuid', nullable: true, comment: '所用权重模型ID' })
  modelId: string

  @Column({ name: 'prompt_template_id', type: 'uuid', nullable: true, comment: '所用Prompt模板ID' })
  promptTemplateId: string

  @Column({ name: 'llm_type', length: 50, comment: '大模型类型' })
  llmType: string

  @Column({ name: 'weight_snapshot', type: 'json', nullable: true, comment: '权重配置快照' })
  weightSnapshot: Record<string, number>

  @Column({ type: 'longtext', comment: '报告内容' })
  content: string

  @Column({ name: 'is_public', default: false, comment: '是否公开' })
  isPublic: boolean

  @Column({ length: 20, default: 'manual', comment: '内容来源: manual/agent' })
  source: string

  @Column({ name: 'is_authorized', default: false, comment: '是否授权公开（Agent报告强制true）' })
  isAuthorized: boolean

  @Column({ name: 'display_language', length: 10, default: 'zh-CN', comment: '展示语言' })
  displayLanguage: string

  @Column({ name: 'like_count', type: 'int', default: 0, comment: '点赞数' })
  likeCount: number

  @Column({ name: 'collect_count', type: 'int', default: 0, comment: '收藏数' })
  collectCount: number

  @Column({ name: 'comment_count', type: 'int', default: 0, comment: '评论数' })
  commentCount: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  // 关联用户
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  // 关联权重模型
  @ManyToOne(() => WeightModelEntity)
  @JoinColumn({ name: 'model_id' })
  weightModel: WeightModelEntity

  // 关联 Prompt 模板
  @ManyToOne(() => PromptTemplateEntity)
  @JoinColumn({ name: 'prompt_template_id' })
  promptTemplate: PromptTemplateEntity
}
