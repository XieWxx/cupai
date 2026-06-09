import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

/**
 * 球队实体
 * 对应 PRD 3.2 球队实力因子 + 3.1 历史战绩因子
 *
 * 同步来源：BSD SportsData v2 /teams/
 */
@Entity('teams')
@Index('idx_teams_bsd_id', ['dataSource'])
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** BSD 内部 ID（冗余便于反查） */
  @Column({ name: 'bs_team_id', type: 'int', nullable: true, comment: 'BSD 球队 ID' })
  bsTeamId: number

  @Column({ type: 'varchar', length: 100, comment: '球队名称（中文）' })
  name: string

  @Column({ name: 'name_en', type: 'varchar', length: 100, comment: '球队名称（英文）' })
  nameEn: string

  @Column({ name: 'name_ja', type: 'varchar', length: 100, nullable: true, comment: '球队名称（日语）' })
  nameJa: string

  @Column({ name: 'name_ko', type: 'varchar', length: 100, nullable: true, comment: '球队名称（韩语）' })
  nameKo: string

  @Column({ name: 'name_es', type: 'varchar', length: 100, nullable: true, comment: '球队名称（西班牙语）' })
  nameEs: string

  @Column({ name: 'name_fr', type: 'varchar', length: 100, nullable: true, comment: '球队名称（法语）' })
  nameFr: string

  @Column({ name: 'name_pt', type: 'varchar', length: 100, nullable: true, comment: '球队名称（葡萄牙语）' })
  namePt: string

  @Column({ name: 'name_ar', type: 'varchar', length: 100, nullable: true, comment: '球队名称（阿拉伯语）' })
  nameAr: string

  @Column({ name: 'short_name', length: 20, nullable: true, comment: '球队缩写' })
  shortName: string

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

  /** 球队所在国家（BSD 原始值） */
  @Column({ length: 100, nullable: true, comment: '国家名称（BSD 原始）' })
  country: string

  /** 球队主场场馆名 */
  @Column({ name: 'venue_name', length: 200, nullable: true, comment: '主场场馆' })
  venueName: string

  /** 是否国家队 */
  @Column({ name: 'is_national', type: 'boolean', default: false, comment: '是否国家队' })
  isNational: boolean

  /** 成立年份 */
  @Column({ type: 'int', nullable: true, comment: '成立年份' })
  founded: number

  @Column({ name: 'data_source', length: 255, nullable: true, comment: '数据来源唯一标识 (如 bsd_1234)' })
  dataSource: string

  @Column({ name: 'data_source_url', length: 500, nullable: true, comment: '数据源链接' })
  dataSourceUrl: string

  @Column({ name: 'last_synced_at', type: 'datetime', nullable: true, comment: '最近一次同步时间' })
  lastSyncedAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
