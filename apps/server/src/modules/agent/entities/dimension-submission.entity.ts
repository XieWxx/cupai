import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm'

/**
 * 维度分析提交实体
 * Agent 通过 /agent/open/dimension/submit 回传的单维度分析结果
 */
@Entity('dimension_submissions')
@Index(['matchId', 'dimKey'])
export class DimensionSubmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** 赛事 ID */
  @Column({ name: 'match_id', type: 'uuid' })
  matchId: string

  /** 维度 key（如 result_wdl、total_goals 等） */
  @Column({ name: 'dim_key', length: 50 })
  dimKey: string

  /** 首选结论（如 home_win） */
  @Column({ name: 'top_option', length: 100, nullable: true })
  topOption: string

  /** 首选结论概率（0-1） */
  @Column({ name: 'top_probability', type: 'decimal', precision: 5, scale: 4, nullable: true })
  topProbability: number

  /** 概率分布 JSON（如 {"home_win": 0.55, "draw": 0.25, "away_win": 0.20}） */
  @Column({ type: 'json', nullable: true })
  distribution: Record<string, number>

  /** 分析摘要 */
  @Column({ type: 'text', nullable: true })
  summary: string

  /** 使用的模型名 */
  @Column({ name: 'model', length: 100, nullable: true })
  model: string

  /** 提交者 API Key（前 8 位，用于标识来源） */
  @Column({ name: 'api_key_hint', length: 20, nullable: true })
  apiKeyHint: string

  /** 使用的 Agent 平台（如 codex-cli、cursor、cline 等） */
  @Column({ name: 'platform', length: 100, nullable: true })
  platform: string

  /** 是否为系统自动分析（定时任务生成），排行榜统计时排除 */
  @Column({ name: 'is_auto_analysis', type: 'boolean', default: false, comment: '是否为系统自动分析' })
  isAutoAnalysis: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
