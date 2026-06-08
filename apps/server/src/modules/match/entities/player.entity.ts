import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { TeamEntity } from './team.entity'

/**
 * 球员实体
 * 数据来源：BSD /players/ 接口
 * 包含球员基础信息、赛季统计、伤病状态等
 */
@Entity('players')
@Index('idx_players_bsd_id', ['bsdPlayerId'], { unique: true })
@Index('idx_players_team', ['teamId'])
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** BSD 球员 ID（用于与 BSD 数据关联） */
  @Column({ name: 'bsd_player_id', type: 'int', nullable: true, unique: true, comment: 'BSD 球员 ID' })
  bsdPlayerId: number

  @Column({ length: 100, nullable: true, comment: '球员姓名（中文）' })
  name: string

  @Column({ name: 'name_en', length: 100, comment: '球员姓名（英文）' })
  nameEn: string

  /** BSD short_name */
  @Column({ name: 'short_name', length: 100, nullable: true, comment: '球员简称' })
  shortName: string

  @Column({ name: 'team_id', type: 'uuid', nullable: true, comment: '所属球队ID' })
  teamId: string

  /** BSD position: G/D/M/F */
  @Column({ length: 30, nullable: true, comment: '位置: G/D/M/F' })
  position: string

  /** BSD specific_position: GK/CB/LB/RB/CM/LW/RW/ST... */
  @Column({ name: 'specific_position', length: 30, nullable: true, comment: '具体位置' })
  specificPosition: string

  @Column({ name: 'jersey_number', type: 'int', nullable: true, comment: '球衣号码' })
  jerseyNumber: number

  /** 从 date_of_birth 计算得出 */
  @Column({ type: 'int', nullable: true, comment: '年龄' })
  age: number

  @Column({ name: 'date_of_birth', type: 'date', nullable: true, comment: '出生日期' })
  dateOfBirth: Date

  @Column({ name: 'height_cm', type: 'int', nullable: true, comment: '身高(cm)' })
  heightCm: number

  @Column({ name: 'weight_kg', type: 'int', nullable: true, comment: '体重(kg)' })
  weightKg: number

  @Column({ name: 'preferred_foot', length: 10, nullable: true, comment: '惯用脚: L/R' })
  preferredFoot: string

  @Column({ length: 50, nullable: true, comment: '国籍' })
  nationality: string

  @Column({ name: 'market_value_eur', type: 'bigint', nullable: true, comment: '身价(欧元)' })
  marketValueEur: number

  @Column({ name: 'is_key_player', default: false, comment: '是否核心球星' })
  isKeyPlayer: boolean

  /** BSD rating (0-100) */
  @Column({ type: 'int', nullable: true, comment: 'BSD 评分' })
  rating: number

  /** BSD potential 标签 */
  @Column({ length: 100, nullable: true, comment: '潜力标签' })
  potential: string

  @Column({ name: 'season_goals', type: 'int', default: 0, comment: '本赛季进球数' })
  seasonGoals: number

  @Column({ name: 'season_assists', type: 'int', default: 0, comment: '本赛季助攻数' })
  seasonAssists: number

  /** BSD availability: available/injured/doubtful/suspended */
  @Column({ length: 50, nullable: true, comment: '伤病状态' })
  injuryStatus: string

  /** BSD injury_risk */
  @Column({ name: 'injury_risk', length: 100, nullable: true, comment: '伤病风险' })
  injuryRisk: string

  /** BSD strengths（球员优势标签列表） */
  @Column({ type: 'json', nullable: true, comment: '球员优势标签' })
  strengths: string[]

  /** BSD weaknesses（球员弱点标签列表） */
  @Column({ type: 'json', nullable: true, comment: '球员弱点标签' })
  weaknesses: string[]

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
