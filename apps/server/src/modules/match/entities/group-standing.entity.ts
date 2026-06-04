import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { TeamEntity } from './team.entity'

/**
 * 积分榜实体
 * 记录小组赛积分、净胜球、出线形势
 */
@Entity('group_standings')
export class GroupStandingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** 小组名称（如 A组、B组） */
  @Column({ name: 'group_name', length: 10, comment: '小组名称' })
  groupName: string

  /** 球队ID */
  @Column({ name: 'team_id', type: 'uuid', comment: '球队ID' })
  teamId: string

  /** 已赛场次 */
  @Column({ name: 'played', type: 'int', default: 0, comment: '已赛场次' })
  played: number

  /** 胜场 */
  @Column({ type: 'int', default: 0, comment: '胜场' })
  wins: number

  /** 平场 */
  @Column({ type: 'int', default: 0, comment: '平场' })
  draws: number

  /** 负场 */
  @Column({ type: 'int', default: 0, comment: '负场' })
  losses: number

  /** 进球数 */
  @Column({ name: 'goals_for', type: 'int', default: 0, comment: '进球数' })
  goalsFor: number

  /** 失球数 */
  @Column({ name: 'goals_against', type: 'int', default: 0, comment: '失球数' })
  goalsAgainst: number

  /** 净胜球 */
  @Column({ name: 'goal_difference', type: 'int', default: 0, comment: '净胜球' })
  goalDifference: number

  /** 积分 */
  @Column({ type: 'int', default: 0, comment: '积分' })
  points: number

  /** 小组排名 */
  @Column({ name: 'rank_position', type: 'int', default: 0, comment: '小组排名' })
  rankPosition: number

  /** 出线概率（0-100，AI 预测） */
  @Column({ name: 'advance_probability', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '出线概率(%)' })
  advanceProbability: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 关联球队
  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity
}
