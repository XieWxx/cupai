/**
 * 前端 Mock 数据层（开发期 / 后端未启动时使用）
 *
 * 用法：
 *  1. 启动 `pnpm dev:web` 时只要 VITE_USE_MOCK !== 'false'，所有匹配到的 URL 走 mock
 *  2. 后端就绪后，在 apps/web/.env 中设置 VITE_USE_MOCK=false 即可关闭
 *
 * 设计要点：
 *  - 不动 axios，只在 http.* 入口做一次短路，命中 mock 时直接返回 data（与响应拦截器 unwrap 行为一致）
 *  - mock 数据需要保证：列表接口返回 { list, total }，详情接口返回完整对象
 */
import type { AxiosRequestConfig } from 'axios'

// ============ 是否启用 mock（默认启用，便于预览） ============
// 硬编码关闭 mock，全部走真实后端
const USE_MOCK = false

// ============ 共享类型 ============
interface MockTeam {
  id: string
  name: string
  shortName: string
  countryCode: string // ISO 3166-1 alpha-2，flag-icons 用
  logo?: string
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
  startTime: string // ISO
  leagueName: string
  stage: string
  venue?: string
  weather?: string
  referee?: string
  group?: string
  // 概率分布（按 dimKey）
  predictions: Record<string, Array<{ option: string; probability: number }>>
}

// ============ 静态数据：12 支世界杯热门球队 ============
export const TEAMS: MockTeam[] = [
  { id: 'bra', name: 'Brazil', shortName: 'BRA', countryCode: 'br', group: 'A', worldRanking: 5 },
  { id: 'arg', name: 'Argentina', shortName: 'ARG', countryCode: 'ar', group: 'A', worldRanking: 1 },
  { id: 'fra', name: 'France', shortName: 'FRA', countryCode: 'fr', group: 'B', worldRanking: 2 },
  { id: 'eng', name: 'England', shortName: 'ENG', countryCode: 'gb-eng', group: 'B', worldRanking: 4 },
  { id: 'ger', name: 'Germany', shortName: 'GER', countryCode: 'de', group: 'C', worldRanking: 3 },
  { id: 'esp', name: 'Spain', shortName: 'ESP', countryCode: 'es', group: 'C', worldRanking: 8 },
  { id: 'usa', name: 'United States', shortName: 'USA', countryCode: 'us', group: 'D', worldRanking: 11 },
  { id: 'mex', name: 'Mexico', shortName: 'MEX', countryCode: 'mx', group: 'D', worldRanking: 15 },
  { id: 'jpn', name: 'Japan', shortName: 'JPN', countryCode: 'jp', group: 'E', worldRanking: 18 },
  { id: 'kor', name: 'South Korea', shortName: 'KOR', countryCode: 'kr', group: 'E', worldRanking: 23 },
  { id: 'por', name: 'Portugal', shortName: 'POR', countryCode: 'pt', group: 'F', worldRanking: 6 },
  { id: 'ned', name: 'Netherlands', shortName: 'NED', countryCode: 'nl', group: 'F', worldRanking: 7 },
]

const teamById = (id: string) => TEAMS.find((t) => t.id === id)!

// ============ 21 个分析维度（与 PRD / copyInstruction.ts 对对齐） ============
// 必须在 MATCHES 之前定义（genPredictions 在 MATCHES 初始化时被调用）
const DIMENSION_KEYS = [
  // 板块一：赛果比分
  'match_result', 'total_goal_level', 'half_full_result', 'exact_score',
  // 板块二：进球细节
  'first_half_goal', 'first_goal_team', 'last_goal_team', 'own_goal',
  'player_goal', 'stoppage_goal', 'clean_sheet', 'goal_odd_even',
  // 板块三：点球/VAR/判罚
  'normal_penalty', 'var_cancel_goal', 'extra_penalty_tournament',
  // 板块四：红黄牌/犯规
  'red_card', 'yellow_total_level', 'yellow_compare',
  // 板块五：边角趣味
  'corner_level', 'free_kick_goal', 'substitute_compare',
]
// 21 个维度的候选项数量（用于生成分布）
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

// ============ 工具：生成 21 维度的概率分布 ============
/** 标准正态分布随机数（用于生成接近真实的概率分布） */
function randn(): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

/** 给定候选项数量和"主队偏向"系数（-1~1），生成近似正态的概率分布 */
function dist(count: number, homeBias: number, base: number = 0.4): Array<{ option: string; probability: number }> {
  const options = Array.from({ length: count }, (_, i) => `opt_${i}`)
  // 基础权重：受 homeBias 调控
  const weights = options.map((_, i) => {
    const center = count === 1 ? 0 : (i / (count - 1)) * 2 - 1 // -1..1
    const noise = randn() * 0.15
    const z = -((center - homeBias) ** 2) + base + noise
    return Math.max(0.02, Math.exp(z))
  })
  const sum = weights.reduce((a, b) => a + b, 0)
  return options.map((option, i) => ({ option, probability: Number((weights[i] / sum).toFixed(3)) }))
}

// ============ 9 场 Mock 比赛（含完整 21 维度预测） ============
export const MATCHES: MockMatch[] = [
  {
    id: 'm1', status: 'live', matchMinute: "67'",
    homeTeam: teamById('bra'), awayTeam: teamById('arg'),
    homeScore: 2, awayScore: 1,
    startTime: new Date(Date.now() - 67 * 60 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Final', group: 'Final',
    venue: 'MetLife Stadium · East Rutherford', weather: 'Clear · 24°C', referee: 'Antonio Mateu Lahoz',
    predictions: genPredictions(0.55), // 主队 BRA 微弱占优
  },
  {
    id: 'm2', status: 'live', matchMinute: "34'",
    homeTeam: teamById('fra'), awayTeam: teamById('eng'),
    homeScore: 0, awayScore: 0,
    startTime: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Semi-final', group: 'SF',
    venue: 'AT&T Stadium · Dallas', weather: 'Cloudy · 19°C', referee: 'Daniele Orsato',
    predictions: genPredictions(0.1), // 平局倾向
  },
  {
    id: 'm3', status: 'upcoming',
    homeTeam: teamById('usa'), awayTeam: teamById('mex'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Quarter-final', group: 'QF',
    venue: 'SoFi Stadium · Los Angeles', weather: 'Sunny · 27°C',
    predictions: genPredictions(0.3),
  },
  {
    id: 'm4', status: 'upcoming',
    homeTeam: teamById('ger'), awayTeam: teamById('esp'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', group: 'E',
    venue: 'Estadio Azteca · Mexico City', weather: 'Clear · 22°C',
    predictions: genPredictions(-0.2),
  },
  {
    id: 'm5', status: 'upcoming',
    homeTeam: teamById('jpn'), awayTeam: teamById('kor'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 9 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD3', group: 'F',
    venue: 'BC Place · Vancouver', weather: 'Rain · 14°C',
    predictions: genPredictions(0.0),
  },
  {
    id: 'm6', status: 'upcoming',
    homeTeam: teamById('por'), awayTeam: teamById('ned'),
    homeScore: null, awayScore: null,
    startTime: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Round of 16', group: 'R16',
    venue: 'Mercedes-Benz Stadium · Atlanta', weather: 'Clear · 23°C',
    predictions: genPredictions(-0.1),
  },
  {
    id: 'm7', status: 'finished',
    homeTeam: teamById('bra'), awayTeam: teamById('fra'),
    homeScore: 1, awayScore: 0,
    startTime: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD2', group: 'A',
    venue: 'MetLife Stadium', weather: 'Clear',
    predictions: genPredictions(0.4),
  },
  {
    id: 'm8', status: 'finished',
    homeTeam: teamById('arg'), awayTeam: teamById('ger'),
    homeScore: 3, awayScore: 2,
    startTime: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD2', group: 'B',
    venue: 'AT&T Stadium', weather: 'Cloudy',
    predictions: genPredictions(0.6),
  },
  {
    id: 'm9', status: 'finished',
    homeTeam: teamById('usa'), awayTeam: teamById('eng'),
    homeScore: 1, awayScore: 1,
    startTime: new Date(Date.now() - 74 * 3600 * 1000).toISOString(),
    leagueName: '2026 FIFA World Cup', stage: 'Group Stage · MD1', group: 'C',
    venue: 'SoFi Stadium', weather: 'Clear',
    predictions: genPredictions(0.05),
  },
]

export function genPredictions(homeBias: number): Record<string, Array<{ option: string; probability: number }>> {
  const out: Record<string, Array<{ option: string; probability: number }>> = {}
  for (const dimKey of DIMENSION_KEYS) {
    const n = DIM_OPTION_COUNTS[dimKey]
    const opts = DIM_OPTION_KEYS[dimKey]
    // 为避免每次刷新都重排，使用确定性"种子"：dimKey 决定基线
    const seedBias = homeBias + ((dimKey.length % 7) - 3) * 0.05
    const probs = dist(n, seedBias, 0.5)
    out[dimKey] = probs.map((p, i) => ({ option: opts[i], probability: p.probability }))
  }
  return out
}

// ============ Mock：用户排行榜 ============
const NICKNAMES = [
  'TacticalMind', 'FootballOracle', 'TifoKing', 'GoalPredictor', 'MatchMaster',
  'PitchVision', 'CornerWizard', 'RedCardSage', 'VARwhisperer', 'StrikerAI',
  'MidfieldGenius', 'DefenderLogic',
]
const REGIONS = ['br', 'ar', 'fr', 'gb-eng', 'de', 'es', 'us', 'mx', 'jp', 'kr', 'pt', 'nl', 'it', 'uy', 'co', 'cl']
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

/** 生成稳定的 mock 用户排行（按 sort 决定排序字段） */
function genUserRankings(sort: 'total' | 'exact' | 'funny') {
  const base = NICKNAMES.map((nick, i) => {
    const totalRate = 50 + (i * 3.7) % 45 // 50~95 区间
    const exactRate = 5 + (i * 2.3) % 25 // 5~30 区间（高难度项）
    const funnyRate = 60 + (i * 1.9) % 35 // 60~95
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
      user: {
        id: `uid_${i + 1}`,
        nickname: nick,
        region: REGIONS[i % REGIONS.length],
        defaultAiConfig: {
          modelName: MODELS[i % MODELS.length].value,
          apiEndpoint: PLATFORMS[i % PLATFORMS.length].value,
        },
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

// ============ Mock：大模型排行 ============
function genModelRankings() {
  return MODELS.map((m, i) => ({
    modelName: m.name,
    modelValue: m.value,
    totalPredictions: 1000 + i * 234,
    avgAccuracy: (78 - i * 2.1).toFixed(1),
    totalScore: 5000 - i * 350,
  })).sort((a, b) => Number(b.avgAccuracy) - Number(a.avgAccuracy))
}

// ============ Mock：热门 AI 简报 ============
function genHotBriefs() {
  return MATCHES.slice(0, 6).map((m, i) => ({
    matchId: m.id,
    homeTeamName: m.homeTeam.name,
    homeCountryCode: m.homeTeam.countryCode,
    awayTeamName: m.awayTeam.name,
    awayCountryCode: m.awayTeam.countryCode,
    leagueName: m.leagueName,
    topConclusion: pickTopConclusion(m, i),
    accuracyRate: (62 + (i * 4.7) % 28).toFixed(1),
    analysisCount: 120 + i * 87,
    topModel: MODELS[i % MODELS.length].name,
  }))
}

function pickTopConclusion(m: MockMatch, i: number): string {
  const conclusions = [
    `${m.homeTeam.shortName} 主场微占优，预测 2-1 小胜`,
    `双方近期状态接近，平局概率较高`,
    `${m.awayTeam.shortName} 反击犀利，可能爆冷`,
    `${m.homeTeam.shortName} 控球占优，角球数量预计 4-6 个`,
    `上半场进球可能性高，首球归属主队`,
    `黄牌集中在中后场，两队黄牌数量持平`,
  ]
  return conclusions[i % conclusions.length]
}

// ============ Mock：赛事详情（含实时数据 + 21 维度预测） ============
export function genMatchDetail(id: string) {
  const m = MATCHES.find((x) => x.id === id)
  if (!m) return null
  return {
    ...m,
    possession: { home: 45 + Math.floor(Math.random() * 20), away: 0 }, // 远端会补全
    shots: { home: 8 + Math.floor(Math.random() * 10), away: 4 + Math.floor(Math.random() * 8) },
    shotsOnTarget: { home: 3 + Math.floor(Math.random() * 5), away: 1 + Math.floor(Math.random() * 4) },
    fouls: { home: 6 + Math.floor(Math.random() * 8), away: 8 + Math.floor(Math.random() * 8) },
    corners: { home: 2 + Math.floor(Math.random() * 5), away: 1 + Math.floor(Math.random() * 5) },
    lineup: {
      home: ['GK:Alisson', 'DEF:Danilo', 'DEF:Marquinhos', 'DEF:Silva', 'DEF:Sandro', 'MID:Casemiro', 'MID:Paquetá', 'MID:Bruno', 'FWD:Raphinha', 'FWD:Jesus', 'FWD:Vinícius'],
      away: ['GK:Martínez', 'DEF:Molina', 'DEF:Romero', 'DEF:Otamendi', 'DEF:Tagliafico', 'MID:De Paul', 'MID:Mac Allister', 'MID:Endo', 'FWD:Messi', 'FWD:Álvarez', 'FWD:Di María'],
    },
  }
}

// ============ URL 匹配与派发 ============
/** 从 URL 移除 baseURL 前缀，统一参数对象方便匹配 */
function parseReq(url: string, config?: AxiosRequestConfig) {
  // 去掉 baseURL 后的相对路径（统一不带前导 /，便于正则）
  const path = url.replace(/^.*?\/api\/v\d+\//, '').replace(/^\/+/, '')
  const params = (config?.params || {}) as Record<string, any>
  return { path, params }
}

export function findMock(method: string, url: string, config?: AxiosRequestConfig): any | undefined {
  if (!USE_MOCK) return undefined
  const m = method.toUpperCase()
  const { path, params } = parseReq(url, config)
  // 兼容旧 / 新两种 URL 形式：/match/m1、matches/m1 等
  const p = path.replace(/^\/+/, '')

  // 排除后端专属路由，不走 mock
  if (p.startsWith('match/bracket')) return undefined

  // 1. 赛事列表（含按 status 过滤）
  if (m === 'GET' && /^(match|matches)(\/)?(\?|$)/.test(p)) {
    const status = params.status
    const list = status ? MATCHES.filter((x) => x.status === status) : MATCHES
    return { list, total: list.length }
  }

  // 2. 赛事详情
  const matchDetail = p.match(/^(?:match|matches)\/([^/?]+)$/)
  if (m === 'GET' && matchDetail) {
    return genMatchDetail(matchDetail[1])
  }

  // 3. AI 热门简报
  if (m === 'GET' && p.startsWith('ranking/hot-briefs')) {
    return { list: genHotBriefs() }
  }

  // 4. 用户排行（支持 sort 参数）
  if (m === 'GET' && p.startsWith('ranking/users')) {
    const sort = (params.sort as 'total' | 'exact' | 'funny') || 'total'
    return { list: genUserRankings(sort) }
  }

  // 5. 大模型排行
  if (m === 'GET' && p.startsWith('ranking/models')) {
    return { list: genModelRankings() }
  }

  // 6. 热门 Agent 平台
  if (m === 'GET' && p.startsWith('ranking/platforms/top')) {
    return {
      list: PLATFORMS.map((pl, i) => ({
        platform: pl.name,
        platformValue: pl.value,
        userCount: 120 - i * 17,
      })),
    }
  }

  // 7. 赛事预测（详情页右侧栏）
  const prediction = p.match(/^(?:match|matches)\/([^/]+)\/prediction$/)
  if (m === 'GET' && prediction) {
    const detail = genMatchDetail(prediction[1])
    if (!detail) return { list: [] }
    return {
      list: Object.entries(detail.predictions).map(([dimKey, arr]) => ({ dimKey, options: arr })),
    }
  }

  // 8. 舆情数据
  if (m === 'GET' && p.startsWith('sentiment/')) {
    return {
      overall: { score: 0.18, label: 'slightly_positive', volume: 12480 },
      timeline: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        home: (Math.sin(h / 4) * 0.3 + Math.random() * 0.2).toFixed(3),
        away: (Math.cos(h / 4) * 0.3 + Math.random() * 0.2).toFixed(3),
      })),
      keywords: ['VAR', 'Messi', 'Penalty', 'Tactics', 'Set-piece'],
    }
  }

  // 9. 公开指令清单
  if (m === 'GET' && p.startsWith('agent/open/instructions')) {
    return { list: [], total: 0, page: 1, pageSize: 20, lastRefreshAt: new Date().toISOString() }
  }

  return undefined
}

export const isMockEnabled = () => USE_MOCK
