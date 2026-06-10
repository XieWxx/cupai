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
  /** 当前语言（用于生成对应语言的指令文本），默认 zh-CN */
  locale?: string
  /** 国际化队名获取函数，优先使用此函数获取队名 */
  getTeamNameFn?: (team: any) => string
}

// ============================================================
// 国际化支持
// ============================================================

/** 国际化文本映射表 */
const I18N_MAP: Record<string, Record<string, string>> = {
  'copy.homeTeam': { 'zh-CN': '主队', 'en-US': 'Home', 'ja-JP': 'ホーム', 'ko-KR': '홈' },
  'copy.awayTeam': { 'zh-CN': '客队', 'en-US': 'Away', 'ja-JP': 'アウェイ', 'ko-KR': '어웨이' },
  'copy.homeWin': { 'zh-CN': '主队胜', 'en-US': 'Home Win', 'ja-JP': 'ホーム勝利', 'ko-KR': '홈 승리' },
  'copy.draw': { 'zh-CN': '平局', 'en-US': 'Draw', 'ja-JP': '引き分け', 'ko-KR': '무승부' },
  'copy.awayWin': { 'zh-CN': '客队胜', 'en-US': 'Away Win', 'ja-JP': 'アウェイ勝利', 'ko-KR': '어웨이 승리' },
  'copy.homeZone': { 'zh-CN': '主队区', 'en-US': 'Home Zone', 'ja-JP': 'ホーム席', 'ko-KR': '홈석' },
  'copy.awayZone': { 'zh-CN': '客队区', 'en-US': 'Away Zone', 'ja-JP': 'アウェイ席', 'ko-KR': '어웨이석' },
  'copy.total': { 'zh-CN': '总', 'en-US': 'Total', 'ja-JP': '合計', 'ko-KR': '총계' },
  'copy.matchAnalysis': {
    'zh-CN': '赛事分析请求', 'en-US': 'Match Analysis Request',
    'ja-JP': '試合分析リクエスト', 'ko-KR': '경기 분석 요청',
  },
  'copy.playerAnalysis': {
    'zh-CN': '球员深度分析', 'en-US': 'Player Deep Analysis',
    'ja-JP': '選手詳細分析', 'ko-KR': '선수 심층 분석',
  },
  'copy.teamAnalysis': {
    'zh-CN': '球队深度分析', 'en-US': 'Team Deep Analysis',
    'ja-JP': 'チーム詳細分析', 'ko-KR': '팀 심층 분석',
  },
  'copy.name': { 'zh-CN': '姓名', 'en-US': 'Name', 'ja-JP': '名前', 'ko-KR': '이름' },
  'copy.affiliation': { 'zh-CN': '所属', 'en-US': 'Team', 'ja-JP': '所属', 'ko-KR': '소속' },
  'copy.position': { 'zh-CN': '位置', 'en-US': 'Position', 'ja-JP': 'ポジション', 'ko-KR': '포지션' },
  'copy.age': { 'zh-CN': '年龄', 'en-US': 'Age', 'ja-JP': '年齢', 'ko-KR': '나이' },
  'copy.keyPlayer': {
    'zh-CN': '是否核心球员', 'en-US': 'Key Player',
    'ja-JP': '主力選手', 'ko-KR': '핵심 선수',
  },
  'copy.seasonGoals': {
    'zh-CN': '赛季进球', 'en-US': 'Season Goals',
    'ja-JP': 'シーズン得点', 'ko-KR': '시즌 골',
  },
  'copy.seasonAssists': {
    'zh-CN': '赛季助攻', 'en-US': 'Season Assists',
    'ja-JP': 'シーズンアシスト', 'ko-KR': '시즌 어시스트',
  },
  'copy.yellowCards': {
    'zh-CN': '累计黄牌', 'en-US': 'Yellow Cards',
    'ja-JP': '累計イエローカード', 'ko-KR': '누적 옐로카드',
  },
  'copy.redCards': {
    'zh-CN': '累计红牌', 'en-US': 'Red Cards',
    'ja-JP': '累計レッドカード', 'ko-KR': '누적 레드카드',
  },
  'copy.injuryStatus': {
    'zh-CN': '伤病状态', 'en-US': 'Injury Status',
    'ja-JP': '負傷状態', 'ko-KR': '부상 상태',
  },
  'copy.healthy': { 'zh-CN': '健康', 'en-US': 'Fit', 'ja-JP': '健康', 'ko-KR': '건강' },
  'copy.yes': { 'zh-CN': '是', 'en-US': 'Yes', 'ja-JP': 'はい', 'ko-KR': '예' },
  'copy.no': { 'zh-CN': '否', 'en-US': 'No', 'ja-JP': 'いいえ', 'ko-KR': '아니오' },
  'copy.fifaRank': {
    'zh-CN': 'FIFA 排名', 'en-US': 'FIFA Rank',
    'ja-JP': 'FIFAランキング', 'ko-KR': 'FIFA 랭킹',
  },
  'copy.formation': {
    'zh-CN': '阵型', 'en-US': 'Formation',
    'ja-JP': 'フォーメーション', 'ko-KR': '포메이션',
  },
  'copy.style': { 'zh-CN': '风格', 'en-US': 'Style', 'ja-JP': 'スタイル', 'ko-KR': '스타일' },
  'copy.avgGoals': {
    'zh-CN': '场均进球', 'en-US': 'Avg Goals',
    'ja-JP': '平均得点', 'ko-KR': '경기당 골',
  },
  'copy.avgConceded': {
    'zh-CN': '场均失球', 'en-US': 'Avg Conceded',
    'ja-JP': '平均失点', 'ko-KR': '경기당 실점',
  },
  'copy.avgPossession': {
    'zh-CN': '场均控球', 'en-US': 'Avg Possession',
    'ja-JP': '平均ボール支配率', 'ko-KR': '경기당 점유율',
  },
  'copy.winRate': { 'zh-CN': '胜率', 'en-US': 'Win Rate', 'ja-JP': '勝率', 'ko-KR': '승률' },
  'copy.recentForm': {
    'zh-CN': '近期形态', 'en-US': 'Recent Form',
    'ja-JP': '最近の調子', 'ko-KR': '최근 폼',
  },
  'copy.sentimentMissing': {
    'zh-CN': '舆情数据缺失', 'en-US': 'Sentiment data missing',
    'ja-JP': 'センチメントデータ欠落', 'ko-KR': '감정 데이터 누락',
  },
  'copy.predictionMissing': {
    'zh-CN': '本地预测未生成', 'en-US': 'Local prediction not generated',
    'ja-JP': 'ローカル予測未生成', 'ko-KR': '로컬 예측 미생성',
  },
  'copy.overallSentiment': {
    'zh-CN': '整体情绪', 'en-US': 'Overall Sentiment',
    'ja-JP': '全体センチメント', 'ko-KR': '전체 감정',
  },
  'copy.distribution': {
    'zh-CN': '分布', 'en-US': 'Distribution',
    'ja-JP': '分布', 'ko-KR': '분포',
  },
  'copy.positive': { 'zh-CN': '正面', 'en-US': 'Positive', 'ja-JP': 'ポジティブ', 'ko-KR': '긍정' },
  'copy.neutral': { 'zh-CN': '中性', 'en-US': 'Neutral', 'ja-JP': 'ニュートラル', 'ko-KR': '중립' },
  'copy.negative': { 'zh-CN': '负面', 'en-US': 'Negative', 'ja-JP': 'ネガティブ', 'ko-KR': '부정' },
  'copy.matchInfo': {
    'zh-CN': '基础赛事信息', 'en-US': 'Basic Match Info',
    'ja-JP': '基本試合情報', 'ko-KR': '기본 경기 정보',
  },
  'copy.teamProfile': {
    'zh-CN': '双方球队画像', 'en-US': 'Team Profiles',
    'ja-JP': 'チームプロフィール', 'ko-KR': '팀 프로필',
  },
  'copy.lineup': {
    'zh-CN': '双方阵容（按位置）', 'en-US': 'Lineups (by Position)',
    'ja-JP': 'スタメン（ポジション別）', 'ko-KR': '라인업 (포지션별)',
  },
  'copy.sentimentSnapshot': {
    'zh-CN': '舆情快照', 'en-US': 'Sentiment Snapshot',
    'ja-JP': 'センチメントスナップショット', 'ko-KR': '감정 스냅샷',
  },
  'copy.localPrediction': {
    'zh-CN': '本地启发式预测（参考）', 'en-US': 'Local Heuristic Prediction (Reference)',
    'ja-JP': 'ローカルヒューリスティック予測（参考）', 'ko-KR': '로컬 휴리스틱 예측 (참고)',
  },
  'copy.event': { 'zh-CN': '赛事', 'en-US': 'Event', 'ja-JP': 'イベント', 'ko-KR': '이벤트' },
  'copy.stage': { 'zh-CN': '阶段', 'en-US': 'Stage', 'ja-JP': 'ステージ', 'ko-KR': '스테이지' },
  'copy.kickoff': { 'zh-CN': '开球时间', 'en-US': 'Kickoff', 'ja-JP': 'キックオフ', 'ko-KR': '킥오프' },
  'copy.venue': { 'zh-CN': '场地', 'en-US': 'Venue', 'ja-JP': '会場', 'ko-KR': '경기장' },
  'copy.weather': { 'zh-CN': '天气', 'en-US': 'Weather', 'ja-JP': '天気', 'ko-KR': '날씨' },
  'copy.referee': { 'zh-CN': '主裁', 'en-US': 'Referee', 'ja-JP': '主審', 'ko-KR': '주심' },
  'copy.refereeStyle': {
    'zh-CN': '执法风格', 'en-US': 'Refereeing Style',
    'ja-JP': '審判スタイル', 'ko-KR': '심판 스타일',
  },
  'copy.audience': { 'zh-CN': '观众', 'en-US': 'Attendance', 'ja-JP': '観客', 'ko-KR': '관중' },
  'copy.thisMatch': {
    'zh-CN': '本场赛事', 'en-US': 'This Match',
    'ja-JP': 'この試合', 'ko-KR': '이 경기',
  },
  'copy.corePlayers': {
    'zh-CN': '核心球员', 'en-US': 'Key Players',
    'ja-JP': '主力選手', 'ko-KR': '핵심 선수',
  },
  'copy.analysisRequirements': {
    'zh-CN': '分析要求', 'en-US': 'Analysis Requirements',
    'ja-JP': '分析要件', 'ko-KR': '분석 요구사항',
  },
  'copy.recentMatches': {
    'zh-CN': '近期比赛', 'en-US': 'Recent Matches',
    'ja-JP': '最近の試合', 'ko-KR': '최근 경기',
  },
  'copy.goals': { 'zh-CN': '球', 'en-US': 'goals', 'ja-JP': 'ゴール', 'ko-KR': '골' },
  'copy.assists': { 'zh-CN': '助', 'en-US': 'assists', 'ja-JP': 'アシスト', 'ko-KR': '도움' },
  'copy.rating': { 'zh-CN': '评分', 'en-US': 'Rating', 'ja-JP': '評価', 'ko-KR': '평점' },
  'copy.humidity': { 'zh-CN': '湿度', 'en-US': 'Humidity', 'ja-JP': '湿度', 'ko-KR': '습도' },
  'copy.windSpeed': { 'zh-CN': '风速', 'en-US': 'Wind Speed', 'ja-JP': '風速', 'ko-KR': '풍속' },
  'copy.nationality': { 'zh-CN': '国籍', 'en-US': 'Nationality', 'ja-JP': '国籍', 'ko-KR': '국적' },
  'copy.noPlayerData': {
    'zh-CN': '暂无球员数据', 'en-US': 'No player data',
    'ja-JP': '選手データなし', 'ko-KR': '선수 데이터 없음',
  },
  'copy.dataMissing': {
    'zh-CN': '数据缺失', 'en-US': 'Data missing',
    'ja-JP': 'データ欠落', 'ko-KR': '데이터 누락',
  },
  'copy.goalkeeper': { 'zh-CN': '守门员', 'en-US': 'Goalkeeper', 'ja-JP': 'ゴールキーパー', 'ko-KR': '골키퍼' },
  'copy.defender': { 'zh-CN': '后卫', 'en-US': 'Defender', 'ja-JP': 'ディフェンダー', 'ko-KR': '수비수' },
  'copy.midfielder': { 'zh-CN': '中场', 'en-US': 'Midfielder', 'ja-JP': 'ミッドフィールダー', 'ko-KR': '미드필더' },
  'copy.forward': { 'zh-CN': '前锋', 'en-US': 'Forward', 'ja-JP': 'フォワード', 'ko-KR': '공격수' },
  'copy.injury': { 'zh-CN': '伤情', 'en-US': 'Injury', 'ja-JP': '負傷', 'ko-KR': '부상' },
  'copy.yellow': { 'zh-CN': '黄', 'en-US': 'Y', 'ja-JP': '黄', 'ko-KR': '옐' },
  'copy.red': { 'zh-CN': '红', 'en-US': 'R', 'ja-JP': '赤', 'ko-KR': '레드' },
  'copy.yearsOld': { 'zh-CN': '岁', 'en-US': 'y/o', 'ja-JP': '歳', 'ko-KR': '세' },
  'copy.teamName': { 'zh-CN': '名称', 'en-US': 'Name', 'ja-JP': '名称', 'ko-KR': '이름' },
  'copy.playerTechFit': {
    'zh-CN': '球员技术特点与位置适配性', 'en-US': 'Player technical traits & positional fit',
    'ja-JP': '選手の技術的特徴とポジション適性', 'ko-KR': '선수 기술 특징 및 포지션 적합성',
  },
  'copy.currentForm': {
    'zh-CN': '当前状态（评分、最近 5 场趋势）', 'en-US': 'Current form (rating, last 5 matches trend)',
    'ja-JP': '現在の状態（評価、直近5試合のトレンド）', 'ko-KR': '현재 상태 (평점, 최근 5경기 트렌드)',
  },
  'copy.injuryRisk': {
    'zh-CN': '伤病与停赛风险', 'en-US': 'Injury & suspension risk',
    'ja-JP': '負傷と出場停止リスク', 'ko-KR': '부상 및 출장 정지 위험',
  },
  'copy.keyMatchExpect': {
    'zh-CN': '关键比赛（淘汰赛 / 强强对话）预期表现',
    'en-US': 'Expected performance in key matches (knockout / top clashes)',
    'ja-JP': '重要試合（決勝トーナメント / 強豪対決）での期待パフォーマンス',
    'ko-KR': '핵심 경기 (토너먼트 / 강팀 대결) 예상 퍼포먼스',
  },
  'copy.scoringExpect': {
    'zh-CN': '是否能在下一场破门（结合对手防线、自身进球效率）',
    'en-US': 'Can score in next match (considering opponent defense & own scoring efficiency)',
    'ja-JP': '次戦で得点できるか（相手守備陣と自身の得点効率を考慮）',
    'ko-KR': '다음 경기 득점 가능 여부 (상대 수비 및 자체 득점 효율 고려)',
  },
  'copy.tacticalStyle': {
    'zh-CN': '战术风格解读（控球 / 反击 / 高位压迫等）',
    'en-US': 'Tactical style analysis (possession / counter / high press etc.)',
    'ja-JP': '戦術スタイル解読（ポゼッション / カウンター / ハイプレス等）',
    'ko-KR': '전술 스타일 분석 (점유율 / 역습 / 하이프레스 등)',
  },
  'copy.squadDepth': {
    'zh-CN': '阵容深度评估（主力 / 替补 / 青训）',
    'en-US': 'Squad depth assessment (starters / bench / academy)',
    'ja-JP': 'スカッド深度評価（スタメン / ベンチ / アカデミー）',
    'ko-KR': '스쿼드 깊이 평가 (주전 / 벤치 / 유스)',
  },
  'copy.keyPlayerDependency': {
    'zh-CN': '关键球员依赖度', 'en-US': 'Key player dependency',
    'ja-JP': '主力選手依存度', 'ko-KR': '핵심 선수 의존도',
  },
  'copy.homeAwayDiff': {
    'zh-CN': '主场 / 客场表现差异', 'en-US': 'Home / Away performance difference',
    'ja-JP': 'ホーム / アウェイ成績差', 'ko-KR': '홈 / 원정 성적 차이',
  },
  'copy.tacticalMatchup': {
    'zh-CN': '与赛事对手的战术相克分析', 'en-US': 'Tactical matchup analysis vs opponent',
    'ja-JP': '対戦相手との戦術的相性分析', 'ko-KR': '상대팀과의 전술적 상성 분석',
  },
  'copy.proScoutPlayer': {
    'zh-CN': '请扮演专业球探，从技术、状态、伤病、心理四个维度分析该球员的赛季表现与下一场预期。',
    'en-US': 'Act as a professional scout. Analyze this player\'s season performance and next match expectations from technical, form, injury, and mental dimensions.',
    'ja-JP': 'プロのスカウトとして、技術・状態・負傷・心理の4つの側面から選手のシーズンパフォーマンスと次戦の期待値を分析してください。',
    'ko-KR': '프로 스카우트로서 기술, 상태, 부상, 심리의 4가지 차원에서 이 선수의 시즌 퍼포먼스와 다음 경기 예상을 분석해 주세요.',
  },
  'copy.proScoutTeam': {
    'zh-CN': '请扮演专业球探，从战术、阵容、状态三个维度分析这支球队。',
    'en-US': 'Act as a professional scout. Analyze this team from tactical, squad, and form dimensions.',
    'ja-JP': 'プロのスカウトとして、戦術・スカッド・状態の3つの側面からこのチームを分析してください。',
    'ko-KR': '프로 스카우트로서 전술, 스쿼드, 상태의 3가지 차원에서 이 팀을 분석해 주세요.',
  },
  'copy.markdownOutput100to200': {
    'zh-CN': '请使用 Markdown 输出，每节 100-200 字。',
    'en-US': 'Please output in Markdown, 100-200 words per section.',
    'ja-JP': 'Markdownで出力してください。各節100〜200字。',
    'ko-KR': 'Markdown으로 출력해 주세요. 각 섹션 100-200자.',
  },
  'copy.markdownOutput150to300': {
    'zh-CN': '请使用 Markdown 输出，每节 150-300 字。',
    'en-US': 'Please output in Markdown, 150-300 words per section.',
    'ja-JP': 'Markdownで出力してください。各節150〜300字。',
    'ko-KR': 'Markdown으로 출력해 주세요. 각 섹션 150-300자.',
  },
  'copy.sentimentScore': {
    'zh-CN': '分（-100 极度负面，+100 极度正面）',
    'en-US': 'pts (-100 extremely negative, +100 extremely positive)',
    'ja-JP': '点（-100 極めてネガティブ、+100 極めてポジティブ）',
    'ko-KR': '점 (-100 극도 부정, +100 극도 긍정)',
  },
  'copy.refereeInfo': {
    'zh-CN': '主裁', 'en-US': 'Referee', 'ja-JP': '主審', 'ko-KR': '주심',
  },
}

/** 获取国际化文本，fallback 到中文 */
function i18n(locale: string | undefined, key: string): string {
  const lang = locale || 'zh-CN'
  return I18N_MAP[key]?.[lang] || I18N_MAP[key]?.['zh-CN'] || key
}

/** 获取国际化队名 */
function getTeamName(input: CopyInstructionInput, team: any): string {
  if (input.getTeamNameFn && team) return input.getTeamNameFn(team)
  return team?.name || team?.nameEn || ''
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
 * @param players 球员列表
 * @param sideLabel 阵营标签（如"主队"/"客队"）
 * @param locale 当前语言
 */
function groupPlayersText(players: PlayerSnapshot[] | undefined, sideLabel: string, locale?: string): string {
  if (!players || players.length === 0) return `_${sideLabel} ${i18n(locale, 'copy.noPlayerData')}_\n`

  const posLabel: Record<string, string> = {
    GK: i18n(locale, 'copy.goalkeeper'), DF: i18n(locale, 'copy.defender'),
    MF: i18n(locale, 'copy.midfielder'), FW: i18n(locale, 'copy.forward'),
    Goalkeeper: i18n(locale, 'copy.goalkeeper'), Defender: i18n(locale, 'copy.defender'),
    Midfielder: i18n(locale, 'copy.midfielder'), Forward: i18n(locale, 'copy.forward'),
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
      const inj = p.injuryStatus ? ` · ${i18n(locale, 'copy.injury')}:${p.injuryStatus}` : ''
      const cards = (p.yellowCards || p.redCards)
        ? ` · ${p.yellowCards || 0}${i18n(locale, 'copy.yellow')}${p.redCards ? `+${p.redCards}${i18n(locale, 'copy.red')}` : ''}`
        : ''
      lines.push(
        `- #${p.name}（${p.nameEn || ''}）· ${p.age || '-'}${i18n(locale, 'copy.yearsOld')}${keyTag} · ` +
        `${p.seasonGoals ?? 0}${i18n(locale, 'copy.goals')}/${p.seasonAssists ?? 0}${i18n(locale, 'copy.assists')}${cards}${inj}`,
      )
    }
    lines.push('')
  }
  return lines.join('\n')
}

/**
 * 球队统计数据格式化
 * @param t 球队快照
 * @param label 标签（如"主队"/"客队"）
 * @param locale 当前语言
 */
function teamStats(t: TeamSnapshot | null | undefined, label: string, locale?: string): string {
  if (!t) return `_${label} ${i18n(locale, 'copy.dataMissing')}_\n`
  const rankChange = t.fifaRankChange
    ? ` (${t.fifaRankChange > 0 ? '▲' : '▼'}${Math.abs(t.fifaRankChange)})`
    : ''
  return [
    `- **${label}**：${t.name}${t.nameEn ? `（${t.nameEn}）` : ''}`,
    `  - ${i18n(locale, 'copy.fifaRank')}：#${t.fifaRank ?? '—'}${rankChange}`,
    `  - ${i18n(locale, 'copy.formation')}：${t.formation || '—'}`,
    `  - ${i18n(locale, 'copy.style')}：${t.playStyle || '—'}`,
    `  - ${i18n(locale, 'copy.avgGoals')}：${Number(t.avgGoalsScored || 0).toFixed(2)}`,
    `  - ${i18n(locale, 'copy.avgConceded')}：${Number(t.avgGoalsConceded || 0).toFixed(2)}`,
    `  - ${i18n(locale, 'copy.avgPossession')}：${Number(t.avgPossession || 0).toFixed(1)}%`,
    `  - ${i18n(locale, 'copy.winRate')}：${Number(t.winRate || 0).toFixed(1)}%`,
    '',
  ].join('\n')
}

/**
 * 基础数据快照（每个维度都需要的通用部分）
 */
function buildBaseSnapshot(input: CopyInstructionInput, dimTitle: string, _question: string, _optionsText: string): string {
  const m = input.match
  if (!m) return ''
  const loc = input.locale

  const weather = m.temperature || m.humidity || m.weatherCondition
    ? `- ${i18n(loc, 'copy.weather')}：${m.temperature ?? '—'}°C / ${i18n(loc, 'copy.humidity')} ${m.humidity ?? '—'}% / ${m.weatherCondition || '—'} / ${i18n(loc, 'copy.windSpeed')} ${m.windSpeed ?? '—'}m/s`
    : ''
  const referee = m.refereeName
    ? `- ${i18n(loc, 'copy.referee')}：${m.refereeName}（${m.refereeNationality || '—'}，${i18n(loc, 'copy.refereeStyle')}：${m.refereeStyle || '—'}）`
    : ''

  const sentimentText = input.sentiment
    ? [
        `- ${i18n(loc, 'copy.overallSentiment')}：${(input.sentiment.overall * 100).toFixed(0)} ${i18n(loc, 'copy.sentimentScore')}`,
        `- ${i18n(loc, 'copy.distribution')}：${i18n(loc, 'copy.positive')} ${(input.sentiment.positiveRatio * 100).toFixed(0)}% / ${i18n(loc, 'copy.neutral')} ${(input.sentiment.neutralRatio * 100).toFixed(0)}% / ${i18n(loc, 'copy.negative')} ${(input.sentiment.negativeRatio * 100).toFixed(0)}%`,
      ].join('\n')
    : `_${i18n(loc, 'copy.sentimentMissing')}_`

  const predictionText = input.prediction
    ? [
        `- ${i18n(loc, 'copy.homeWin')}：${(input.prediction.homeWin * 100).toFixed(1)}%`,
        `- ${i18n(loc, 'copy.draw')}：${(input.prediction.draw * 100).toFixed(1)}%`,
        `- ${i18n(loc, 'copy.awayWin')}：${(input.prediction.awayWin * 100).toFixed(1)}%`,
      ].join('\n')
    : `_${i18n(loc, 'copy.predictionMissing')}_`

  const homeTeamName = getTeamName(input, m.homeTeam) || i18n(loc, 'copy.homeTeam')
  const awayTeamName = getTeamName(input, m.awayTeam) || i18n(loc, 'copy.awayTeam')

  const parts: string[] = [
    `# 单维度分析 · ${dimTitle}`,
    '',
    `> 详细数据可通过 skill.md API 获取，或由系统自动获取。以下为关键数据摘要。`,
    '',
    `> ${i18n(loc, 'copy.thisMatch')}：**${homeTeamName} VS ${awayTeamName}**`,
    '',
    `## 一、${i18n(loc, 'copy.matchInfo')}`,
    '',
    `- ${i18n(loc, 'copy.event')}：${m.leagueName || '—'}`,
    `- ${i18n(loc, 'copy.stage')}：${m.stage || '—'}`,
    `- ${i18n(loc, 'copy.kickoff')}：${m.startTime ? new Date(m.startTime).toISOString() : '—'}`,
    `- ${i18n(loc, 'copy.venue')}：${m.venue || '—'}`,
    weather,
    referee,
    '',
    `## 二、${i18n(loc, 'copy.teamProfile')}`,
    '',
    teamStats(input.homeTeam, i18n(loc, 'copy.homeTeam'), loc),
    teamStats(input.awayTeam, i18n(loc, 'copy.awayTeam'), loc),
    `## 三、${i18n(loc, 'copy.lineup')}`,
    '',
    groupPlayersText(input.homePlayers, i18n(loc, 'copy.homeTeam'), loc),
    '---',
    '',
    groupPlayersText(input.awayPlayers, i18n(loc, 'copy.awayTeam'), loc),
    `## 四、${i18n(loc, 'copy.sentimentSnapshot')}`,
    '',
    sentimentText,
    '',
    `## 五、${i18n(loc, 'copy.localPrediction')}`,
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

> **完整接入文档**：${skillMdUrl}
> 包含所有 API 端点、维度定义、分析规则与验证机制。

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
 * 21 维度分析规则（精简版，详细规则见 skill.md）
 */
const ANALYSIS_RULES = `## 分析维度（请逐项输出结论）

> 完整的维度定义、选项说明、数据来源优先级、处理流程与验证机制，请参考 skill.md 中的"分析规则"章节。

### （一）赛果比分板块
1. **全场胜平负**（result_wdl）：home / draw / away
2. **全场总进球档位**（result_total_goals）：0 / 1 / 2 / 3 / 4+
3. **半全场结果**（result_half_full）：HW / HD / HL / DW / DD / DL / LW / LD / LL
4. **精准比分**（result_exact_score）：列出最可能的 3 个比分及各自概率

### （二）进球细节板块
5. **上半场有无进球**（goal_first_half）：yes / no
6. **首球归属**（goal_first）：home / away / noGoal
7. **末球归属**（goal_last）：home / away / noGoal
8. **是否出现乌龙球**（goal_own）：yes / no
9. **指定球员能否破门**（goal_player_score）：score / noScore
10. **补时阶段能否产生进球**（goal_stoppage）：yes / no
11. **单队零封**（goal_clean_sheet）：homeClean / awayClean / bothConcede
12. **全场进球总数单/双**（goal_odd_even）：odd / even

### （三）点球、VAR、判罚板块
13. **常规比赛是否判罚点球**（penalty_awarded）：yes / no
14. **是否出现进球被 VAR 取消**（penalty_var_cancel）：yes / no
15. **淘汰赛加时/点球**（penalty_knockout_extra）：extra / shootout / noExtra

### （四）红黄牌、犯规板块
16. **全场是否出现红牌**（card_red）：yes / no
17. **黄牌总量**（card_yellow_total）：0 / 1-2 / 3+
18. **两队黄牌数量**（card_yellow_compare）：homeMore / awayMore / equal

### （五）边角趣味数据板块
19. **全场角球总数档位**（corner_total）：0-3 / 4-6 / 7+
20. **有无任意球直接得分**（corner_freekick_goal）：yes / no
21. **两队换人次数**（corner_substitutions）：homeMore / awayMore / equal

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
  const loc = input.locale

  const weather = m.temperature || m.humidity || m.weatherCondition
    ? `  - ${i18n(loc, 'copy.weather')}：${m.temperature ?? '—'}°C / ${i18n(loc, 'copy.humidity')} ${m.humidity ?? '—'}% / ${m.weatherCondition || '—'} / ${i18n(loc, 'copy.windSpeed')} ${m.windSpeed ?? '—'}m/s`
    : ''
  const referee = m.refereeName
    ? `  - ${i18n(loc, 'copy.referee')}：${m.refereeName}（${m.refereeNationality || '—'}，${i18n(loc, 'copy.refereeStyle')}：${m.refereeStyle || '—'}）`
    : ''

  const sentimentText = input.sentiment
    ? [
        `- **${i18n(loc, 'copy.overallSentiment')}**：${(input.sentiment.overall * 100).toFixed(0)} ${i18n(loc, 'copy.sentimentScore')}`,
        `- **${i18n(loc, 'copy.distribution')}**：${i18n(loc, 'copy.positive')} ${(input.sentiment.positiveRatio * 100).toFixed(0)}% / ${i18n(loc, 'copy.neutral')} ${(input.sentiment.neutralRatio * 100).toFixed(0)}% / ${i18n(loc, 'copy.negative')} ${(input.sentiment.negativeRatio * 100).toFixed(0)}%`,
      ].join('\n')
    : `_${i18n(loc, 'copy.sentimentMissing')}_`

  const predictionText = input.prediction
    ? [
        `- **${i18n(loc, 'copy.homeWin')}**：${(input.prediction.homeWin * 100).toFixed(1)}%`,
        `- **${i18n(loc, 'copy.draw')}**：${(input.prediction.draw * 100).toFixed(1)}%`,
        `- **${i18n(loc, 'copy.awayWin')}**：${(input.prediction.awayWin * 100).toFixed(1)}%`,
      ].join('\n')
    : `_${i18n(loc, 'copy.predictionMissing')}_`

  const homeTeamName = getTeamName(input, m.homeTeam) || i18n(loc, 'copy.homeTeam')
  const awayTeamName = getTeamName(input, m.awayTeam) || i18n(loc, 'copy.awayTeam')

  const parts: string[] = [
    `# ${i18n(loc, 'copy.matchAnalysis')} · ${homeTeamName} VS ${awayTeamName}`,
    '',
    '> 详细数据可通过 skill.md API 获取，或由系统自动获取。以下为关键数据摘要。',
    '',
    '> 请扮演专业的足球赛事分析师，**严格按照下方 21 维度逐项分析**，并使用 Markdown 格式输出报告。',
    '',
    `## 一、${i18n(loc, 'copy.matchInfo')}`,
    '',
    `- **${i18n(loc, 'copy.event')}**：${m.leagueName || '—'}`,
    `- **${i18n(loc, 'copy.stage')}**：${m.stage || '—'}`,
    `- **${i18n(loc, 'copy.kickoff')}**：${m.startTime ? new Date(m.startTime).toISOString() : '—'}`,
    `- **${i18n(loc, 'copy.venue')}**：${m.venue || '—'}`,
    weather,
    referee,
    `- **${i18n(loc, 'copy.audience')}**：${i18n(loc, 'copy.homeZone')} ${m.homeAttendance?.toLocaleString?.() || m.homeAttendance || '—'} / ${i18n(loc, 'copy.awayZone')} ${m.awayAttendance?.toLocaleString?.() || m.awayAttendance || '—'} / ${i18n(loc, 'copy.total')} ${m.totalAttendance?.toLocaleString?.() || m.totalAttendance || '—'}`,
    '',
    `## 二、${i18n(loc, 'copy.teamProfile')}`,
    '',
    teamStats(input.homeTeam, i18n(loc, 'copy.homeTeam'), loc),
    teamStats(input.awayTeam, i18n(loc, 'copy.awayTeam'), loc),
    `## 三、${i18n(loc, 'copy.lineup')}`,
    '',
    groupPlayersText(input.homePlayers, i18n(loc, 'copy.homeTeam'), loc),
    '---',
    '',
    groupPlayersText(input.awayPlayers, i18n(loc, 'copy.awayTeam'), loc),
    `## 四、${i18n(loc, 'copy.sentimentSnapshot')}`,
    '',
    sentimentText,
    '',
    `## 五、${i18n(loc, 'copy.localPrediction')}`,
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
  /** 当前语言（用于生成对应语言的指令文本），默认 zh-CN */
  locale?: string
}): string {
  const p = input.player
  const loc = input.locale
  const parts = [
    `# ${i18n(loc, 'copy.playerAnalysis')} · ${p.name}（${p.teamName || ''}）`,
    '',
    `> ${i18n(loc, 'copy.proScoutPlayer')}`,
    '',
    `## ${i18n(loc, 'copy.playerAnalysis')}`,
    `- ${i18n(loc, 'copy.name')}：${p.name}（${p.nameEn || ''}）`,
    `- ${i18n(loc, 'copy.affiliation')}：${p.teamName || '—'}`,
    `- ${i18n(loc, 'copy.position')}：${p.position}`,
    `- ${i18n(loc, 'copy.age')}：${p.age ?? '—'}`,
    `- ${i18n(loc, 'copy.keyPlayer')}：${p.isKeyPlayer ? `${i18n(loc, 'copy.yes')} ⭐` : i18n(loc, 'copy.no')}`,
    `- ${i18n(loc, 'copy.seasonGoals')}：${p.seasonGoals ?? 0}`,
    `- ${i18n(loc, 'copy.seasonAssists')}：${p.seasonAssists ?? 0}`,
    `- ${i18n(loc, 'copy.yellowCards')}：${p.yellowCards ?? 0}`,
    `- ${i18n(loc, 'copy.redCards')}：${p.redCards ?? 0}`,
    `- ${i18n(loc, 'copy.injuryStatus')}：${p.injuryStatus || i18n(loc, 'copy.healthy')}`,
    '',
  ]
  if (input.recentMatches?.length) {
    parts.push(`## ${i18n(loc, 'copy.recentMatches')}`, '')
    for (const m of input.recentMatches) {
      parts.push(`- vs ${m.opponent} · ${m.goals}${i18n(loc, 'copy.goals')} ${m.assists}${i18n(loc, 'copy.assists')}${m.rating ? ` · ${i18n(loc, 'copy.rating')} ${m.rating}` : ''}`)
    }
    parts.push('')
  }
  parts.push(
    `## ${i18n(loc, 'copy.analysisRequirements')}`,
    `1. ${i18n(loc, 'copy.playerTechFit')}`,
    `2. ${i18n(loc, 'copy.currentForm')}`,
    `3. ${i18n(loc, 'copy.injuryRisk')}`,
    `4. ${i18n(loc, 'copy.keyMatchExpect')}`,
    `5. ${i18n(loc, 'copy.scoringExpect')}`,
    '',
    i18n(loc, 'copy.markdownOutput100to200'),
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
  /** 当前语言（用于生成对应语言的指令文本），默认 zh-CN */
  locale?: string
}): string {
  const t = input.team
  const loc = input.locale
  const parts = [
    `# ${i18n(loc, 'copy.teamAnalysis')} · ${t.name}（${t.nameEn || ''}）`,
    '',
    `> ${i18n(loc, 'copy.proScoutTeam')}`,
    '',
    `## ${i18n(loc, 'copy.teamProfile')}`,
    `- ${i18n(loc, 'copy.teamName')}：${t.name}`,
    `- ${i18n(loc, 'copy.fifaRank')}：#${t.fifaRank ?? '—'}`,
    `- ${i18n(loc, 'copy.formation')}：${t.formation || '—'}`,
    `- ${i18n(loc, 'copy.style')}：${t.playStyle || '—'}`,
    `- ${i18n(loc, 'copy.avgGoals')}：${Number(t.avgGoalsScored || 0).toFixed(2)}`,
    `- ${i18n(loc, 'copy.avgConceded')}：${Number(t.avgGoalsConceded || 0).toFixed(2)}`,
    `- ${i18n(loc, 'copy.avgPossession')}：${Number(t.avgPossession || 0).toFixed(1)}%`,
    `- ${i18n(loc, 'copy.winRate')}：${Number(t.winRate || 0).toFixed(1)}%`,
    t.recentForm ? `- ${i18n(loc, 'copy.recentForm')}：${t.recentForm}` : '',
    '',
  ]
  if (t.keyPlayers?.length) {
    parts.push(`## ${i18n(loc, 'copy.corePlayers')}`, '')
    for (const p of t.keyPlayers) {
      parts.push(`- ${p.name}（${p.position}）· ${p.seasonGoals ?? 0}${i18n(loc, 'copy.goals')}/${p.seasonAssists ?? 0}${i18n(loc, 'copy.assists')} · ${p.injuryStatus || i18n(loc, 'copy.healthy')}`)
    }
    parts.push('')
  }
  parts.push(
    `## ${i18n(loc, 'copy.analysisRequirements')}`,
    `1. ${i18n(loc, 'copy.tacticalStyle')}`,
    `2. ${i18n(loc, 'copy.squadDepth')}`,
    `3. ${i18n(loc, 'copy.keyPlayerDependency')}`,
    `4. ${i18n(loc, 'copy.homeAwayDiff')}`,
    `5. ${i18n(loc, 'copy.tacticalMatchup')}`,
    '',
    i18n(loc, 'copy.markdownOutput150to300'),
  )
  return parts.filter(Boolean).join('\n')
}
