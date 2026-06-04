import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

/**
 * 敏感词实体
 * 持久化存储自定义敏感词，替代内存存储
 */
@Entity('sensitive_words')
export class SensitiveWordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** 敏感词内容 */
  @Column({ length: 100, comment: '敏感词' })
  word: string

  /** 分类: gambling(博彩) / custom(自定义) */
  @Column({ length: 20, default: 'custom', comment: '分类' })
  category: string

  /** 创建者（system 或用户ID） */
  @Column({ name: 'created_by', length: 50, default: 'system', comment: '创建者' })
  createdBy: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
