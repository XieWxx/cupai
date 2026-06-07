import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm'
import { UserAiConfigEntity } from '../../ai/entities/user-ai-config.entity'
import { WeightModelEntity } from '../../ranking/entities/weight-model.entity'
import * as crypto from 'crypto'

/**
 * 用户实体
 * 对应 PRD 10.1 用户表
 */
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true, length: 50, comment: '登录账号' })
  username: string

  @Column({ length: 255, select: false, comment: '密码（加密）' })
  password: string

  @Column({ length: 50, comment: '用户昵称' })
  nickname: string

  @Column({ length: 255, nullable: true, comment: '头像URL' })
  avatar: string

  @Column({ length: 10, nullable: true, comment: '注册地区' })
  region: string

  @Column({ length: 10, default: 'zh-CN', comment: '默认语言' })
  language: string

  @Column({ length: 50, default: 'Asia/Shanghai', comment: '默认时区' })
  timezone: string

  /** 用户 API Key，用于 Agent 回调鉴权，注册时自动生成 */
  @Column({ unique: true, length: 64, comment: 'API Key（Agent 回调鉴权）' })
  apiKey: string

  @CreateDateColumn({ name: 'created_at', comment: '注册时间' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date

  /** 注册前自动生成 apiKey */
  @BeforeInsert()
  generateApiKey() {
    if (!this.apiKey) {
      this.apiKey = `cpk_${crypto.randomBytes(24).toString('hex')}`
    }
  }

  // 关联关系
  @OneToMany(() => UserAiConfigEntity, (config) => config.user)
  aiConfigs: UserAiConfigEntity[]

  @OneToMany(() => WeightModelEntity, (model) => model.user)
  weightModels: WeightModelEntity[]
}
