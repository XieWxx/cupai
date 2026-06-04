import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { TeamEntity } from './team.entity'

/**
 * 球员实体
 * 对应 PRD 3.3 核心球星状态因子
 */
@Entity('players')
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100, comment: '球员姓名（中文）' })
  name: string

  @Column({ name: 'name_en', length: 100, comment: '球员姓名（英文）' })
  nameEn: string

  @Column({ name: 'team_id', type: 'uuid', comment: '所属球队ID' })
  teamId: string

  @Column({ length: 30, comment: '位置' })
  position: string

  @Column({ type: 'int', comment: '年龄' })
  age: number

  @Column({ name: 'is_key_player', default: false, comment: '是否核心球星' })
  isKeyPlayer: boolean

  @Column({ name: 'season_goals', type: 'int', default: 0, comment: '本赛季进球数' })
  seasonGoals: number

  @Column({ name: 'season_assists', type: 'int', default: 0, comment: '本赛季助攻数' })
  seasonAssists: number

  @Column({ length: 50, nullable: true, comment: '伤病状态' })
  injuryStatus: string

  @Column({ name: 'yellow_cards', type: 'int', default: 0, comment: '黄牌数' })
  yellowCards: number

  @Column({ name: 'red_cards', type: 'int', default: 0, comment: '红牌数' })
  redCards: number

  @Column({ length: 255, nullable: true, comment: '头像URL' })
  avatar: string

  @Column({ name: 'data_source', length: 255, nullable: true, comment: '数据来源' })
  dataSource: string

  @Column({ name: 'data_source_url', length: 500, nullable: true, comment: '数据源链接' })
  dataSourceUrl: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 关联球队
  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity
}
