/**
 * BSD 赛事列表中的球队对象
 * 字段路径：`bsEvent.home_team_obj` / `bsEvent.away_team_obj`
 */
export interface BsTeamObj {
  id: number
  name: string
  short_name?: string
  country?: string
  /** 主教练信息 */
  coach?: { name: string; shortName?: string } | null
  /** 主场馆信息 */
  venue?: { id: number; name: string; city?: string; country?: string; capacity?: number } | null
}

/** BSD 联赛在赛事列表中嵌套的对象 */
export interface BsLeagueObj {
  id: number
  name: string
  country?: string
  is_women?: boolean
  current_season?: {
    id: number
    name: string
    year: number
    start_date?: string
    end_date?: string
    is_current?: boolean
  } | null
}

/** BSD 赛季对象 */
export interface BsSeasonObj {
  id: number
  name: string
  year: number
}

export interface BsEvent {
  id: number
  /** 联赛（嵌套对象） */
  league: BsLeagueObj
  /** 赛季（嵌套对象） */
  season: BsSeasonObj
  /** 主队名称（仅字符串） */
  home_team: string
  /** 客队名称（仅字符串） */
  away_team: string
  /** 主队完整对象（含 id/venue/coach） */
  home_team_obj: BsTeamObj
  /** 客队完整对象 */
  away_team_obj: BsTeamObj
  home_coach_id: number | null
  away_coach_id: number | null
  /** 裁判 ID（事件列表 API 可能不返回，需从 referee 嵌套对象获取） */
  referee_id: number | null
  /** 场馆 ID（事件列表 API 可能不返回，需从 venue 嵌套对象获取） */
  venue_id: number | null
  /** 裁判嵌套对象（事件详情 API 返回，包含 id/name/country 等） */
  referee?: BsEventReferee | null
  /** 场馆嵌套对象（事件详情 API 返回，包含 id/name/city/capacity 等） */
  venue?: BsEventVenue | null
  /** 主教练嵌套对象（事件详情 API 返回） */
  home_coach?: BsEventCoach | null
  /** 客教练嵌套对象（事件详情 API 返回） */
  away_coach?: BsEventCoach | null
  /** 比赛开球时间（含时区偏移，例如 2026-06-08T14:00:00+04:00） */
  event_date: string
  status: string
  replaced_by: number | null
  round_number: number | null
  round_name: string
  group_name: string | null
  period: string
  current_minute: number | null
  home_score: number | null
  away_score: number | null
  home_score_ht: number | null
  away_score_ht: number | null
  penalty_shootout: number | null
  extra_time_score: string | null
  is_local_derby: boolean
  is_neutral_ground: boolean
  travel_distance_km: number | null
  weather: BsWeather | null
  /** 顶层天气字段（部分赛事直接在顶层返回，而非嵌套在 weather 对象中） */
  temperature_c: number | null
  wind_speed: number | null
  weather_code: number | null
  pitch_condition: string | null
  attendance: number | null
  live_websocket: boolean
  highlights: string[]
  head_to_head: unknown | null
}

export interface BsWeather {
  code: number | null
  description: string | null
  wind_speed: number | null
  temperature_c: number | null
}

/** BSD 事件详情中的场馆嵌套对象 */
export interface BsEventVenue {
  id: number
  name: string
  city: string | null
  country: string | null
  capacity: number | null
  latitude: number | null
  longitude: number | null
  pitch_x: number | null
  pitch_y: number | null
  built_year: number | null
}

/** BSD 事件详情中的裁判嵌套对象 */
export interface BsEventReferee {
  id: number
  name: string
  country: string | null
  nationality_a3: string | null
  birthdate: string | null
  yellowCards: number | null
  redCards: number | null
  career_games: number | null
  career_yellow_cards: number | null
  career_red_cards: number | null
}

/** BSD 事件详情中的教练嵌套对象 */
export interface BsEventCoach {
  id: number
  name: string
  short_name: string | null
  country: string | null
  profile: string | null
  preferred_formation: string | null
  pressing_intensity: number | null
  defensive_line: string | null
  top_styles: string[] | null
}

export interface BsLeague {
  id: number
  name: string
  country: string
  is_women: boolean
  is_active: boolean
  current_season: BsCurrentSeason | null
}

export interface BsCurrentSeason {
  id: number
  name: string
  year: number
  start_date: string
  end_date: string
  is_current: boolean
}

export interface BsTeam {
  id: number
  name: string
  country: string
  logo: string | null
  founded: number | null
  venue_id: number | null
  venue_name: string | null
  is_national: boolean
  social?: unknown[]
}

export interface BsOdds {
  event_id: number
  odds: BsOddsMarket
}

export interface BsOddsMarket {
  home_win: number
  draw: number
  away_win: number
  over_15_goals: number
  over_25_goals: number
  over_35_goals: number
  under_15_goals: number
  under_25_goals: number
  under_35_goals: number
  btts_yes: number
  btts_no: number
}

export interface BsBestOdds {
  event_id: number
  event_date: string
  league_id: number
  league_name: string
  home_team_id: number
  home_team: string
  away_team_id: number
  away_team: string
  market: string
  best_odds: BsBestOdd[]
}

export interface BsBestOdd {
  outcome: string
  line: number | null
  outcome_name: string
  decimal_odds: number
  bookmaker_slug: string
  bookmaker_name: string
  updated_at: string
}

/**
 * BSD AI 预测（实际接口返回扁平结构）
 * 注意：BSD 的 /api/predictions/?event_id=X 接口会**忽略 event_id 过滤**，
 * 需调用方在内存中按 prediction.event.id === targetBsEventId 匹配。
 */
export interface BsPrediction {
  /** 预测记录 ID（全局唯一） */
  id: number
  /** 预测创建时间 ISO 字符串 */
  created_at: string
  /** 关联的赛事 */
  event: BsPredictionEvent
  /** 胜平负概率（0-100，百分比数值） */
  prob_home_win: number
  prob_draw: number
  prob_away_win: number
  /** 预测结果：H=主胜 / D=平 / A=客胜 */
  predicted_result: 'H' | 'D' | 'A' | string
  /** 预期进球数 */
  expected_home_goals: number
  expected_away_goals: number
  /** 大小球概率（0-100） */
  prob_over_15: number
  prob_over_25: number
  prob_over_35: number
  /** 双方进球概率（0-100） */
  prob_btts_yes: number
  /** 最可能比分（BSD 部分接口返回，缺省时为空字符串） */
  most_likely_score?: string
  /** 模型置信度（0-100） */
  confidence: number
  /** 模型版本 */
  model_version: string
  /** 倾向概率（0-100） */
  favorite_prob: number
  /** 倾向方：H/D/A */
  favorite?: string
}

export interface BsPredictionEvent {
  id: number
  event_date: string
  status: string
  home_team_id: number
  home_team: string
  away_team_id: number
  away_team: string
  league_id: number
  league_name: string
}

export interface BsPredictionMarkets {
  match_result: BsMatchResult
  expected_goals: BsExpectedGoals
  over_under: BsOverUnder
  btts: BsBtts
  score: BsScore
}

export interface BsMatchResult {
  prob_home: number
  prob_draw: number
  prob_away: number
  predicted: string
}

export interface BsExpectedGoals {
  home: number
  away: number
}

export interface BsOverUnder {
  prob_over_15: number
  prob_over_25: number
  prob_over_35: number
}

export interface BsBtts {
  prob_yes: number
}

export interface BsScore {
  most_likely: string
}

export interface BsPredictionRecommendations {
  favorite: string
  favorite_prob: number
  bet_favorite: boolean
  over_15: boolean
  over_25: boolean
  over_35: boolean
  btts: boolean
  winner: boolean
}

export interface BsPredictionModel {
  confidence: number
  version: string
}

export interface BsStanding {
  league_id: number
  league_name?: string
  season: BsStandingSeason
  grouped: boolean
  standings: BsStandingRow[]
  /** 分组积分榜：key 为组名（如 "Group A"），value 为该组的排名行 */
  groups?: Record<string, BsStandingRow[]>
}

export interface BsStandingSeason {
  id: number
  name: string
}

export interface BsStandingRow {
  position: number
  team_id: number
  team_name: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
  xgf: number
  xga: number
  xgd: number
  xg_games: number
  form: string
  live: boolean
}

export interface BsEventDetail {
  id: number
  /** 联赛（嵌套对象） */
  league: BsLeagueObj
  /** 赛季（嵌套对象） */
  season: BsSeasonObj
  home_team: string
  away_team: string
  home_team_obj: BsTeamObj
  away_team_obj: BsTeamObj
  home_coach_id: number | null
  away_coach_id: number | null
  referee_id: number | null
  venue_id: number | null
  /** 裁判嵌套对象（事件详情 API 返回） */
  referee?: BsEventReferee | null
  /** 场馆嵌套对象（事件详情 API 返回） */
  venue?: BsEventVenue | null
  /** 主教练嵌套对象（事件详情 API 返回） */
  home_coach?: BsEventCoach | null
  /** 客教练嵌套对象（事件详情 API 返回） */
  away_coach?: BsEventCoach | null
  event_date: string
  status: string
  replaced_by: number | null
  round_number: number | null
  round_name: string
  group_name: string | null
  period: string
  current_minute: number | null
  home_score: number | null
  away_score: number | null
  home_score_ht: number | null
  away_score_ht: number | null
  penalty_shootout: number | null
  extra_time_score: string | null
  is_local_derby: boolean
  is_neutral_ground: boolean
  travel_distance_km: number | null
  weather: BsWeather | null
  pitch_condition: string | null
  attendance: number | null
  live_websocket: boolean
  highlights: string[]
  head_to_head: unknown | null
}

export interface BsIncidents {
  event_id: number
  incidents: BsIncident[]
}

export interface BsIncident {
  id?: number
  minute: number
  extra_time: number | null
  player_id: number | null
  /** BSD 实际字段名为 `player`（非 player_name） */
  player?: string
  /** 部分场景使用 player_name 字段名（兼容保留） */
  player_name?: string
  type: string
  detail?: string
  goal_type?: string | null
  card_type?: string | null
  assist_player_name: string | null
  body_part: string | null
  situation: string | null
  team?: string
  team_id?: number | null
  home_score?: number | null
  away_score?: number | null
  reason?: string | null
  related_incident_id: number | null
  comments: string | null
  extended: boolean
  expanded: boolean
  /** 是否主队事件（部分比赛类型下必填） */
  is_home?: boolean
  /** 换人：换上球员 ID */
  player_in_id?: number | null
  /** 换人：换上球员姓名 */
  player_in?: string | null
}

export interface BsLineups {
  event_id: number
  lineup_status: string
  beta: boolean
  lineups: {
    home: BsLineupSide
    away: BsLineupSide
  }
}

export interface BsLineupSide {
  team_id: number
  team_name: string
  formation: string
  confidence: number
  players: BsLineupPlayer[]
  /** 替补球员（部分联赛会单独返回） */
  substitutes?: BsLineupPlayer[]
}

export interface BsLineupPlayer {
  id: number
  name: string
  short_name: string
  position: string
  jersey_number: number | null
  ai_score: number
}

export interface BsStats {
  event_id: number
  stats: BsStatsData
  shotmap: BsShotmap[]
  momentum: BsMomentum[]
  average_positions: unknown
  xg_per_minute: BsXgPerMinute[]
}

export interface BsStatsData {
  home: Record<string, BsStatValue>
  away: Record<string, BsStatValue>
}

export interface BsStatValue {
  actual: number | null
  expected?: number
  rank?: number
}

export interface BsShotmap {
  id: number
  event_id: number
  match_minute: number
  match_time_seconds: number
  time_type: string
  time_extra_minutes: number | null
  time_seconds: number
  time_label: string
  team: string
  team_id: number
  player_id: number
  player_name: string
  shot_type: string
  situation: string
  body_part: string
  goal_type: string | null
  outcome: string
  xg: number
  xg_final: number | null
  goals_in_xg: number
  goal_team_id: number | null
  block_xg: number | null
  block_onside_xg: number | null
  block_outcome: string | null
  shot_angle: number | null
  shot_angle_final: number | null
  ground: string | null
  coordinates_x: number | null
  coordinates_y: number | null
  coordinates_goalkeeper_x: number | null
  coordinates_goalkeeper_y: number | null
  coordinates_z: number | null
  coordinates_goalkeeper_z: number | null
}

export interface BsMomentum {
  event_id: number
  match_minute: number
  match_time_seconds: number
  time_type: string
  momentum: number
}

export interface BsXgPerMinute {
  event_id: number
  match_minute: number
  match_time_seconds: number
  time_type: string
  team: string
  team_id: number
  xg: number
  xg_cumulative: number
  goals: number
  goals_cumulative: number
}

// Paginated response wrapper
export interface BsPaginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * BSD 实时赛事接口的响应结构（注意字段名为 `events` 而非 `results`）
 * 端点：`/api/v2/events/live/`
 * 该端点无分页，仅返回当前进行中的赛事列表
 */
export interface BsLiveEventsResponse {
  count: number
  events: BsEvent[]
}

// ==================== 场馆相关 ====================

/** BSD 场馆列表项 */
export interface BsVenue {
  id: number
  name: string
  city: string
  country: string
  country_code: string
  capacity: number | null
  latitude: number | null
  longitude: number | null
  pitch_length_m: number | null
  pitch_width_m: number | null
  built_year: number | null
  home_team_id: number | null
}

/** BSD 场馆详情（含赛事分配） */
export interface BsVenueDetail extends BsVenue {
  competition_assignments: unknown[]
}

/** BSD 裁判详情（/api/v2/referees/{id}/） */
export interface BsRefereeDetail {
  id: number
  name: string
  country: string
  nationality_a3: string
  birthdate: string | null
  matches: number
  total_yellow_cards: number
  total_red_cards: number
  avg_yellow_per_match: number
  avg_red_per_match: number
  avg_goals_per_match: number
  avg_fouls_per_match: number
  career_games: number
  career_yellow_cards: number
  career_red_cards: number
}

// ==================== 球员相关 ====================

/** BSD 球员列表项 */
export interface BsPlayer {
  id: number
  name: string
  short_name: string
  position: string
  specific_position: string
  jersey_number: number | null
  date_of_birth: string | null
  height_cm: number | null
  weight_kg: number | null
  preferred_foot: string
  nationality: string
  current_team_id: number | null
  national_team_id: number | null
  market_value_eur: number | null
  contract_until: string | null
  availability: string
  attributes: unknown
  strengths: string[]
  weaknesses: string[]
  rating: number | null
  potential: string | null
  injury_risk: string | null
  wage_eur_annual: number | null
}

/** BSD 球员赛季统计（逐场） */
export interface BsPlayerStats {
  id: number
  player_id: number
  event_id: number
  team_id: number
  minutes_played: number
  rating: number | null
  touches: number | null
  goals: number
  goal_assist: number
  expected_goals: number | null
  expected_assists: number | null
  total_shots: number | null
  shots_on_target: number | null
  key_pass: number | null
  total_pass: number | null
  accurate_pass: number | null
  total_long_balls: number | null
  accurate_long_balls: number | null
  total_cross: number | null
  accurate_cross: number | null
  total_contest: number | null
  won_contest: number | null
  duel_won: number | null
  duel_lost: number | null
  aerial_won: number | null
  aerial_lost: number | null
  total_tackle: number | null
  won_tackle: number | null
  total_clearance: number | null
  interception: number | null
  ball_recovery: number | null
  blocked_scoring_attempt: number | null
  dispossessed: number | null
  possession_lost: number | null
  was_fouled: number | null
  fouls: number | null
  yellow_card: number
  red_card: number
  saves: number | null
  goals_conceded: number | null
  punches: number | null
}

/** BSD 单场球员统计响应 */
export interface BsEventPlayerStats {
  event_id: number
  count: number
  player_stats: BsPlayerStats[]
}

/** BSD 球员转会记录 */
export interface BsPlayerTransfer {
  player_id: number
  count: number
  transfers: unknown[]
}

// ==================== 交锋记录 ====================

/** BSD 交锋记录 */
export interface BsH2H {
  total_matches: number
  home_wins: number
  draws: number
  away_wins: number
  home_goals: number
  away_goals: number
  avg_total_goals: number
  home_win_rate: number
  away_win_rate: number
  recent_matches: BsH2HMatch[]
}

/** BSD 交锋记录中的单场比赛 */
export interface BsH2HMatch {
  home: string
  away: string
  date: string
  score: string
}

// ==================== 赛事元数据 ====================

/** BSD 赛事元数据 */
export interface BsEventMetadata {
  event_id: number
  jerseys: BsJerseys
  funfacts: BsFunFact[]
  ai_preview: string | null
}

/** 球衣颜色 */
export interface BsJerseys {
  home: BsJerseySide
  away: BsJerseySide
}

/** 单侧球衣 */
export interface BsJerseySide {
  GK: BsJerseyKit
  player: BsJerseyKit
}

/** 球衣套装 */
export interface BsJerseyKit {
  base: string
  real: boolean
  type: string
  number: string
  sleeve: string
}

/** 趣味事实 */
export interface BsFunFact {
  type_id: number
  sentence: string
}

// ==================== 赔率对比 ====================

/** BSD 博彩公司赔率对比 */
export interface BsOddsComparison {
  event_id: number
  event_date: string
  league_id: number
  league_name: string
  home_team_id: number
  home_team: string
  away_team_id: number
  away_team: string
  bookmakers_count: number
  total_odds: number
  markets: Record<string, BsOddsComparisonMarket>
}

/** 赔率对比市场 */
export interface BsOddsComparisonMarket {
  [outcome: string]: BsOddsComparisonOutcome
}

/** 赔率对比结果 */
export interface BsOddsComparisonOutcome {
  outcome: string
  line: number | null
  outcome_name: string
  best_odds: number
  best_bookmaker_slug: string
  best_bookmaker_name: string
  bookmakers: Record<string, BsBookmakerOdds>
}

/** 单个博彩公司赔率 */
export interface BsBookmakerOdds {
  decimal_odds: number
  movement: string
  updated_at: string
}

// ==================== 社交媒体 ====================

/** BSD 社交媒体内容 */
export interface BsSocial {
  count: number
  next: string | null
  previous: string | null
  results: BsSocialItem[]
}

/** 社交媒体条目 */
export interface BsSocialItem {
  id: number
  type: string
  url: string
  text: string
  title: string
  thumbnail: string
  media: unknown[]
  account: BsSocialAccount
  published_at: string
  linked: BsSocialLinked
}

/** 社交媒体账号 */
export interface BsSocialAccount {
  handle: string
  name: string
  verified: boolean
}

/** 社交媒体关联实体 */
export interface BsSocialLinked {
  teams: { id: number; name: string }[]
  events: { id: number; home_team: string; away_team: string; event_date: string }[]
  players: unknown[]
  managers: unknown[]
}

// ==================== 转播信息 ====================

/** BSD 转播信息 */
export interface BsBroadcast {
  id: number
  event_id: number
  home_team_id: number
  home_team: string
  away_team_id: number
  away_team: string
  league_id: number
  league_name: string
  event_date: string
  country_code: string
  channel_id: number
  channel_name: string
  channel_link: string
  scheduled_start_time: string
}

// ==================== 博彩公司 ====================

/** BSD 博彩公司 */
export interface BsBookmaker {
  slug: string
  name: string
}

// ==================== 联赛赛季 ====================

/** BSD 联赛赛季列表 */
export interface BsLeagueSeasons {
  league_id: number
  count: number
  seasons: BsSeason[]
}

/** BSD 赛季 */
export interface BsSeason {
  id: number
  name: string
  year: number
  start_date: string
  end_date: string
  is_current: boolean
}
