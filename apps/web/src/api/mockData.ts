/**
 * 详情页 demo 模式（?demo=1）专用 Mock 数据
 *
 * 用途：MatchDetailView.vue 在 `isDemoMode` 为真时直接读取这些常量，
 *       用于在没有后端的情况下预览整个详情页的完整布局。
 *
 * 来源：基于 @/api/mock.ts 中的静态数据（MATCHES、TEAMS 等）派生而来，
 *       避免在两处维护独立硬编码。
 */
import { MATCHES, TEAMS, genMatchDetail } from './mock'

/** 详情页默认使用的赛事：取第一场 live 比赛 */
const FIRST_LIVE = MATCHES.find((m) => m.status === 'live') || MATCHES[0]

/** 详情页：取默认赛事的扩展详情（含控球/射门/阵容等） */
export const MOCK_MATCH_DETAIL = genMatchDetail(FIRST_LIVE.id) as any

/** 主队/客队 id（供 TEAM_PLAYERS 索引） */
const HOME_ID = FIRST_LIVE.homeTeam.id
const AWAY_ID = FIRST_LIVE.awayTeam.id

/** 简单 3 选 1 预测（与 mock.ts 里的 predictions 对齐） */
export const MOCK_PREDICTION = {
  homeWin: 0.48,
  draw: 0.28,
  awayWin: 0.24,
  reasoning: '主队主场微占优，进攻线状态更稳定',
  source: 'Demo (内置示例)',
}

/** 舆情：赛事级 */
export const MOCK_SENTIMENT = {
  sampleCount: 12480,
  avgScore: 0.18,
  positiveRatio: 0.46,
  negativeRatio: 0.22,
  recentItems: [
    { id: 's1', sentimentPolarity: 'positive', sourcePlatform: 'twitter', createdAt: new Date().toISOString(), originalText: 'Messi 太稳了，这场的调度像下棋。' },
    { id: 's2', sentimentPolarity: 'negative', sourcePlatform: 'reddit', createdAt: new Date(Date.now() - 30 * 60_000).toISOString(), originalText: '后防真的不能再丢位置了。' },
    { id: 's3', sentimentPolarity: 'neutral', sourcePlatform: 'x', createdAt: new Date(Date.now() - 60 * 60_000).toISOString(), originalText: '70% 控球率依然没转化成进球。' },
  ],
}

/** 舆情：主队级（与赛事级同形） */
export const MOCK_HOME_SENTIMENT = {
  sampleCount: 5820,
  avgScore: 0.22,
  positiveRatio: 0.52,
  negativeRatio: 0.18,
  recentItems: MOCK_SENTIMENT.recentItems,
}

/** 舆情：客队级 */
export const MOCK_AWAY_SENTIMENT = {
  sampleCount: 4310,
  avgScore: 0.05,
  positiveRatio: 0.39,
  negativeRatio: 0.31,
  recentItems: MOCK_SENTIMENT.recentItems,
}

/** 阵容：按球队 id 索引（demo 用通用 11 人占位） */
const GENERIC_LINEUP = [
  { id: 'p1', name: 'Player 1', number: 1, position: 'GK' },
  { id: 'p2', name: 'Player 2', number: 2, position: 'DF' },
  { id: 'p3', name: 'Player 3', number: 4, position: 'DF' },
  { id: 'p4', name: 'Player 4', number: 5, position: 'DF' },
  { id: 'p5', name: 'Player 5', number: 3, position: 'DF' },
  { id: 'p6', name: 'Player 6', number: 6, position: 'MF' },
  { id: 'p7', name: 'Player 7', number: 8, position: 'MF' },
  { id: 'p8', name: 'Player 8', number: 10, position: 'MF' },
  { id: 'p9', name: 'Player 9', number: 7, position: 'FW' },
  { id: 'p10', name: 'Player 10', number: 9, position: 'FW' },
  { id: 'p11', name: 'Player 11', number: 11, position: 'FW' },
]

export const MOCK_TEAM_PLAYERS: Record<string, Array<{ id: string; name: string; number: number; position: string }>> = TEAMS.reduce(
  (acc, t) => {
    acc[t.id] = GENERIC_LINEUP
    return acc
  },
  {} as Record<string, Array<{ id: string; name: string; number: number; position: string }>>,
)
// 确保首页主/客队有数据
if (!MOCK_TEAM_PLAYERS[HOME_ID]) MOCK_TEAM_PLAYERS[HOME_ID] = GENERIC_LINEUP
if (!MOCK_TEAM_PLAYERS[AWAY_ID]) MOCK_TEAM_PLAYERS[AWAY_ID] = GENERIC_LINEUP

/** 21 维度报告：基于当前赛事的 predictions 派生 */
export const MOCK_DIMENSION_REPORTS = Object.entries(FIRST_LIVE.predictions).map(([dimKey, opts], idx) => {
  const top = [...opts].sort((a, b) => b.probability - a.probability)[0]
  return {
    id: `dim_${dimKey}`,
    dimKey,
    dimensionName: dimKey,
    topOption: top?.option || '',
    topProbability: top?.probability || 0,
    distribution: opts.map((o) => ({ option: o.option, probability: o.probability })),
    summary: `${dimKey} · ${top?.option} (${((top?.probability || 0) * 100).toFixed(1)}%)`,
    updatedAt: new Date(Date.now() - idx * 60_000).toISOString(),
  }
})
