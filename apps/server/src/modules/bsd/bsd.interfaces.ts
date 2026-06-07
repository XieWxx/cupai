export interface BsEvent {
  id: number
  league_id: number
  season_id: number
  home_team_id: number
  home_team: string
  away_team_id: number
  away_team: string
  home_coach_id: number | null
  away_coach_id: number | null
  referee_id: number | null
  venue_id: number | null
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

export interface BsWeather {
  code: number | null
  description: string | null
  wind_speed: number | null
  temperature_c: number | null
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

export interface BsPrediction {
  id: number
  created_at: string
  event: BsPredictionEvent
  markets: BsPredictionMarkets
  recommendations: BsPredictionRecommendations
  model: BsPredictionModel
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
  season: BsStandingSeason
  grouped: boolean
  standings: BsStandingRow[]
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
  league_id: number
  season_id: number
  home_team_id: number
  home_team: string
  away_team_id: number
  away_team: string
  home_coach_id: number | null
  away_coach_id: number | null
  referee_id: number | null
  venue_id: number | null
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
  id: number
  minute: number
  extra_time: number | null
  player_id: number
  player_name: string
  type: string
  detail: string
  goal_type: string | null
  card_type?: string | null
  assist_player_name: string | null
  body_part: string | null
  situation: string | null
  team: string
  team_id: number
  home_score: number | null
  away_score: number | null
  reason: string | null
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
