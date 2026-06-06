import { Injectable, Logger } from '@nestjs/common'
import { BsdcBusinessService } from './bsd.business.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchEntity } from '../match/entities/match.entity'
import { TeamEntity } from '../match/entities/team.entity'

/** 国家名称 → ISO 3166-1 alpha-2 代码映射（覆盖 BSD API 常见值） */
const COUNTRY_TO_ISO: Record<string, string> = {
  // 世界杯相关国家队
  argentina: 'ar', brazil: 'br', belgium: 'be', france: 'fr', germany: 'de',
  spain: 'es', england: 'gb-eng', portugal: 'pt', netherlands: 'nl', italy: 'it',
  croatia: 'hr', morocco: 'ma', japan: 'jp', 'south korea': 'kr', mexico: 'mx',
  usa: 'us', canada: 'ca', uruguay: 'uy', colombia: 'co', chile: 'cl',
  ecuador: 'ec', peru: 'pe', switzerland: 'ch', denmark: 'dk', sweden: 'se',
  norway: 'no', poland: 'pl', austria: 'at', czechia: 'cz', serbia: 'rs',
  wales: 'gb-wls', scotland: 'gb-sct', ukraine: 'ua', russia: 'ru', turkey: 'tr',
  egypt: 'eg', nigeria: 'ng', ghana: 'gh', cameroon: 'cm', senegal: 'sn',
  tunisia: 'tn', algeria: 'dz', 'saudi arabia': 'sa', iran: 'ir', iraq: 'iq',
  australia: 'au', 'new zealand': 'nz', china: 'cn', 'costa rica': 'cr',
  jamaica: 'jm', panama: 'pa', honduras: 'hn', paraguay: 'py', bolivia: 'bo',
  venezuela: 've', romania: 'ro', hungary: 'hu', greece: 'gr', slovakia: 'sk',
  slovenia: 'si', ireland: 'ie', 'northern ireland': 'gb-nir', iceland: 'is',
  finland: 'fi', israel: 'il', 'south africa': 'za', mali: 'ml', ivorycoast: 'ci',
  'côte d\'ivoire': 'ci', congo: 'cg', zambia: 'zm',
  // 联赛国家/地区
  africa: 'af', asia: 'as', europe: 'eu', 'south america': 'sa',
  'north america': 'na', oceania: 'oc',
}

/** 将 BSD 返回的国家名称转为 ISO 2 字母代码 */
function countryToIso(country: string | undefined | null): string {
  if (!country) return 'INT'
  const key = country.trim().toLowerCase()
  return COUNTRY_TO_ISO[key] || 'INT'
}

@Injectable()
export class BsdcSyncService {
  private readonly logger = new Logger(BsdcSyncService.name)

  constructor(
    private readonly bsdService: BsdcBusinessService,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
  ) {}

  async syncTeams(): Promise<{ created: number; updated: number }> {
    let created = 0
    let updated = 0
    try {
      const teams = await this.bsdService.getTeams({ limit: 200 })
      for (const bsTeam of (teams.results ?? [])) {
        const bsdId = String(bsTeam.id)
        const isoCode = countryToIso(bsTeam.country)
        const existing = await this.teamRepo.findOne({ where: { dataSource: `bsd_${bsdId}` } })
        if (existing) {
          existing.name = bsTeam.name
          existing.nameEn = bsTeam.name
          existing.countryCode = isoCode
          existing.logo = bsTeam.logo || null
          existing.dataSource = `bsd_${bsdId}`
          await this.teamRepo.save(existing)
          updated++
        } else {
          const team = this.teamRepo.create({
            name: bsTeam.name,
            nameEn: bsTeam.name,
            countryCode: isoCode,
            logo: bsTeam.logo || null,
            dataSource: `bsd_${bsdId}`,
            dataSourceUrl: `https://sports.bzzoiro.com/api/v2/teams/${bsdId}/`,
          })
          await this.teamRepo.save(team)
          created++
        }
      }
    } catch (error) {
      this.logger.error(`Sync teams failed: ${error.message}`)
    }
    return { created, updated }
  }

  async syncEvents(): Promise<{ created: number; updated: number }> {
    let created = 0
    let updated = 0
    try {
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 1)
      const toDate = new Date()
      toDate.setDate(toDate.getDate() + 30)
      const events = await this.bsdService.getEvents({
        date_from: fromDate.toISOString().split('T')[0],
        date_to: toDate.toISOString().split('T')[0],
        limit: 200,
      })

      // 预加载联赛名称映射（league_id → league_name）
      const leagueMap = await this.buildLeagueNameMap()

      for (const bsEvent of (events.results ?? [])) {
        const homeTeam = await this.getOrCreateTeam(bsEvent.home_team_id, bsEvent.home_team)
        const awayTeam = await this.getOrCreateTeam(bsEvent.away_team_id, bsEvent.away_team)
        const statusMap: Record<string, string> = { notstarted: 'upcoming', inprogress: 'live', finished: 'finished', aborted: 'finished' }
        const status = statusMap[bsEvent.status] || 'upcoming'
        const startTime = new Date(bsEvent.event_date)
        const bsdId = String(bsEvent.id)
        // 赛事阶段：优先用 round_name，否则根据 group_name 判断
        const stage = bsEvent.round_name || (bsEvent.group_name ? 'group' : 'league')
        // 联赛名称：从预加载映射中获取，回退到 league_id
        const leagueName = leagueMap.get(bsEvent.league_id) || `联赛${bsEvent.league_id}`
        let match = await this.matchRepo.findOne({ where: { dataSource: `bsd_${bsdId}` } })
        if (match) {
          match.leagueName = leagueName
          match.stage = stage
          match.groupName = bsEvent.group_name || null
          match.homeTeamId = homeTeam.id
          match.awayTeamId = awayTeam.id
          match.startTime = startTime
          match.status = status
          match.homeScore = bsEvent.home_score ?? null
          match.awayScore = bsEvent.away_score ?? null
          match.halfTimeHome = bsEvent.home_score_ht ?? null
          match.halfTimeAway = bsEvent.away_score_ht ?? null
          match.venue = null
          match.dataSource = `bsd_${bsdId}`
          match.dataSourceUrl = `https://sports.bzzoiro.com/api/v2/events/${bsdId}/`
          await this.matchRepo.save(match)
          updated++
        } else {
          match = this.matchRepo.create({
            leagueName,
            stage,
            groupName: bsEvent.group_name || null,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            startTime,
            status,
            homeScore: bsEvent.home_score ?? null,
            awayScore: bsEvent.away_score ?? null,
            halfTimeHome: bsEvent.home_score_ht ?? null,
            halfTimeAway: bsEvent.away_score_ht ?? null,
            venue: null,
            dataSource: `bsd_${bsdId}`,
            dataSourceUrl: `https://sports.bzzoiro.com/api/v2/events/${bsdId}/`,
          })
          await this.matchRepo.save(match)
          created++
        }
      }
    } catch (error) {
      this.logger.error(`Sync events failed: ${error.message}`)
    }
    return { created, updated }
  }

  /** 构建联赛 ID → 名称映射 */
  private async buildLeagueNameMap(): Promise<Map<number, string>> {
    const map = new Map<number, string>()
    try {
      const leagues = await this.bsdService.getLeagues({ limit: 200 })
      for (const league of (leagues.results ?? [])) {
        map.set(league.id, league.name)
      }
    } catch (error) {
      this.logger.warn(`Failed to load league names: ${error.message}`)
    }
    return map
  }

  async syncStandings(): Promise<{ leagues: number; rows: number }> {
    let leagues = 0
    let rows = 0
    try {
      const leaguesList = await this.bsdService.getLeagues({ limit: 200 })
      for (const league of (leaguesList.results ?? [])) {
        if (!league.is_active) continue
        try {
          const standings = await this.bsdService.getLeagueStandings(league.id)
          if (standings?.standings) {
            leagues++
            rows += standings.standings.length
          }
        } catch (e) { /* skip */ }
      }
    } catch (error) {
      this.logger.error(`Sync standings failed: ${error.message}`)
    }
    return { leagues, rows }
  }

  private async getOrCreateTeam(bsdId: number, name: string): Promise<TeamEntity> {
    const key = `bsd_${bsdId}`
    let team = await this.teamRepo.findOne({ where: { dataSource: key } })
    if (!team) {
      // 新球队：尝试从 BSD API 获取详情以获得 country 和 logo
      let isoCode = 'INT'
      let logo: string | null = null
      try {
        const detail = await this.bsdService.getTeamDetail(bsdId) as any
        isoCode = countryToIso(detail?.country)
        logo = detail?.logo || null
      } catch { /* 回退到默认值 */ }
      team = this.teamRepo.create({
        name,
        nameEn: name,
        countryCode: isoCode,
        logo,
        dataSource: key,
        dataSourceUrl: `https://sports.bzzoiro.com/api/v2/teams/${bsdId}/`,
      })
      await this.teamRepo.save(team)
    } else if (team.countryCode === 'INT') {
      // 已存在但 countryCode 为默认值：尝试从详情接口补充
      try {
        const detail = await this.bsdService.getTeamDetail(bsdId) as any
        if (detail?.country) {
          team.countryCode = countryToIso(detail.country)
          if (detail.logo) team.logo = detail.logo
          await this.teamRepo.save(team)
        }
      } catch { /* 保持原值 */ }
    }
    return team
  }

  async getSyncStatus() {
    const matchCount = await this.matchRepo.count()
    const teamCount = await this.teamRepo.count()
    return { matchCount, teamCount }
  }
}
