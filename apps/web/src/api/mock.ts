/**
 * 前端 Mock 数据层（开发期 / 后端未启动时使用）
 *
 * 用法：
 *  1. 需要使用 mock 时，在 apps/web/.env 中设置 VITE_USE_MOCK=true
 *  2. 默认关闭 mock，所有请求走真实后端
 */
import type { AxiosRequestConfig } from 'axios'

// ============ 是否启用 mock（默认关闭，确保前端使用后端真实数据） ============
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ============ 共享类型 ============
interface MockTeam {
  id: string
  name: string
  shortName: string
  countryCode: string
  group?: string
  worldRanking?: number
}

interface MockMatch {
  id: string
  homeTeam: MockTeam
  awayTeam: MockTeam
  homeScore: number | null
  awayScore: number | null
  status: 'live' | 'upcoming' | 'finished'
  matchMinute?: string
  startTime: string
  leagueName: string
  stage: string
  venue?: string
  weather?: string
  referee?: string
  groupName?: string
  predictions: Record<string, Array<{ option: string; probability: number }>>
}

// ============ 静态数据：2026 世界杯 48 支参赛球队（核心热门队 32 支，覆盖主要大洲） ============
export const TEAMS: MockTeam[] = [
  // A 组
  { id: 'usa', name: 'United States', shortName: 'USA', countryCode: 'us', group: 'A', worldRanking: 11 },
  { id: 'can', name: 'Canada', shortName: 'CAN', countryCode: 'ca', group: 'A', worldRanking: 42 },
  { id: 'mex', name: 'Mexico', shortName: 'MEX', countryCode: 'mx', group: 'A', worldRanking: 15 },
  { id: 'pan', name: 'Panama', shortName: 'PAN', countryCode: 'pa', group: 'A', worldRanking: 54 },
  // B 组
  { id: 'bra', name: 'Brazil', shortName: 'BRA', countryCode: 'br', group: 'B', worldRanking: 5 },
  { id: 'arg', name: 'Argentina', shortName: 'ARG', countryCode: 'ar', group: 'B', worldRanking: 1 },
  { id: 'jpn', name: 'Japan', shortName: 'JPN', countryCode: 'jp', group: 'B', worldRanking: 18 },
  { id: 'aus', name: 'Australia', shortName: 'AUS', countryCode: 'au', group: 'B', worldRanking: 24 },
  // C 组
  { id: 'fra', name: 'France', shortName: 'FRA', countryCode: 'fr', group: 'C', worldRanking: 2 },
  { id: 'eng', name: 'England', shortName: 'ENG', countryCode: 'gb-eng', group: 'C', worldRanking: 4 },
  { id: 'ger', name: 'Germany', shortName: 'GER', countryCode: 'de', group: 'C', worldRanking: 3 },
  { id: 'esp', name: 'Spain', shortName: 'ESP', countryCode: 'es', group: 'C', worldRanking: 8 },
  // D 组
  { id: 'por', name: 'Portugal', shortName: 'POR', countryCode: 'pt', group: 'D', worldRanking: 6 },
  { id: 'ned', name: 'Netherlands', shortName: 'NED', countryCode: 'nl', group: 'D', worldRanking: 7 },
  { id: 'ita', name: 'Italy', shortName: 'ITA', countryCode: 'it', group: 'D', worldRanking: 9 },
  { id: 'bihs', name: 'Bosnia', shortName: 'BIH', countryCode: 'ba', group: 'D', worldRanking: 38 },
  // E 组
  { id: 'kor', name: 'South Korea', shortName: 'KOR', countryCode: 'kr', group: 'E', worldRanking: 23 },
  { id: 'chr', name: 'Costa Rica', shortName: 'CRC', countryCode: 'cr', group: 'E', worldRanking: 32 },
  { id: 'mar', name: 'Morocco', shortName: 'MAR', countryCode: 'ma', group: 'E', worldRanking: 13 },
  { id: 'egp', name: 'Egypt', shortName: 'EGY', countryCode: 'eg', group: 'E', worldRanking: 30 },
  // F 组
  { id: 'col', name: 'Colombia', shortName: 'COL', countryCode: 'co', group: 'F', worldRanking: 4 },
  { id: 'uru', name: 'Uruguay', shortName: 'URU', countryCode: 'uy', group: 'F', worldRanking: 10 },
  { id: 'nga', name: 'Nigeria', shortName: 'NGA', countryCode: 'ng', group: 'F', worldRanking: 28 },
  { id: 'sen', name: 'Senegal', shortName: 'SEN', countryCode: 'sn', group: 'F', worldRanking: 26 },
  // G 组
  { id: 'bel', name: 'Belgium', shortName: 'BEL', countryCode: 'be', group: 'G', worldRanking: 2 },
  { id: 'croatia', name: 'Croatia', shortName: 'CRO', countryCode: 'hr', group: 'G', worldRanking: 12 },
  { id: 'srbsia', name: 'Serbia', shortName: 'SRB', countryCode: 'rs', group: 'G', worldRanking: 20 },
  { id: 'jor', name: 'Jordan', shortName: 'JOR', countryCode: 'jo', group: 'G', worldRanking: 55 },
  // H 组
  { id: 'dnk', name: 'Denmark', shortName: 'DEN', countryCode: 'dk', group: 'H', worldRanking: 21 },
  { id: 'sui', name: 'Switzerland', shortName: 'SUI', countryCode: 'ch', group: 'H', worldRanking: 14 },
  { id: 'swe', name: 'Sweden', shortName: 'SWE', countryCode: 'se', group: 'H', worldRanking: 17 },
  { id: 'irns', name: 'Iran', shortName: 'IRN', countryCode: 'ir', group: 'H', worldRanking: 22 },
  // I 组
  { id: 'tur', name: 'Turkey', shortName: 'TUR', countryCode: 'tr', group: 'I', worldRanking: 25 },
  { id: 'ukr', name: 'Ukraine', shortName: 'UKR', countryCode: 'ua', group: 'I', worldRanking: 27 },
  { id: 'cze', name: 'Czechia', shortName: 'CZE', countryCode: 'cz', group: 'I', worldRanking: 29 },
  { id: 'sco', name: 'Scotland', shortName: 'SCO', countryCode: 'gb-sct', group: 'I', worldRanking: 36 },
  // J 组
  { id: 'cmr', name: 'Cameroon', shortName: 'CMR', countryCode: 'cm', group: 'J', worldRanking: 35 },
  { id: 'gha', name: 'Ghana', shortName: 'GHA', countryCode: 'gh', group: 'J', worldRanking: 45 },
  { id: 'tun', name: 'Tunisia', shortName: 'TUN', countryCode: 'tn', group: 'J', worldRanking: 31 },
  { id: 'alg', name: 'Algeria', shortName: 'ALG', countryCode: 'dz', group: 'J', worldRanking: 40 },
  // K 组
  { id: 'qat', name: 'Qatar', shortName: 'QAT', countryCode: 'qa', group: 'K', worldRanking: 43 },
  { id: 'saudi', name: 'Saudi Arabia', shortName: 'KSA', countryCode: 'sa', group: 'K', worldRanking: 50 },
  { id: 'uae', name: 'UAE', shortName: 'UAE', countryCode: 'ae', group: 'K', worldRanking: 68 },
  { id: 'omn', name: 'Oman', shortName: 'OMN', countryCode: 'om', group: 'K', worldRanking: 72 },
  // L 组
  { id: 'ecu', name: 'Ecuador', shortName: 'ECU', countryCode: 'ec', group: 'L', worldRanking: 19 },
  { id: 'chi', name: 'Chile', shortName: 'CHI', countryCode: 'cl', group: 'L', worldRanking: 33 },
  { id: 'par', name: 'Paraguay', shortName: 'PAR', countryCode: 'py', group: 'L', worldRanking: 51 },
  { id: 'bol', name: 'Bolivia', shortName: 'BOL', countryCode: 'bo', group: 'L', worldRanking: 85 },
  // M 组
  { id: 'isr', name: 'Israel', shortName: 'ISR', countryCode: 'il', group: 'M', worldRanking: 34 },
  { id: 'grc', name: 'Greece', shortName: 'GRE', countryCode: 'gr', group: 'M', worldRanking: 41 },
  { id: 'hun', name: 'Hungary', shortName: 'HUN', countryCode: 'hu', group: 'M', worldRanking: 22 },
  { id: 'idn', name: 'Indonesia', shortName: 'IDN', countryCode: 'id', group: 'M', worldRanking: 130 },
]

const teamById = (id: string) => TEAMS.find((t) => t.id === id)!

// ============ 21 个分析维度 ============
const DIMENSION_KEYS = [
  'match_result', 'total_goal_level', 'half_full_result', 'exact_score',
  'first_half_goal', 'first_goal_team', 'last_goal_team', 'own_goal',
  'player_goal', 'stoppage_goal', 'clean_sheet', 'goal_odd_even',
  'normal_penalty', 'var_cancel_goal', 'extra_penalty_tournament',
  'red_card', 'yellow_total_level', 'yellow_compare',
  'corner_level', 'free_kick_goal', 'substitute_compare',
]

const DIM_OPTION_COUNTS: Record<string, number> = {
  match_result: 3, total_goal_level: 5, half_full_result: 9, exact_score: 5,
  first_half_goal: 2, first_goal_team: 3, last_goal_team: 3, own_goal: 2,
  player_goal: 2, stoppage_goal: 2, clean_sheet: 3, goal_odd_even: 2,
  normal_penalty: 2, var_cancel_goal: 2, extra_penalty_tournament: 2,
  red_card: 2, yellow_total_level: 3, yellow_compare: 3,
  corner_level: 3, free_kick_goal: 2, substitute_compare: 3,
}

const DIM_OPTION_KEYS: Record<string, string[]> = {
  match_result: ['home', 'draw', 'away'],
  total_goal_level: ['0', '1', '2', '3', '4+'],
  half_full_result: ['H-H', 'H-D', 'H-A', 'D-H', 'D-D', 'D-A', 'A-H', 'A-D', 'A-A'],
  exact_score: ['1-0', '2-1', '2-0', '1-1', '0-0'],
  first_half_goal: ['yes', 'no'],
  first_goal_team: ['home', 'away', 'none'],
  last_goal_team: ['home', 'away', 'none'],
  own_goal: ['yes', 'no'],
  player_goal: ['yes', 'no'],
  stoppage_goal: ['yes', 'no'],
  clean_sheet: ['home', 'away', 'none'],
  goal_odd_even: ['odd', 'even'],
  normal_penalty: ['yes', 'no'],
  var_cancel_goal: ['yes', 'no'],
  extra_penalty_tournament: ['extra', 'penalty', 'normal'],
  red_card: ['yes', 'no'],
  yellow_total_level: ['0', '1-2', '3+'],
  yellow_compare: ['home', 'away', 'equal'],
  corner_level: ['0-3', '4-6', '7+'],
  free_kick_goal: ['yes', 'no'],
  substitute_compare: ['home', 'away', 'equal'],
}

function randn(): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function dist(count: number, homeBias: number, base: number = 0.4): Array<{ option: string; probability: number }> {
  const options = Array.from({ length: count }, (_, i) => `opt_${i}`)
  const weights = options.map((_, i) => {
    const center = count === 1 ? 0 : (i / (count - 1)) * 2 - 1
    const noise = randn() * 0.15
    const z = -((center - homeBias) ** 2) + base + noise
    return Math.max(0.02, Math.exp(z))
  })
  const sum = weights.reduce((a, b) => a + b, 0)
  return options.map((option, i) => ({ option, probability: Number((weights[i] / sum).toFixed(3)) }))
}

// ============ 生成 21 维度预测 ============
export function genPredictions(homeBias: number): Record<string, Array<{ option: string; probability: number }>> {
  const out: Record<string, Array<{ option: string; probability: number }>> = {}
  for (const dimKey of DIMENSION_KEYS) {
    const n = DIM_OPTION_COUNTS[dimKey]
    const opts = DIM_OPTION_KEYS[dimKey]
    const seedBias = homeBias + ((dimKey.length % 7) - 3) * 0.05
    const probs = dist(n, seedBias, 0.5)
    out[dimKey] = probs.map((p, i) => ({ option: opts[i], probability: p.probability }))
  }
  return out
}

// ============ 32 场 Mock 比赛（live 4 / upcoming 12 / finished 16） ============
export const MATCHES: MockMatch[] = [
  // === LIVE (4) ===
  {
    id: 'live-1', status: 'live', matchMinute: "67'",
    homeTeam: teamById('bra'), awayTeam: teamById('arg'),
    homeScore: 2, awayScore: 1,
    startTime: new Date(Date.now() - 67 * 60 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Final', groupName: 'Final',
    venue: 'MetLife Stadium · East Rutherford', weather: 'Clear · 24°C', referee: 'Antonio Mateu Lahoz',
    predictions: genPredictions(0.55),
  },
  {
    id: 'live-2', status: 'live', matchMinute: "34'",
    homeTeam: teamById('fra'), awayTeam: teamById('eng'),
    homeScore: 0, awayScore: 0,
    startTime: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Semi-final', groupName: 'SF',
    venue: 'AT&T Stadium · Dallas', weather: 'Cloudy · 19°C', referee: 'Daniele Orsato',
    predictions: genPredictions(0.1),
  },
  {
    id: 'live-3', status: 'live', matchMinute: "78'",
    homeTeam: teamById('ger'), awayTeam: teamById('esp'),
    homeScore: 1, awayScore: 2,
    startTime: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Semi-final', groupName: 'SF',
    venue: 'Hard Rock Stadium · Miami', weather: 'Rain · 28°C', referee: 'Clement Turpin',
    predictions: genPredictions(-0.1),
  },
  {
    id: 'live-4', status: 'live', matchMinute: "12'",
    homeTeam: teamById('usa'), awayTeam: teamById('can'),
    homeScore: 0, awayScore: 0,
    startTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', groupName: 'A',
    venue: 'SoFi Stadium · Los Angeles', weather: 'Sunny · 27°C', referee: 'Michael Oliver',
    predictions: genPredictions(0.3),
  },
  // === UPCOMING (12) ===
  {
    id: 'up-1', status: 'upcoming',
    homeTeam: teamById('kor'), awayTeam: teamById('jpn'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Round of 16', groupName: 'R16',
    venue: 'MetLife Stadium · East Rutherford', weather: 'Clear · 22°C',
    predictions: genPredictions(-0.1),
  },
  {
    id: 'up-2', status: 'upcoming',
    homeTeam: teamById('por'), awayTeam: teamById('ned'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Round of 16', groupName: 'R16',
    venue: 'Gillette Stadium · Foxborough', weather: 'Cloudy · 16°C',
    predictions: genPredictions(0.05),
  },
  {
    id: 'up-3', status: 'upcoming',
    homeTeam: teamById('mar', {} as MockTeam), awayTeam: teamById('col'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Round of 16', groupName: 'R16',
    venue: 'BMO Field · Toronto', weather: 'Clear · 14°C',
    predictions: genPredictions(-0.3),
  },
  {
    id: 'up-4', status: 'upcoming',
    homeTeam: teamById('uru'), awayTeam: teamById('chr'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Round of 16', groupName: 'R16',
    venue: 'Banc of California Stadium · LA', weather: 'Clear · 20°C',
    predictions: genPredictions(0.2),
  },
  {
    id: 'up-5', status: 'upcoming',
    homeTeam: teamById('mex'), awayTeam: teamById('can'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 16 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', groupName: 'A',
    venue: 'Estadio Azteca · Mexico City', weather: 'Clear · 22°C',
    predictions: genPredictions(0.15),
  },
  {
    id: 'up-6', status: 'upcoming',
    homeTeam: teamById('bel'), awayTeam: teamById('croatia'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', groupName: 'G',
    venue: 'NRG Stadium · Houston', weather: 'Clear · 30°C',
    predictions: genPredictions(-0.05),
  },
  {
    id: 'up-7', status: 'upcoming',
    homeTeam: teamById('ita'), awayTeam: teamById('bihs'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', groupName: 'D',
    venue: 'Levi\'s Stadium · Santa Clara', weather: 'Sunny · 25°C',
    predictions: genPredictions(0.4),
  },
  {
    id: 'up-8', status: 'upcoming',
    homeTeam: teamById('dnk', {} as MockTeam), awayTeam: teamById('sui'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', groupName: 'H',
    venue: 'BMO Field · Toronto', weather: 'Rain · 12°C',
    predictions: genPredictions(0),
  },
  {
    id: 'up-9', status: 'upcoming',
    homeTeam: teamById('swe'), awayTeam: teamById('irns'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 32 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', groupName: 'H',
    venue: 'Mercedes-Benz Stadium · Atlanta', weather: 'Clear · 21°C',
    predictions: genPredictions(0.3),
  },
  {
    id: 'up-10', status: 'upcoming',
    homeTeam: teamById('tur'), awayTeam: teamById('ukr'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', groupName: 'I',
    venue: 'Gillette Stadium · Foxborough', weather: 'Cloudy · 15°C',
    predictions: genPredictions(-0.2),
  },
  {
    id: 'up-11', status: 'upcoming',
    homeTeam: teamById('cmr'), awayTeam: teamById('gha'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 40 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', groupName: 'J',
    venue: 'Hard Rock Stadium · Miami', weather: 'Clear · 29°C',
    predictions: genPredictions(0.1),
  },
  {
    id: 'up-12', status: 'upcoming',
    homeTeam: teamById('qat'), awayTeam: teamById('saudi'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', groupName: 'K',
    venue: 'SoFi Stadium · Los Angeles', weather: 'Sunny · 26°C',
    predictions: genPredictions(-0.1),
  },
  // === FINISHED (16) ===
  {
    id: 'fin-1', status: 'finished',
    homeTeam: teamById('bra'), awayTeam: teamById('fra'),
    homeScore: 1, awayScore: 0,
    startTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD2', groupName: 'A',
    venue: 'MetLife Stadium', weather: 'Clear',
    predictions: genPredictions(0.4),
  },
  {
    id: 'fin-2', status: 'finished',
    homeTeam: teamById('arg'), awayTeam: teamById('ger'),
    homeScore: 3, awayScore: 2,
    startTime: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD2', groupName: 'B',
    venue: 'AT&T Stadium', weather: 'Cloudy',
    predictions: genPredictions(0.6),
  },
  {
    id: 'fin-3', status: 'finished',
    homeTeam: teamById('usa'), awayTeam: teamById('eng'),
    homeScore: 1, awayScore: 1,
    startTime: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'C',
    venue: 'SoFi Stadium', weather: 'Clear',
    predictions: genPredictions(0.05),
  },
  {
    id: 'fin-4', status: 'finished',
    homeTeam: teamById('jpn'), awayTeam: teamById('aus'),
    homeScore: 2, awayScore: 0,
    startTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'B',
    venue: 'BMO Field · Toronto', weather: 'Rain · 13°C',
    predictions: genPredictions(0.2),
  },
  {
    id: 'fin-5', status: 'finished',
    homeTeam: teamById('esp'), awayTeam: teamById('ita'),
    homeScore: 4, awayScore: 1,
    startTime: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'D',
    venue: 'Levi\'s Stadium', weather: 'Sunny · 26°C',
    predictions: genPredictions(0.5),
  },
  {
    id: 'fin-6', status: 'finished',
    homeTeam: teamById('ned'), awayTeam: teamById('por'),
    homeScore: 2, awayScore: 2,
    startTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'D',
    venue: 'Banc of California Stadium', weather: 'Clear',
    predictions: genPredictions(0.05),
  },
  {
    id: 'fin-7', status: 'finished',
    homeTeam: teamById('kor'), awayTeam: teamById('chr'),
    homeScore: 1, awayScore: 0,
    startTime: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'E',
    venue: 'NRG Stadium', weather: 'Clear · 31°C',
    predictions: genPredictions(0.3),
  },
  {
    id: 'fin-8', status: 'finished',
    homeTeam: teamById('egp'), awayTeam: teamById('mar'),
    homeScore: 0, awayScore: 1,
    startTime: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'E',
    venue: 'Hard Rock Stadium', weather: 'Sunny · 30°C',
    predictions: genPredictions(-0.2),
  },
  {
    id: 'fin-9', status: 'finished',
    homeTeam: teamById('col'), awayTeam: teamById('nga'),
    homeScore: 3, awayScore: 1,
    startTime: new Date(Date.now() - 42 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'F',
    venue: 'Gillette Stadium', weather: 'Cloudy · 17°C',
    predictions: genPredictions(0.5),
  },
  {
    id: 'fin-10', status: 'finished',
    homeTeam: teamById('sen'), awayTeam: teamById('uru'),
    homeScore: 1, awayScore: 2,
    startTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'F',
    venue: 'BMO Field · Toronto', weather: 'Rain · 11°C',
    predictions: genPredictions(-0.3),
  },
  {
    id: 'fin-11', status: 'finished',
    homeTeam: teamById('bel'), awayTeam: teamById('srbsia'),
    homeScore: 2, awayScore: 1,
    startTime: new Date(Date.now() - 54 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'G',
    venue: 'AT&T Stadium', weather: 'Clear · 28°C',
    predictions: genPredictions(0.4),
  },
  {
    id: 'fin-12', status: 'finished',
    homeTeam: teamById('sui'), awayTeam: teamById('swe'),
    homeScore: 1, awayScore: 1,
    startTime: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'H',
    venue: 'MetLife Stadium', weather: 'Clear · 23°C',
    predictions: genPredictions(0.0),
  },
  {
    id: 'fin-13', status: 'finished',
    homeTeam: teamById('croatia'), awayTeam: teamById('dnk'),
    homeScore: 0, awayScore: 2,
    startTime: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'G',
    venue: 'NRG Stadium', weather: 'Sunny · 29°C',
    predictions: genPredictions(-0.4),
  },
  {
    id: 'fin-14', status: 'finished',
    homeTeam: teamById('tur'), awayTeam: teamById('cze'),
    homeScore: 3, awayScore: 0,
    startTime: new Date(Date.now() - 84 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'I',
    venue: 'Levi\'s Stadium', weather: 'Sunny · 27°C',
    predictions: genPredictions(0.6),
  },
  {
    id: 'fin-15', status: 'finished',
    homeTeam: teamById('ecu'), awayTeam: teamById('chi'),
    homeScore: 2, awayScore: 1,
    startTime: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'L',
    venue: 'Banc of California Stadium', weather: 'Clear · 24°C',
    predictions: genPredictions(0.3),
  },
  {
    id: 'fin-16', status: 'finished',
    homeTeam: teamById('can'), awayTeam: teamById('pan'),
    homeScore: 1, awayScore: 0,
    startTime: new Date(Date.now() - 108 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', groupName: 'A',
    venue: 'BMO Field · Toronto', weather: 'Rain · 10°C',
    predictions: genPredictions(0.2),
  },
]

// ============ Mock 排行榜数据 ============
const NICKNAMES = [
  'TacticalMind', 'FootballOracle', 'TifoKing', 'GoalPredictor', 'MatchMaster',
  'PitchVision', 'CornerWizard', 'RedCardSage', 'VARwhisperer', 'StrikerAI',
  'MidfieldGenius', 'DefenderLogic',
]
const REGIONS = ['us', 'ca', 'mx', 'bra', 'ar', 'fr', 'gb-eng', 'de', 'es', 'jp', 'kr', 'pt', 'nl', 'it', 'co', 'cl']
const PLATFORMS = [
  { name: 'ChatGPT', value: 'chatgpt' },
  { name: 'Claude', value: 'claude' },
  { name: 'DeepSeek', value: 'deepseek' },
  { name: 'Cursor', value: 'cursor' },
  { name: 'Qwen', value: 'qwen' },
  { name: 'Gemini', value: 'gemini' },
]
const MODELS = [
  { name: 'GPT-4o', value: 'gpt-4o' },
  { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
  { name: 'DeepSeek V3', value: 'deepseek-v3' },
  { name: 'Qwen2.5-Max', value: 'qwen2.5-max' },
  { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
  { name: 'Llama 3.1 405B', value: 'llama-3.1-405b' },
]

function genUserRankings(sort: 'total' | 'exact' | 'funny') {
  const base = NICKNAMES.map((nick, i) => {
    const totalRate = 50 + (i * 3.7) % 45
    const exactRate = 5 + (i * 2.3) % 25
    const funnyRate = 60 + (i * 1.9) % 35
    return {
      id: `u${i + 1}`,
      userId: `uid_${i + 1}`,
      totalPredictions: 80 + (i * 13) % 200,
      exactMatches: 10 + Math.floor(exactRate),
      basicMatches: 40 + Math.floor(totalRate),
      totalScore: Math.floor(totalRate * 10 + exactRate * 5),
      accuracyRate: totalRate.toFixed(1),
      exactScoreRate: exactRate.toFixed(1),
      funnyDataRate: funnyRate.toFixed(1),
      flag: REGIONS[i % REGIONS.length],
      nickname: nick,
      avatar: '',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      defaultAiConfig: {
        modelName: MODELS[i % MODELS.length].value,
        apiEndpoint: PLATFORMS[i % PLATFORMS.length].value,
      },
    }
  })
  if (sort === 'exact') {
    base.sort((a, b) => Number(b.exactScoreRate) - Number(a.exactScoreRate))
  } else if (sort === 'funny') {
    base.sort((a, b) => Number(b.funnyDataRate) - Number(a.funnyDataRate))
  } else {
    base.sort((a, b) => Number(b.accuracyRate) - Number(a.accuracyRate))
  }
  return base.slice(0, 10)
}

function genModelRankings() {
  return MODELS.map((m, i) => ({
    modelName: m.name,
    modelValue: m.value,
    totalPredictions: 1000 + i * 234,
    avgAccuracy: (78 - i * 2.1).toFixed(1),
    totalScore: 5000 - i * 350,
  })).sort((a, b) => Number(b.avgAccuracy) - Number(a.avgAccuracy))
}

function pickTopConclusion(i: number): string {
  const conclusions = [
    `${['USA', 'BRA', 'FRA', 'GER', 'KOR', 'MEX'][i % 6]} 主场微占优，预测 2-1 小胜`,
    '双方近期状态接近，平局概率较高',
    `${['JPN', 'ENG', 'ESP', 'POR', 'MAR', 'COL'][i % 6]} 反击犀利，可能爆冷`,
    `${['ARG', 'ITA', 'NED', 'BEL', 'SEN', 'JPN'][i % 6]} 控球占优，角球数量预计 4-6 个`,
    '上半场进球可能性高，首球归属主队',
    '黄牌集中在中后场，两队黄牌数量持平',
  ]
  return conclusions[i % conclusions.length]
}

function genHotBriefs() {
  return MATCHES.filter(m => m.status !== 'upcoming').slice(0, 6).map((m, i) => ({
    id: `blog-${i + 1}`,
    matchId: m.id,
    teamA: m.homeTeam.name,
    teamB: m.awayTeam.name,
    teamAFlag: m.homeTeam.countryCode,
    teamBFlag: m.awayTeam.countryCode,
    leagueName: m.leagueName,
    conclusion: pickTopConclusion(i),
    accuracyRate: (62 + (i * 4.7) % 28).toFixed(1),
    analysisCount: 120 + i * 87,
    platform: PLATFORMS[i % PLATFORMS.length].name,
    createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
  }))
}

// ============ Mock 赛事详情 ============
export function genMatchDetail(id: string) {
  const m = MATCHES.find((x) => x.id === id)
  if (!m) return null
  const isLive = m.status === 'live'
  return {
    ...m,
    possession: { home: isLive ? 45 + Math.floor(Math.random() * 20) : Math.floor(Math.random() * 30) + 35, away: 0 },
    shots: { home: isLive ? 8 + Math.floor(Math.random() * 10) : 3 + Math.floor(Math.random() * 8), away: isLive ? 4 + Math.floor(Math.random() * 8) : 2 + Math.floor(Math.random() * 6) },
    shotsOnTarget: { home: 3 + Math.floor(Math.random() * 5), away: 1 + Math.floor(Math.random() * 4) },
    fouls: { home: 6 + Math.floor(Math.random() * 8), away: 8 + Math.floor(Math.random() * 8) },
    corners: { home: 2 + Math.floor(Math.random() * 5), away: 1 + Math.floor(Math.random() * 5) },
    lineup: {
      home: [
        'GK:Oblak', 'DEF:Carvajal', 'DEF:Rudiger', 'DEF:Achraf', 'DEF:Camavinga',
        'MID:Modric', 'MID:Bellingham', 'MID:Pedri', 'FWD:Vinicius', 'FWD:Lewandowski', 'FWD:Neymar',
      ],
      away: [
        'GK:Alisson', 'DEF:Danilo', 'DEF:Marquinhos', 'DEF:Bremer', 'DEF:Sandro',
        'MID:Casemiro', 'MID:Paqueta', 'MID:Endo', 'FWD:Raphinha', 'FWD:ViniciusJr', 'FWD:Richarlison',
      ],
    },
    events: isLive ? [
      { minute: 12, type: 'goal', team: 'home', player: 'Vinicius Jr.', assist: 'Modric' },
      { minute: 34, type: 'yellow', team: 'away', player: 'Casemiro' },
      { minute: 56, type: 'goal', team: 'away', player: 'Lewandowski', assist: 'Pedri' },
      { minute: 63, type: 'goal', team: 'home', player: 'Raphinha', assist: 'Bellingham' },
    ] : undefined,
  }
}

// ============ Mock 舆情数据 ============
function genSentiment() {
  return {
    overview: {
      totalPosts: 12480,
      positive: 5620,
      negative: 3240,
      neutral: 3620,
      overallScore: 0.18,
      overallLabel: 'slightly_positive',
    },
    timeline: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      positive: (Math.sin(h / 4) * 0.3 + Math.random() * 0.2).toFixed(3),
      negative: (Math.cos(h / 4) * 0.2 + Math.random() * 0.15).toFixed(3),
      neutral: (0.3 + Math.random() * 0.1).toFixed(3),
      volume: Math.floor(300 + Math.sin(h / 3) * 200 + Math.random() * 100),
    })),
    platforms: [
      { name: 'Twitter/X', value: 'twitter', count: 4520, positive: 2280, negative: 1340, neutral: 900 },
      { name: 'Weibo', value: 'weibo', count: 3180, positive: 1560, negative: 920, neutral: 700 },
      { name: 'Reddit', value: 'reddit', count: 2340, positive: 1080, negative: 620, neutral: 640 },
      { name: 'TikTok', value: 'tiktok', count: 1840, positive: 700, negative: 280, neutral: 860 },
      { name: 'Instagram', value: 'instagram', count: 600, positive: 0, negative: 80, neutral: 520 },
    ],
    languages: [
      { name: 'English', value: 'en', count: 5240 },
      { name: 'Spanish', value: 'es', count: 3180 },
      { name: 'Chinese', value: 'zh', count: 2340 },
      { name: 'French', value: 'fr', count: 1280 },
      { name: 'Arabic', value: 'ar', count: 440 },
    ],
    regions: [
      { name: 'North America', value: 'na', count: 4680 },
      { name: 'Europe', value: 'eu', count: 3920 },
      { name: 'South America', value: 'sa', count: 2340 },
      { name: 'Asia', value: 'asia', count: 1280 },
      { name: 'Africa', value: 'af', count: 260 },
    ],
    keywords: ['VAR', 'Messi', 'Penalty', 'Tactics', 'Set-piece', 'Offside', 'Goalkeeper', 'Counter-attack'],
    feeds: Array.from({ length: 20 }, (_, i) => ({
      id: `feed-${i + 1}`,
      platform: ['twitter', 'weibo', 'reddit', 'tiktok'][i % 4],
      content: [
        'What an incredible goal! The tactical shift in the second half was brilliant.',
        'Referee decision needs review. VAR should have intervened.',
        'This match exceeds all expectations. FIFA 2026 is delivering!',
        'The home team defense is too solid. Away team needs to adjust.',
        'Substitute changed the game completely. Coach made the right call.',
      ][i % 5],
      sentiment: i % 3 === 0 ? 'negative' : i % 3 === 1 ? 'positive' : 'neutral',
      likes: Math.floor(Math.random() * 500),
      createdAt: new Date(Date.now() - i * 1800000).toISOString(),
    })),
  }
}

// ============ Mock 公开指令 ============
function genInstructions() {
  return {
    list: [
      { id: 'inst-1', title: '世界杯预测指令', content: '请分析以下两支球队的历史交锋数据...', author: 'TacticalMind', platform: 'ChatGPT', uses: 1240 },
      { id: 'inst-2', title: '球员状态评估', content: '请基于以下数据评估球员的近期状态...', author: 'FootballOracle', platform: 'Claude', uses: 890 },
      { id: 'inst-3', title: '战术分析模板', content: '请分析双方的战术风格并给出预测...', author: 'TifoKing', platform: 'DeepSeek', uses: 670 },
      { id: 'inst-4', title: '点球预测指令', content: '基于历史数据，请预测本场比赛点球概率...', author: 'GoalPredictor', platform: 'ChatGPT', uses: 450 },
      { id: 'inst-5', title: '阵容深度评估', content: '请对比双方首发阵容的深度和实力...', author: 'MatchMaster', platform: 'Claude', uses: 380 },
    ],
    total: 5,
    page: 1,
    pageSize: 20,
    lastRefreshAt: new Date().toISOString(),
  }
}

// ============ 21 维度报告 Mock ============
function genDimensionReports(matchId: string) {
  const detail = genMatchDetail(matchId)
  if (!detail) return { list: [] }
  return {
    list: Object.entries(detail.predictions).map(([dimKey, arr]) => ({
      dimKey,
      dimensionName: {
        match_result: '赛果', total_goal_level: '总进球数', half_full_result: '半场/全场',
        exact_score: '精确比分', first_half_goal: '上半场进球', first_goal_team: '首球归属',
        last_goal_team: '末球归属', own_goal: '乌龙球', player_goal: '球员进球',
        stoppage_goal: '补时进球', clean_sheet: '零封', goal_odd_even: '进球奇偶',
        normal_penalty: '常规点球', var_cancel_goal: 'VAR改判', extra_penalty_tournament: '加时/点球大战',
        red_card: '红牌', yellow_total_level: '黄牌总数', yellow_compare: '黄牌对比',
        corner_level: '角球数', free_kick_goal: '任意球进球', substitute_compare: '换人对比',
      }[dimKey] || dimKey,
      options: arr,
      matchId,
    })),
  }
}

// ============ 小组积分榜 Mock ============
function genGroupStandings() {
  return {
    groups: [
      {
        name: 'A Group',
        teams: [
          { rank: 1, team: 'Brazil', code: 'br', played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 4, goalsAgainst: 1, goalDifference: 3, points: 6 },
          { rank: 2, team: 'Argentina', code: 'ar', played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 4 },
          { rank: 3, team: 'Japan', code: 'jp', played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 1 },
          { rank: 4, team: 'Australia', code: 'au', played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 0, goalsAgainst: 3, goalDifference: -3, points: 0 },
        ],
      },
      {
        name: 'B Group',
        teams: [
          { rank: 1, team: 'France', code: 'fr', played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6 },
          { rank: 2, team: 'England', code: 'gb-eng', played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 3 },
          { rank: 3, team: 'Germany', code: 'de', played: 2, won: 0, drawn: 2, lost: 0, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 2 },
          { rank: 4, team: 'Spain', code: 'es', played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 5, goalDifference: -4, points: 0 },
        ],
      },
      {
        name: 'C Group',
        teams: [
          { rank: 1, team: 'USA', code: 'us', played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 4 },
          { rank: 2, team: 'Mexico', code: 'mx', played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 3 },
          { rank: 3, team: 'Portugal', code: 'pt', played: 2, won: 0, drawn: 2, lost: 0, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 2 },
          { rank: 4, team: 'Netherlands', code: 'nl', played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 1 },
        ],
      },
    ],
  }
}

// ============ 小组赛赛程 Mock ============
function genGroupMatches() {
  return MATCHES.filter(m => m.groupName).map(m => ({
    id: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: m.status,
    startTime: m.startTime,
    venue: m.venue,
    groupName: m.groupName,
    matchMinute: m.matchMinute,
  }))
}

// ============ 淘汰赛 Mock ============
// 返回结构必须与后端 match.service.ts::getBracketData 完全一致：
//   { list: MatchEntity[], bracketStage: { r16, qf, sf, final } }
// 否则前端 bracketRes?.bracketStage 取不到，KnockoutBracket 一直显示空态。
function genBracket() {
  const liveMatches = MATCHES.filter(m => m.status === 'live')
  const roundOf16: any[] = [
    ...liveMatches.slice(0, 2),
    { id: 'r16-1', status: 'finished' as const, homeTeam: teamById('kor'), awayTeam: teamById('jpn'), homeScore: 2, awayScore: 1, startTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Round of 16', groupName: 'R16', predictions: genPredictions(0) },
    { id: 'r16-2', status: 'finished' as const, homeTeam: teamById('por'), awayTeam: teamById('ned'), homeScore: 3, awayScore: 2, startTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Round of 16', groupName: 'R16', predictions: genPredictions(0) },
    { id: 'r16-3', status: 'finished' as const, homeTeam: teamById('mar'), awayTeam: teamById('col'), homeScore: 1, awayScore: 0, startTime: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Round of 16', groupName: 'R16', predictions: genPredictions(0) },
    { id: 'r16-4', status: 'finished' as const, homeTeam: teamById('uru'), awayTeam: teamById('chr'), homeScore: 2, awayScore: 0, startTime: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Round of 16', groupName: 'R16', predictions: genPredictions(0) },
  ]
  const quarterFinals: any[] = [
    { id: 'qf-1', status: 'upcoming' as const, homeTeam: teamById('bra'), awayTeam: teamById('kor'), homeScore: null, awayScore: null, startTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Quarter-final', groupName: 'QF', predictions: genPredictions(0.3) },
    { id: 'qf-2', status: 'upcoming' as const, homeTeam: teamById('fra'), awayTeam: teamById('mar'), homeScore: null, awayScore: null, startTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Quarter-final', groupName: 'QF', predictions: genPredictions(-0.1) },
    { id: 'qf-3', status: 'upcoming' as const, homeTeam: teamById('arg'), awayTeam: teamById('uru'), homeScore: null, awayScore: null, startTime: new Date(Date.now() + 72 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Quarter-final', groupName: 'QF', predictions: genPredictions(0.2) },
    { id: 'qf-4', status: 'upcoming' as const, homeTeam: teamById('eng'), awayTeam: teamById('por'), homeScore: null, awayScore: null, startTime: new Date(Date.now() + 72 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Quarter-final', groupName: 'QF', predictions: genPredictions(0) },
  ]
  const semiFinals: any[] = [
    { id: 'sf-1', status: 'upcoming' as const, homeTeam: teamById('bra'), awayTeam: teamById('fra'), homeScore: null, awayScore: null, startTime: new Date(Date.now() + 120 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Semi-final', groupName: 'SF', predictions: genPredictions(0.1) },
    { id: 'sf-2', status: 'upcoming' as const, homeTeam: teamById('arg'), awayTeam: teamById('eng'), homeScore: null, awayScore: null, startTime: new Date(Date.now() + 144 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Semi-final', groupName: 'SF', predictions: genPredictions(-0.05) },
  ]
  const finalArr: any[] = [
    { id: 'final', status: 'upcoming' as const, homeTeam: teamById('bra'), awayTeam: teamById('arg'), homeScore: null, awayScore: null, startTime: new Date(Date.now() + 192 * 3600 * 1000).toISOString(), leagueName: '2026 FIFA World Cup', stage: 'Final', groupName: 'Final', predictions: genPredictions(0) },
  ]
  const list = [...roundOf16, ...quarterFinals, ...semiFinals, ...finalArr]
  return {
    list,
    // 关键：键名 r16/qf/sf/final 与真实后端 getBracketData 保持一致，
    // 同时对齐 KnockoutBracket.vue 中 r16/qf/sf/final 的取值。
    bracketStage: {
      r16: roundOf16,
      qf: quarterFinals,
      sf: semiFinals,
      final: finalArr,
    },
  }
}

// ============ URL 匹配与派发 ============
function parseReq(url: string, config?: AxiosRequestConfig) {
  const path = url.replace(/^.*?\/api\/v\d+\//, '').replace(/^\/+/, '')
  const params = (config?.params || {}) as Record<string, any>
  return { path, params }
}

export function findMock(method: string, url: string, config?: AxiosRequestConfig): any | undefined {
  if (!USE_MOCK) return undefined
  const m = method.toUpperCase()
  const { path, params } = parseReq(url, config)
  const p = path.replace(/^\/+/, '')

  // 1. 赛事列表
  if (m === 'GET' && /^(match|matches)(\/)?(\?|$)/.test(p)) {
    const status = params.status
    const list = status ? MATCHES.filter((x) => x.status === status) : MATCHES
    return { list, total: list.length }
  }

  // 2. 赛事动态（必须在赛事详情之前，否则会被详情正则误匹配）
  if (m === 'GET' && p.startsWith('match/dynamics')) {
    return {
      live: MATCHES.filter((x) => x.status === 'live'),
      upcoming: MATCHES.filter((x) => x.status === 'upcoming'),
      finished: MATCHES.filter((x) => x.status === 'finished'),
    }
  }

  // 3. 小组积分榜
  if (m === 'GET' && p.startsWith('match/standings')) {
    return genGroupStandings()
  }

  // 4. 小组赛赛程
  if (m === 'GET' && p.startsWith('match/group-matches')) {
    return { list: genGroupMatches() }
  }

  // 5. 淘汰赛
  if (m === 'GET' && p.startsWith('match/bracket')) {
    return genBracket()
  }

  // 6. 赛事预测（必须在赛事详情之前）
  const prediction = p.match(/^(?:match|matches)\/([^/]+)\/prediction$/)
  if (m === 'GET' && prediction) {
    const detail = genMatchDetail(prediction[1])
    if (!detail) return { list: [] }
    return {
      list: Object.entries(detail.predictions).map(([dimKey, arr]) => ({ dimKey, options: arr })),
    }
  }

  // 7. 赛事详情（排除所有子路径关键词，避免误匹配）
  const matchDetail = p.match(/^(?:match|matches)\/([^/?]+)$/)
  if (m === 'GET' && matchDetail) {
    const reserved = new Set(['dynamics', 'standings', 'group-matches', 'bracket'])
    if (reserved.has(matchDetail[1])) return undefined
    return genMatchDetail(matchDetail[1])
  }

  // 8. AI 热门简报
  if (m === 'GET' && p.startsWith('ranking/hot-briefs')) {
    return { list: genHotBriefs() }
  }

  // 9. 用户排行
  if (m === 'GET' && p.startsWith('ranking/users')) {
    const sort = (params.sort as 'total' | 'exact' | 'funny') || 'total'
    return { list: genUserRankings(sort) }
  }

  // 10. 大模型排行
  if (m === 'GET' && p.startsWith('ranking/models')) {
    return { list: genModelRankings() }
  }

  // 11. 热门 Agent 平台
  if (m === 'GET' && p.startsWith('ranking/platforms')) {
    return {
      list: PLATFORMS.map((pl, i) => ({
        platform: pl.name,
        platformValue: pl.value,
        userCount: 120 - i * 17,
      })),
    }
  }

  // 12. 舆情数据
  if (m === 'GET' && p.startsWith('sentiment/')) {
    return genSentiment()
  }

  // 13. 公开指令
  if (m === 'GET' && p.startsWith('agent/open/instructions')) {
    return genInstructions()
  }

  // 14. 用户信息/注册/登录
  if (m === 'POST' && p.startsWith('user/login')) {
    return {
      token: 'mock_token_12345',
      user: {
        id: 'mock-user-1',
        username: 'demo',
        nickname: 'Demo User',
        avatar: '',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        apiKey: 'sk-mock-abcdef123456',
      },
    }
  }

  if (m === 'POST' && p.startsWith('user/register')) {
    return {
      token: 'mock_token_new',
      user: {
        id: 'mock-user-new',
        username: 'newuser',
        nickname: 'New User',
        avatar: '',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        region: data?.region || 'us',
        apiKey: 'sk-mock-new789012',
      },
    }
  }

  if (m === 'GET' && p.startsWith('user/profile')) {
    return {
      id: 'mock-user-1',
      username: 'demo',
      nickname: 'Demo User',
      avatar: '',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      apiKey: 'sk-mock-abcdef123456',
    }
  }

  if (m === 'GET' && p.startsWith('analysis/hot-blogs')) {
    return { list: genHotBriefs() }
  }

  return undefined
}

export const isMockEnabled = () => USE_MOCK
