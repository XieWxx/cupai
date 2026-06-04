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
 * 用户 AI 配置实体
 * 对应 PRD 10.2 用户AI配置表
 * 注意：不存储 API Key，密钥仅前端加密存储
 */
@Entity('user_ai_configs')
export class UserAiConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid', comment: '用户ID' })
  userId: string

  @Column({ name: 'model_name', length: 50, comment: '模型名称' })
  modelName: string

  @Column({ name: 'api_endpoint', length: 500, comment: 'API接口地址' })
  apiEndpoint: string

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.7, comment: '温度参数(0-1)' })
  temperature: number

  @Column({ name: 'max_tokens', type: 'int', default: 4096, comment: '最大生成长度' })
  maxTokens: number

  @Column({ name: 'context_length', type: 'int', default: 8192, nullable: true, comment: '上下文长度' })
  contextLength: number

  @Column({ default: true, comment: '是否为默认配置' })
  isDefault: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 关联用户
  @ManyToOne(() => UserEntity, (user) => user.aiConfigs)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
