/**
 * 复制指令生成工具
 *
 * 设计目标：
 * 1. 用户一键复制，把"完整数据快照 + 单维度分析规则"打包成 Markdown
 * 2. 每个维度（赛果/进球/点球/红黄牌/角球等）都有独立的复制按钮
 * 3. 粘到任意 AI 客户端即可生成专业分析
 * 4. 指令结尾附上回传指引（API Key / 提交地址）
 */

/**
 * 复制指令生成工具单只球队数据快照
 */
export interface TeamSnapshot {
  name: string
  nameEn?: string
  countryCode?: string
  fifaRank?: number
  fifaRankChange?: number
  formation?: string
  playStyle?: string
  avgGoalsScored?: number
  avgGoalsConceded?: number
  avgPossession?: number
  winRate?: number
}

/**
 * 球员快照
 */
export interface PlayerSnapshot {
  name: string
  nameEn?: string
  position: string
  age?: number
  isKeyPlayer?: boolean
  seasonGoals?: number
  seasonAssists?: number
  injuryStatus?: string
  yellowCards?: number
  redCards?: number
}

/**
 * 舆情快照
 */
export interface SentimentSnapshot {
  overall: number // -1..1
  positiveRatio: number // 0..1
  neutralRatio: number
  negativeRatio: number
  positiveKeywords?: Array<{ word: string; count: number }>
  negativeKeywords?: Array<{ word: string; count: number }>
  trend?: Array<{ time: string; value: number }>
}

/**
 * 比赛预测快照（来自本地启发式）
 */
export interface PredictionSnapshot {
  homeWin: number
  draw: number
  awayWin: number
  reasoning: string
  source: string
}

/**
 * 复制指令生成输入
 */
export interface CopyInstructionInput {
  match: any
  homeTeam?: TeamSnapshot | null
  awayTeam?: TeamSnapshot | null
  homePlayers?: PlayerSnapshot[]
  awayPlayers?: PlayerSnapshot[]
  sentiment?: SentimentSnapshot | null
  prediction?: PredictionSnapshot | null
  userApiKey?: string
  appBaseUrl?: string
  // 选填：附加的分析场景
  scene?: 'match_preview' | 'team_compare' | 'player_focus' | 'free'
  // 选填：附加的 Prompt 模板内容
  promptTemplateContent?: string
  /**
   * 选填：当前指令的真实 instructionId（由 /agent/open/instructions 拉取）
   * 用于在「复制指令」的 curl 模板中预填，无需 agent 手动查找
   */
  instructionId?: string
}

// ============================================================
// 维度定义（5 大板块 / 21 个具体维度）
// ============================================================

/** 5 大板块 key */
export type DimensionSectionKey =
  | 'result' // 赛果比分
  | 'goal' // 进球细节
  | 'penalty' // 点球、VAR、判罚
  | 'card' // 红黄牌、犯规
  | 'corner' // 边角趣味数据

/** 21 个具体维度 key */
export type DimensionKey =
  // (一) 赛果比分
  | 'result_wdl' // 全场胜平负
  | 'result_total_goals' // 全场总进球档位
  | 'result_half_full' // 半全场结果
  | 'result_exact_score' // 精准比分
  // (二) 进球细节
  | 'goal_first_half' // 上半场有无进球
  | 'goal_first' // 首球归属
  | 'goal_last' // 末球归属
  | 'goal_own' // 是否出现乌龙球
  | 'goal_player_score' // 指定球员能否破门
  | 'goal_stoppage' // 补时阶段能否产生进球
  | 'goal_clean_sheet' // 单队零封
  | 'goal_odd_even' // 全场进球总数单/双
  // (三) 点球、VAR、判罚
  | 'penalty_awarded' // 常规比赛是否判罚点球
  | 'penalty_var_cancel' // 是否出现进球被 VAR 取消
  | 'penalty_knockout_extra' // 淘汰赛专属：加时/点球
  // (四) 红黄牌、犯规
  | 'card_red' // 全场是否出现红牌
  | 'card_yellow_total' // 黄牌总量
  | 'card_yellow_compare' // 两队黄牌数量
  // (五) 边角趣味数据
  | 'corner_total' // 全场角球总数档位
  | 'corner_freekick_goal' // 有无任意球直接得分
  | 'corner_substitutions' // 两队换人次数

export interface DimensionDef {
  key: DimensionKey
  section: DimensionSectionKey
  /** i18n key（维度显示名） */
  i18nKey: string
  /** 维度副标题（i18n key） */
  descI18nKey?: string
  /** 该维度的"问题"标题（i18n key） */
  questionI18nKey: string
  /**
   * 候选项的"短 key"列表（用于匹配 distribution 中的 key）
   * 与 optionsI18nKeys 一一对应，按数组索引匹配。
   * 例：result_wdl → ['home', 'draw', 'away']
   *     result_total_goals → ['0', '1', '2', '3', '4+']
   *     goal_player_score → ['score', 'noScore']
   */
  optionsKeys: string[]
  /** 候选项 i18n key 列表（用于前端展示候选项，并写入 prompt 供 AI 输出） */
  optionsI18nKeys: string[]
  /** 是否需要指定球员（用于"指定球员能否破门"） */
  requiresPlayer?: boolean
}

/**
 * 5 大板块元数据
 */
export const DIMENSION_SECTIONS: Array<{
  key: DimensionSectionKey
  i18nKey: string
  descI18nKey: string
  iconKey: 'trophy' | 'soccer' | 'whistle' | 'warning' | 'corner'
}> = [
  { key: 'result', i18nKey: 'dimSection.resultTitle', descI18nKey: 'dimSection.resultDesc', iconKey: 'trophy' },
  { key: 'goal', i18nKey: 'dimSection.goalTitle', descI18nKey: 'dimSection.goalDesc', iconKey: 'soccer' },
  { key: 'penalty', i18nKey: 'dimSection.penaltyTitle', descI18nKey: 'dimSection.penaltyDesc', iconKey: 'whistle' },
  { key: 'card', i18nKey: 'dimSection.cardTitle', descI18nKey: 'dimSection.cardDesc', iconKey: 'warning' },
  { key: 'corner', i18nKey: 'dimSection.cornerTitle', descI18nKey: 'dimSection.cornerDesc', iconKey: 'corner' },
]

/**
 * 21 个具体维度定义
 */
export const DIMENSIONS: Record<DimensionKey, DimensionDef> = {
  // (一) 赛果比分
  result_wdl: {
    key: 'result_wdl',
    section: 'result',
    i18nKey: 'dim.resultWdl',
    questionI18nKey: 'dim.resultWdlQ',
    optionsKeys: ['home', 'draw', 'away'],
    optionsI18nKeys: ['dim.optHomeWin', 'dim.optDraw', 'dim.optAwayWin'],
  },
  result_total_goals: {
    key: 'result_total_goals',
    section: 'result',
    i18nKey: 'dim.resultTotalGoals',
    questionI18nKey: 'dim.resultTotalGoalsQ',
    optionsKeys: ['0', '1', '2', '3', '4+'],
    optionsI18nKeys: [
      'dim.optGoal0',
      'dim.optGoal1',
      'dim.optGoal2',
      'dim.optGoal3',
      'dim.optGoal4plus',
    ],
  },
  result_half_full: {
    key: 'result_half_full',
    section: 'result',
    i18nKey: 'dim.resultHalfFull',
    questionI18nKey: 'dim.resultHalfFullQ',
    // 半全场组合的短 key 与 i18n key 顺序一致
    optionsKeys: ['HW', 'HD', 'HL', 'DW', 'DD', 'DL', 'LW', 'LD', 'LL'],
    optionsI18nKeys: [
      'dim.optHFW', 'dim.optHFD', 'dim.optHFL',
      'dim.optHDW', 'dim.optHDD', 'dim.optHDL',
      'dim.optHLW', 'dim.optHLD', 'dim.optHLL',
    ],
  },
  result_exact_score: {
    key: 'result_exact_score',
    section: 'result',
    i18nKey: 'dim.resultExactScore',
    questionI18nKey: 'dim.resultExactScoreQ',
    // 精准比分由 AI 自由输出（不强制候选项）；distribution key = 比分字符串
    optionsKeys: [],
    optionsI18nKeys: [],
  },

  // (二) 进球细节
  goal_first_half: {
    key: 'goal_first_half',
    section: 'goal',
    i18nKey: 'dim.goalFirstHalf',
    questionI18nKey: 'dim.goalFirstHalfQ',
    optionsKeys: ['yes', 'no'],
    optionsI18nKeys: ['dim.optYes', 'dim.optNo'],
  },
  goal_first: {
    key: 'goal_first',
    section: 'goal',
    i18nKey: 'dim.goalFirst',
    questionI18nKey: 'dim.goalFirstQ',
    optionsKeys: ['home', 'away', 'noGoal'],
    optionsI18nKeys: ['dim.optHome', 'dim.optAway', 'dim.optNoGoal'],
  },
  goal_last: {
    key: 'goal_last',
    section: 'goal',
    i18nKey: 'dim.goalLast',
    questionI18nKey: 'dim.goalLastQ',
    optionsKeys: ['home', 'away', 'noGoal'],
    optionsI18nKeys: ['dim.optHome', 'dim.optAway', 'dim.optNoGoal'],
  },
  goal_own: {
    key: 'goal_own',
    section: 'goal',
    i18nKey: 'dim.goalOwn',
    questionI18nKey: 'dim.goalOwnQ',
    optionsKeys: ['yes', 'no'],
    optionsI18nKeys: ['dim.optYes', 'dim.optNo'],
  },
  goal_player_score: {
    key: 'goal_player_score',
    section: 'goal',
    i18nKey: 'dim.goalPlayerScore',
    questionI18nKey: 'dim.goalPlayerScoreQ',
    optionsKeys: ['score', 'noScore'],
    optionsI18nKeys: ['dim.optScore', 'dim.optNoScore'],
    requiresPlayer: true,
  },
  goal_stoppage: {
    key: 'goal_stoppage',
    section: 'goal',
    i18nKey: 'dim.goalStoppage',
    questionI18nKey: 'dim.goalStoppageQ',
    optionsKeys: ['yes', 'no'],
    optionsI18nKeys: ['dim.optYes', 'dim.optNo'],
  },
  goal_clean_sheet: {
    key: 'goal_clean_sheet',
    section: 'goal',
    i18nKey: 'dim.goalCleanSheet',
    questionI18nKey: 'dim.goalCleanSheetQ',
    optionsKeys: ['homeClean', 'awayClean', 'bothConcede'],
    optionsI18nKeys: ['dim.optHomeClean', 'dim.optAwayClean', 'dim.optBothConcede'],
  },
  goal_odd_even: {
    key: 'goal_odd_even',
    section: 'goal',
    i18nKey: 'dim.goalOddEven',
    questionI18nKey: 'dim.goalOddEvenQ',
    optionsKeys: ['odd', 'even'],
    optionsI18nKeys: ['dim.optOdd', 'dim.optEven'],
  },

  // (三) 点球、VAR、判罚
  penalty_awarded: {
    key: 'penalty_awarded',
    section: 'penalty',
    i18nKey: 'dim.penaltyAwarded',
    questionI18nKey: 'dim.penaltyAwardedQ',
    optionsKeys: ['yes', 'no'],
    optionsI18nKeys: ['dim.optYes', 'dim.optNo'],
  },
  penalty_var_cancel: {
    key: 'penalty_var_cancel',
    section: 'penalty',
    i18nKey: 'dim.penaltyVarCancel',
    questionI18nKey: 'dim.penaltyVarCancelQ',
    optionsKeys: ['yes', 'no'],
    optionsI18nKeys: ['dim.optYes', 'dim.optNo'],
  },
  penalty_knockout_extra: {
    key: 'penalty_knockout_extra',
    section: 'penalty',
    i18nKey: 'dim.penaltyKnockoutExtra',
    questionI18nKey: 'dim.penaltyKnockoutExtraQ',
    optionsKeys: ['extra', 'shootout', 'noExtra'],
    optionsI18nKeys: [
      'dim.optExtraTime',
      'dim.optPenaltyShootout',
      'dim.optNoExtra',
    ],
  },

  // (四) 红黄牌、犯规
  card_red: {
    key: 'card_red',
    section: 'card',
    i18nKey: 'dim.cardRed',
    questionI18nKey: 'dim.cardRedQ',
    optionsKeys: ['yes', 'no'],
    optionsI18nKeys: ['dim.optYes', 'dim.optNo'],
  },
  card_yellow_total: {
    key: 'card_yellow_total',
    section: 'card',
    i18nKey: 'dim.cardYellowTotal',
    questionI18nKey: 'dim.cardYellowTotalQ',
    optionsKeys: ['0', '1-2', '3+'],
    optionsI18nKeys: [
      'dim.optYellow0',
      'dim.optYellow1to2',
      'dim.optYellow3plus',
    ],
  },
  card_yellow_compare: {
    key: 'card_yellow_compare',
    section: 'card',
    i18nKey: 'dim.cardYellowCompare',
    questionI18nKey: 'dim.cardYellowCompareQ',
    optionsKeys: ['homeMore', 'awayMore', 'equal'],
    optionsI18nKeys: ['dim.optHomeMore', 'dim.optAwayMore', 'dim.optEqual'],
  },

  // (五) 边角趣味数据
  corner_total: {
    key: 'corner_total',
    section: 'corner',
    i18nKey: 'dim.cornerTotal',
    questionI18nKey: 'dim.cornerTotalQ',
    optionsKeys: ['0-3', '4-6', '7+'],
    optionsI18nKeys: ['dim.optCorner0to3', 'dim.optCorner4to6', 'dim.optCorner7plus'],
  },
  corner_freekick_goal: {
    key: 'corner_freekick_goal',
    section: 'corner',
    i18nKey: 'dim.cornerFreekickGoal',
    questionI18nKey: 'dim.cornerFreekickGoalQ',
    optionsKeys: ['yes', 'no'],
    optionsI18nKeys: ['dim.optYes', 'dim.optNo'],
  },
  corner_substitutions: {
    key: 'corner_substitutions',
    section: 'corner',
    i18nKey: 'dim.cornerSubs',
    questionI18nKey: 'dim.cornerSubsQ',
    optionsKeys: ['homeMore', 'awayMore', 'equal'],
    optionsI18nKeys: ['dim.optHomeMore', 'dim.optAwayMore', 'dim.optEqual'],
  },
}

// ============================================================
// 工具：基础数据快照
// ============================================================

/**
 * 球员按位置分组并格式化
 */
function groupPlayersText(players: PlayerSnapshot[] | undefined, sideLabel: string): string {
  if (!players || players.length === 0) return `_${sideLabel} 暂无球员数据_\n`

  const posLabel: Record<string, string> = {
    GK: '守门员', DF: '后卫', MF: '中场', FW: '前锋',
    Goalkeeper: '守门员', Defender: '后卫', Midfielder: '中场', Forward: '前锋',
  }
  const order: string[] = ['GK', 'DF', 'MF', 'FW']
  const groups: Record<string, PlayerSnapshot[]> = { GK: [], DF: [], MF: [], FW: [], OTHER: [] }
  for (const p of players) {
    const key = (p.position || '').toUpperCase()
    ;(groups[key] || groups.OTHER).push(p)
  }
  const lines: string[] = []
  for (const k of order) {
    if (!groups[k] || groups[k].length === 0) continue
    lines.push(`**${posLabel[k] || k}（${groups[k].length}）**`)
    for (const p of groups[k]) {
      const keyTag = p.isKeyPlayer ? ' ⭐' : ''
      const inj = p.injuryStatus ? ` · 伤情:${p.injuryStatus}` : ''
      const cards = (p.yellowCards || p.redCards)
        ? ` · ${p.yellowCards || 0}黄${p.redCards ? `+${p.redCards}红` : ''}`
        : ''
      lines.push(
        `- #${p.name}（${p.nameEn || ''}）· ${p.age || '-'}岁${keyTag} · ` +
        `${p.seasonGoals ?? 0}球/${p.seasonAssists ?? 0}助${cards}${inj}`,
      )
    }
    lines.push('')
  }
  return lines.join('\n')
}

function teamStats(t: TeamSnapshot | null | undefined, label: string): string {
  if (!t) return `_${label} 数据缺失_\n`
  const rankChange = t.fifaRankChange
    ? ` (${t.fifaRankChange > 0 ? '▲' : '▼'}${Math.abs(t.fifaRankChange)})`
    : ''
  return [
    `- **${label}**：${t.name}${t.nameEn ? `（${t.nameEn}）` : ''}`,
    `  - FIFA 排名：#${t.fifaRank ?? '—'}${rankChange}`,
    `  - 阵型：${t.formation || '—'}`,
    `  - 风格：${t.playStyle || '—'}`,
    `  - 场均进球：${Number(t.avgGoalsScored || 0).toFixed(2)}`,
    `  - 场均失球：${Number(t.avgGoalsConceded || 0).toFixed(2)}`,
    `  - 场均控球：${Number(t.avgPossession || 0).toFixed(1)}%`,
    `  - 胜率：${Number(t.winRate || 0).toFixed(1)}%`,
    '',
  ].join('\n')
}

/**
 * 基础数据快照（每个维度都需要的通用部分）
 */
function buildBaseSnapshot(input: CopyInstructionInput, dimTitle: string, _question: string, _optionsText: string): string {
  const m = input.match
  if (!m) return ''

  const weather = m.temperature || m.humidity || m.weatherCondition
    ? `- 天气：${m.temperature ?? '—'}°C / 湿度 ${m.humidity ?? '—'}% / ${m.weatherCondition || '—'} / 风速 ${m.windSpeed ?? '—'}m/s`
    : ''
  const referee = m.refereeName
    ? `- 主裁：${m.refereeName}（${m.refereeNationality || '—'}，执法风格：${m.refereeStyle || '—'}）`
    : ''

  const sentimentText = input.sentiment
    ? [
        `- 整体情绪：${(input.sentiment.overall * 100).toFixed(0)} 分（-100 极度负面，+100 极度正面）`,
        `- 分布：正面 ${(input.sentiment.positiveRatio * 100).toFixed(0)}% / 中性 ${(input.sentiment.neutralRatio * 100).toFixed(0)}% / 负面 ${(input.sentiment.negativeRatio * 100).toFixed(0)}%`,
        input.sentiment.positiveKeywords?.length
          ? `- 正面关键词：${input.sentiment.positiveKeywords.slice(0, 5).map((k) => `${k.word}(${k.count})`).join('、')}`
          : '',
        input.sentiment.negativeKeywords?.length
          ? `- 负面关键词：${input.sentiment.negativeKeywords.slice(0, 5).map((k) => `${k.word}(${k.count})`).join('、')}`
          : '',
      ].filter(Boolean).join('\n')
    : '_舆情数据缺失_'

  const predictionText = input.prediction
    ? [
        `- 主队胜：${(input.prediction.homeWin * 100).toFixed(1)}%`,
        `- 平局：${(input.prediction.draw * 100).toFixed(1)}%`,
        `- 客队胜：${(input.prediction.awayWin * 100).toFixed(1)}%`,
        `- 依据：${input.prediction.reasoning}`,
      ].join('\n')
    : '_本地预测未生成_'

  const parts: string[] = [
    `# 单维度分析 · ${dimTitle}`,
    '',
    `> 本场赛事：**${m.homeTeam?.name || '主队'} VS ${m.awayTeam?.name || '客队'}**`,
    '',
    '## 一、基础赛事信息',
    '',
    `- 赛事：${m.leagueName || '—'}`,
    `- 阶段：${m.stage || '—'}`,
    `- 开球时间：${m.startTime ? new Date(m.startTime).toISOString() : '—'}`,
    `- 场地：${m.venue || '—'}`,
    weather,
    referee,
    '',
    '## 二、双方球队画像',
    '',
    teamStats(input.homeTeam, '主队'),
    teamStats(input.awayTeam, '客队'),
    '## 三、双方阵容（按位置）',
    '',
    groupPlayersText(input.homePlayers, '主队'),
    '---',
    '',
    groupPlayersText(input.awayPlayers, '客队'),
    '## 四、舆情快照',
    '',
    sentimentText,
    '',
    '## 五、本地启发式预测（参考）',
    '',
    predictionText,
    '',
  ]

  return parts.filter(Boolean).join('\n')
}

/**
 * 回传说明（极简版：引用 skill.md，仅保留 curl 一键复制）
 * - 详细接入文档请参考 skill.md API
 * - 此处仅保留最关键的 curl 模板，让 Agent 可直接回传
 */
function buildReturnGuidance(input: CopyInstructionInput, dimKey: string): string {
  const base = input.appBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '<cupai_host>')
  const submitUrl = `${base}/api/v1/agent/open/dimension/submit`
  const skillMdUrl = `${base}/api/v1/agent/open/skill.md?matchId=${input.match?.id || ''}`
  const apiKey = input.userApiKey || 'cpk_<YOUR_API_KEY>'
  const realInstructionId = input.instructionId || '<instruction_id>'
  void realInstructionId
  const matchId = input.match?.id || '<match_id>'

  return `

---

## 回传指引

> 完整接入文档：${skillMdUrl}

完成分析后，请将结果回传至 CupAI：

\`\`\`bash
curl -X POST "${submitUrl}" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "matchId": "${matchId}",
    "dimKey": "${dimKey}",
    "topOption": "<首选结论>",
    "topProbability": 0.55,
    "distribution": {},
    "summary": "<分析摘要>",
    "model": "<模型名>",
    "platform": "<Agent平台名>"
  }'
\`\`\`

字段说明：\`matchId\`(必填) \`dimKey\`(必填) \`topOption\`(首选结论) \`topProbability\`(0-1) \`distribution\`(概率分布) \`summary\`(分析摘要) \`model\`(模型名) \`platform\`(Agent平台名)`
}

// ============================================================
// 维度指令生成
// ============================================================

/**
 * 单维度 prompt 模板（21 个维度共用）
 * - 不同维度只替换 [QUESTION] 和 [OPTIONS] 即可
 */
function buildDimensionPrompt(
  _dimKey: DimensionKey,
  dimTitle: string,
  question: string,
  optionsText: string,
): string {
  return `## 分析任务

**${dimTitle}**

**问题**：${question}

**可选结论**（请从下列候选项中选一个或多个，并给出概率）：
${optionsText}

## 输出格式

请使用 **Markdown** 输出，结构如下：

\`\`\`
## 结论
<从候选项中选择 1 个最可能结论，给出 0-100% 的置信度>

## 概率分布
<列出所有候选项的概率分布，合计 100%>

## 推理依据
<200-300 字：基于双方进攻/防守/历史/舆情/裁判风格等因素的推理>

## 风险与不确定性
<100-150 字：影响结论的主要不确定因素>
\`\`\`

请保持客观中立，**不要遗漏任何要求项**。`
}

/**
 * 生成单个维度的完整指令
 * @param dimKey 维度 key
 * @param input 基础数据快照输入
 * @param resolvedTitle 维度显示名（已 i18n 解析）
 * @param resolvedQuestion 维度问题（已 i18n 解析）
 * @param resolvedOptions 候选项文本（已 i18n 解析）
 */
export function buildDimensionInstruction(
  dimKey: DimensionKey,
  input: CopyInstructionInput,
  resolvedTitle: string,
  resolvedQuestion: string,
  resolvedOptions: string[],
): string {
  const optionsText = resolvedOptions.map((o, i) => `${i + 1}. ${o}`).join('\n')
  const base = buildBaseSnapshot(input, resolvedTitle, resolvedQuestion, optionsText)
  const task = buildDimensionPrompt(dimKey, resolvedTitle, resolvedQuestion, optionsText)
  const returnGuide = buildReturnGuidance(input, dimKey)
  return [base, task, returnGuide].filter(Boolean).join('\n')
}

// ============================================================
// 完整赛事分析（保留兼容 + 综合回调用）
// ============================================================

/**
 * 28+ 维度分析规则（用户给 AI 的指令核心）
 */
const ANALYSIS_RULES = `## 分析维度（请逐项输出结论）

### （一）赛果比分板块
1. **全场胜平负**：主队胜 / 平局 / 客队胜 — 给出概率估计（如 55% / 25% / 20%）
2. **全场总进球档位**：0 球 / 1 球 / 2 球 / 3 球 / 4 球及以上 — 给出每个档位的概率
3. **半全场结果**：上半场赛果 + 全场赛果组合（如 胜/胜、平/胜、负/平...）
4. **精准比分**（高难度大奖项）：列出最可能的 3 个比分及各自概率

### （二）进球细节板块
5. **上半场有无进球**：有 / 无
6. **首球归属**：主队 / 客队 / 全场无进球
7. **末球归属**：主队 / 客队 / 全场无进球
8. **是否出现乌龙球**：是 / 否
9. **指定球员能否破门**：依据球员赛季进球数和出场情况评估
10. **补时阶段能否产生进球**：是 / 否（参考裁判风格和两队体能）
11. **单队零封**：主队零封 / 客队零封 / 两队都有丢球
12. **全场进球总数单数 / 双数**：单 / 双

### （三）点球、VAR、判罚板块
13. **常规比赛是否判罚点球**（不含点球大战）：是 / 否
14. **是否出现进球被 VAR 取消**：是 / 否
15. **淘汰赛专属**：常规时间打平进加时？加时仍平进点球大战？给出概率

### （四）红黄牌、犯规板块
16. **全场是否出现红牌**：是 / 否
17. **黄牌总量**：0 张 / 1～2 张 / 3 张及以上
18. **两队黄牌数量**：主队多 / 客队多 / 持平

### （五）边角趣味数据板块
19. **全场角球总数档位**：0-3 / 4-6 / 7 及以上
20. **有无任意球直接得分**：是 / 否
21. **两队换人次数**：主队换人多 / 客队换人多 / 次数相同

## 输出格式要求

请使用 **Markdown** 输出，每个维度一个二级标题（##），结论在前、推理在后，**不要遗漏任何一项**。
报告末尾给出一段 **200 字以内的"综合结论"**，包含：
- 最可能的结果 + 概率
- 关键不确定因素
- 适合的投注玩法建议（仅作数据娱乐参考，不构成任何投注建议）`

/**
 * 生成比赛分析复制指令（完整版，21 维度综合）
 */
export function buildMatchInstruction(input: CopyInstructionInput): string {
  const m = input.match
  if (!m) return ''

  const weather = m.temperature || m.humidity || m.weatherCondition
    ? `  - 天气：${m.temperature ?? '—'}°C / 湿度 ${m.humidity ?? '—'}% / ${m.weatherCondition || '—'} / 风速 ${m.windSpeed ?? '—'}m/s`
    : ''
  const referee = m.refereeName
    ? `  - 主裁：${m.refereeName}（${m.refereeNationality || '—'}，执法风格：${m.refereeStyle || '—'}）`
    : ''

  const sentimentText = input.sentiment
    ? [
        `- **整体情绪**：${(input.sentiment.overall * 100).toFixed(0)} 分（-100 极度负面，+100 极度正面）`,
        `- **分布**：正面 ${(input.sentiment.positiveRatio * 100).toFixed(0)}% / 中性 ${(input.sentiment.neutralRatio * 100).toFixed(0)}% / 负面 ${(input.sentiment.negativeRatio * 100).toFixed(0)}%`,
        input.sentiment.positiveKeywords?.length
          ? `- **正面关键词**：${input.sentiment.positiveKeywords.slice(0, 5).map((k) => `${k.word}(${k.count})`).join('、')}`
          : '',
        input.sentiment.negativeKeywords?.length
          ? `- **负面关键词**：${input.sentiment.negativeKeywords.slice(0, 5).map((k) => `${k.word}(${k.count})`).join('、')}`
          : '',
      ].filter(Boolean).join('\n')
    : '_舆情数据缺失_'

  const predictionText = input.prediction
    ? [
        `- **主队胜**：${(input.prediction.homeWin * 100).toFixed(1)}%`,
        `- **平局**：${(input.prediction.draw * 100).toFixed(1)}%`,
        `- **客队胜**：${(input.prediction.awayWin * 100).toFixed(1)}%`,
        `- **依据**：${input.prediction.reasoning}`,
        `- **来源**：${input.prediction.source}`,
      ].join('\n')
    : '_本地预测未生成_'

  const parts: string[] = [
    `# 赛事分析请求 · ${m.homeTeam?.name || '主队'} VS ${m.awayTeam?.name || '客队'}`,
    '',
    '> 请扮演专业的足球赛事分析师，**严格按照下方 21 维度逐项分析**，并使用 Markdown 格式输出报告。',
    '',
    '## 一、基础赛事信息',
    '',
    `- **赛事**：${m.leagueName || '—'}`,
    `- **阶段**：${m.stage || '—'}`,
    `- **开球时间**：${m.startTime ? new Date(m.startTime).toISOString() : '—'}`,
    `- **场地**：${m.venue || '—'}`,
    weather,
    referee,
    `- **观众**：主队区 ${m.homeAttendance?.toLocaleString?.() || m.homeAttendance || '—'} / 客队区 ${m.awayAttendance?.toLocaleString?.() || m.awayAttendance || '—'} / 总 ${m.totalAttendance?.toLocaleString?.() || m.totalAttendance || '—'}`,
    '',
    '## 二、双方球队画像',
    '',
    teamStats(input.homeTeam, '主队'),
    teamStats(input.awayTeam, '客队'),
    '## 三、双方阵容（按位置）',
    '',
    groupPlayersText(input.homePlayers, '主队'),
    '---',
    '',
    groupPlayersText(input.awayPlayers, '客队'),
    '## 四、舆情快照',
    '',
    sentimentText,
    '',
    '## 五、本地启发式预测（参考）',
    '',
    predictionText,
    '',
  ]

  if (input.promptTemplateContent) {
    parts.push('## 六、自定义分析模板', '', input.promptTemplateContent, '')
  }

  parts.push(ANALYSIS_RULES, '', buildReturnGuidance(input, 'all'))

  return parts.filter(Boolean).join('\n')
}

/**
 * 生成球员分析指令（针对单个球员）
 */
export function buildPlayerInstruction(input: {
  player: PlayerSnapshot & { teamName?: string; teamId?: string }
  recentMatches?: Array<{ opponent: string; goals: number; assists: number; rating?: number }>
  userApiKey?: string
  appBaseUrl?: string
}): string {
  const p = input.player
  const parts = [
    `# 球员深度分析 · ${p.name}（${p.teamName || ''}）`,
    '',
    '> 请扮演专业球探，从技术、状态、伤病、心理四个维度分析该球员的赛季表现与下一场预期。',
    '',
    '## 球员数据',
    `- 姓名：${p.name}（${p.nameEn || ''}）`,
    `- 所属：${p.teamName || '—'}`,
    `- 位置：${p.position}`,
    `- 年龄：${p.age ?? '—'}`,
    `- 是否核心球员：${p.isKeyPlayer ? '是 ⭐' : '否'}`,
    `- 赛季进球：${p.seasonGoals ?? 0}`,
    `- 赛季助攻：${p.seasonAssists ?? 0}`,
    `- 累计黄牌：${p.yellowCards ?? 0}`,
    `- 累计红牌：${p.redCards ?? 0}`,
    `- 伤病状态：${p.injuryStatus || '健康'}`,
    '',
  ]
  if (input.recentMatches?.length) {
    parts.push('## 近期比赛', '')
    for (const m of input.recentMatches) {
      parts.push(`- vs ${m.opponent} · ${m.goals}球 ${m.assists}助${m.rating ? ` · 评分 ${m.rating}` : ''}`)
    }
    parts.push('')
  }
  parts.push(
    '## 分析要求',
    '1. 球员技术特点与位置适配性',
    '2. 当前状态（评分、最近 5 场趋势）',
    '3. 伤病与停赛风险',
    '4. 关键比赛（淘汰赛 / 强强对话）预期表现',
    '5. 是否能在下一场破门（结合对手防线、自身进球效率）',
    '',
    '请使用 Markdown 输出，每节 100-200 字。',
  )
  return parts.join('\n')
}

/**
 * 生成球队分析指令
 */
export function buildTeamInstruction(input: {
  team: TeamSnapshot & { id?: string; recentForm?: string; keyPlayers?: PlayerSnapshot[] }
  userApiKey?: string
  appBaseUrl?: string
}): string {
  const t = input.team
  const parts = [
    `# 球队深度分析 · ${t.name}（${t.nameEn || ''}）`,
    '',
    '> 请扮演专业球探，从战术、阵容、状态三个维度分析这支球队。',
    '',
    '## 球队画像',
    `- 名称：${t.name}`,
    `- FIFA 排名：#${t.fifaRank ?? '—'}`,
    `- 阵型：${t.formation || '—'}`,
    `- 风格：${t.playStyle || '—'}`,
    `- 场均进球：${Number(t.avgGoalsScored || 0).toFixed(2)}`,
    `- 场均失球：${Number(t.avgGoalsConceded || 0).toFixed(2)}`,
    `- 场均控球：${Number(t.avgPossession || 0).toFixed(1)}%`,
    `- 胜率：${Number(t.winRate || 0).toFixed(1)}%`,
    t.recentForm ? `- 近期形态：${t.recentForm}` : '',
    '',
  ]
  if (t.keyPlayers?.length) {
    parts.push('## 核心球员', '')
    for (const p of t.keyPlayers) {
      parts.push(`- ${p.name}（${p.position}）· ${p.seasonGoals ?? 0}球/${p.seasonAssists ?? 0}助 · ${p.injuryStatus || '健康'}`)
    }
    parts.push('')
  }
  parts.push(
    '## 分析要求',
    '1. 战术风格解读（控球 / 反击 / 高位压迫等）',
    '2. 阵容深度评估（主力 / 替补 / 青训）',
    '3. 关键球员依赖度',
    '4. 主场 / 客场表现差异',
    '5. 与赛事对手的战术相克分析',
    '',
    '请使用 Markdown 输出，每节 150-300 字。',
  )
  return parts.filter(Boolean).join('\n')
}
