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
 * Prompt 模板实体
 * 对应 PRD 10.5 Prompt模板数据表
 */
@Entity('prompt_templates')
export class PromptTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid', comment: '创建者用户ID' })
  userId: string

  @Column({ length: 100, comment: '模板名称' })
  name: string

  @Column({ name: 'scene', length: 50, comment: '适配场景' })
  scene: string

  @Column({ type: 'text', comment: '模板完整内容' })
  content: string

  @Column({ name: 'adapted_model', length: 50, nullable: true, comment: '适配模型类型' })
  adaptedModel: string

  @Column({ name: 'adapted_stage', length: 50, nullable: true, comment: '适配赛事阶段' })
  adaptedStage: string

  @Column({ name: 'is_public', default: false, comment: '是否公开' })
  isPublic: boolean

  @Column({ name: 'collect_count', type: 'int', default: 0, comment: '收藏量' })
  collectCount: number

  @Column({ name: 'use_count', type: 'int', default: 0, comment: '使用量' })
  useCount: number

  @Column({ name: 'like_count', type: 'int', default: 0, comment: '点赞量' })
  likeCount: number

  @Column({ name: 'is_original', default: true, comment: '是否原创' })
  isOriginal: boolean

  @Column({ name: 'original_author_id', type: 'uuid', nullable: true, comment: '原作者ID（二次编辑时）' })
  originalAuthorId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 关联用户
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
