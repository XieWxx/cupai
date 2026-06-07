import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

/**
 * 联赛/赛季实体
 *
 * 同步来源：BSD /api/v2/leagues/ + /api/v2/leagues/{id}/season/
 */
@Entity('leagues')
@Index('idx_leagues_bs_id', ['bsLeagueId'], { unique: true })
@Index('idx_leagues_current_season', ['bsSeasonId'])
export class LeagueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** BSD 联赛 ID */
  @Column({ name: 'bs_league_id', type: 'int', comment: 'BSD 联赛 ID' })
  bsLeagueId: number

  /** BSD 当前赛季 ID */
  @Column({ name: 'bs_season_id', type: 'int', nullable: true, comment: 'BSD 赛季 ID' })
  bsSeasonId: number

  @Column({ length: 200, comment: '联赛名称（原始）' })
  name: string

  /** 中文译名（i18n 兜底） */
  @Column({ name: 'name_zh', length: 200, nullable: true, comment: '中文名称' })
  nameZh: string

  @Column({ length: 100, nullable: true, comment: '国家/地区' })
  country: string

  @Column({ name: 'is_women', type: 'boolean', default: false, comment: '是否女足' })
  isWomen: boolean

  @Column({ name: 'is_active', type: 'boolean', default: true, comment: '是否活跃' })
  isActive: boolean

  @Column({ length: 200, nullable: true, comment: '当前赛季名称' })
  seasonName: string

  @Column({ name: 'season_year', type: 'int', nullable: true, comment: '赛季年份' })
  seasonYear: number

  @Column({ name: 'season_start', type: 'date', nullable: true, comment: '赛季开始日期' })
  seasonStart: string

  @Column({ name: 'season_end', type: 'date', nullable: true, comment: '赛季结束日期' })
  seasonEnd: string

  @Column({ name: 'is_current_season', type: 'boolean', default: false, comment: '是否当前赛季' })
  isCurrentSeason: boolean

  @Column({ name: 'data_source', length: 100, default: 'bsd', comment: '数据来源' })
  dataSource: string

  @Column({ name: 'last_synced_at', type: 'datetime', nullable: true, comment: '最近一次同步时间' })
  lastSyncedAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
