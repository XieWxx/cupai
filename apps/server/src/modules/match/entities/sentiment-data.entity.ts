import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { TeamEntity } from './team.entity'

/**
 * 舆情数据实体
 * 存储海外社交媒体舆情数据，支持多语言情感分析
 */
@Entity('sentiment_data')
export class SentimentDataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** 关联球队ID */
  @Column({ name: 'team_id', type: 'uuid', nullable: true, comment: '关联球队ID' })
  teamId: string

  /** 关联赛事ID */
  @Column({ name: 'match_id', type: 'uuid', nullable: true, comment: '关联赛事ID' })
  matchId: string

  /** 数据来源平台（twitter/reddit/weibo/other） */
  @Column({ name: 'source_platform', length: 30, comment: '数据来源平台' })
  sourcePlatform: string

  /** 原始文本内容 */
  @Column({ type: 'text', comment: '原始文本内容' })
  originalText: string

  /** 文本语言代码（zh-CN/en-US/es-ES/fr-FR/pt-BR/ar-SA/ja-JP/ko-KR） */
  @Column({ length: 10, name: 'language', comment: '文本语言代码' })
  language: string

  /** 来源地区（CN/US/ES/FR/BR/SA/JP/KR 等） */
  @Column({ length: 10, name: 'region', nullable: true, comment: '来源地区' })
  region: string

  /** 情绪分值（-1 到 1） */
  @Column({ name: 'sentiment_score', type: 'decimal', precision: 5, scale: 4, comment: '情绪分值(-1~1)' })
  sentimentScore: number

  /** 情绪极性（positive/negative/neutral） */
  @Column({ name: 'sentiment_polarity', length: 10, comment: '情绪极性' })
  sentimentPolarity: string

  /** 情绪强度（0-1） */
  @Column({ name: 'sentiment_intensity', type: 'decimal', precision: 5, scale: 4, comment: '情绪强度(0~1)' })
  sentimentIntensity: number

  /** 分析置信度（0-1） */
  @Column({ name: 'confidence', type: 'decimal', precision: 5, scale: 4, comment: '分析置信度(0~1)' })
  confidence: number

  /** 压力指数（0-1） */
  @Column({ name: 'pressure_index', type: 'decimal', precision: 5, scale: 4, nullable: true, comment: '压力指数(0~1)' })
  pressureIndex: number

  /** 专注度（0-1） */
  @Column({ name: 'focus_index', type: 'decimal', precision: 5, scale: 4, nullable: true, comment: '专注度(0~1)' })
  focusIndex: number

  /** 原文发布时间 */
  @Column({ name: 'published_at', type: 'timestamp', nullable: true, comment: '原文发布时间' })
  publishedAt: Date

  /** 原文链接 */
  @Column({ name: 'source_url', length: 500, nullable: true, comment: '原文链接' })
  sourceUrl: string

  /** 作者/账号名 */
  @Column({ length: 100, nullable: true, comment: '作者/账号名' })
  author: string

  /** 互动量（转评赞合计） */
  @Column({ type: 'int', default: 0, comment: '互动量' })
  engagement: number

  /** 是否已审核 */
  @Column({ name: 'is_reviewed', default: false, comment: '是否已审核' })
  isReviewed: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  // 关联球队
  @ManyToOne(() => TeamEntity, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity
}
