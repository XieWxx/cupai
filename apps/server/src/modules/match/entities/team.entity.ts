import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * 球队实体
 * 对应 PRD 3.2 球队实力因子 + 3.1 历史战绩因子
 */
@Entity('teams')
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100, comment: '球队名称（中文）' })
  name: string

  @Column({ name: 'name_en', length: 100, comment: '球队名称（英文）' })
  nameEn: string

  @Column({ name: 'country_code', length: 10, comment: '国家代码' })
  countryCode: string

  @Column({ name: 'fifa_rank', type: 'int', nullable: true, comment: 'FIFA世界排名' })
  fifaRank: number

  @Column({ name: 'fifa_rank_change', type: 'int', default: 0, comment: '排名变化' })
  fifaRankChange: number

  @Column({ name: 'continent_rank', type: 'int', nullable: true, comment: '洲际排名' })
  continentRank: number

  @Column({ length: 50, nullable: true, comment: '主打阵型' })
  formation: string

  @Column({ length: 50, nullable: true, comment: '攻防风格' })
  playStyle: string

  @Column({ name: 'avg_goals_scored', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '场均进球' })
  avgGoalsScored: number

  @Column({ name: 'avg_goals_conceded', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '场均失球' })
  avgGoalsConceded: number

  @Column({ name: 'avg_possession', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '场均控球率' })
  avgPossession: number

  @Column({ name: 'win_rate', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '胜率' })
  winRate: number

  @Column({ length: 255, nullable: true, comment: '球队Logo URL' })
  logo: string

  @Column({ name: 'data_source', length: 255, nullable: true, comment: '数据来源' })
  dataSource: string

  @Column({ name: 'data_source_url', length: 500, nullable: true, comment: '数据源链接' })
  dataSourceUrl: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
