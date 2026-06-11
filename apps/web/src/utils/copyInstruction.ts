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
  // ---- 精简版指令专用 i18n key ----
  'copy.dimAnalysis': {
    'zh-CN': '单维度分析', 'en-US': 'Dimension Analysis',
    'ja-JP': 'ディメンション分析', 'ko-KR': '차원 분석',
    'pt-BR': 'Análise de Dimensão', 'fr-FR': 'Analyse par dimension',
    'es-ES': 'Análisis por dimensión', 'ar-SA': 'تحليل الأبعاد',
  },
  'copy.dataFetch': {
    'zh-CN': '数据获取', 'en-US': 'Data Access',
    'ja-JP': 'データ取得', 'ko-KR': '데이터 가져오기',
    'pt-BR': 'Acesso a Dados', 'fr-FR': 'Accès aux données',
    'es-ES': 'Acceso a datos', 'ar-SA': 'جلب البيانات',
  },
  'copy.fullApiDoc': {
    'zh-CN': '完整 API 文档', 'en-US': 'Full API Documentation',
    'ja-JP': '完全 API ドキュメント', 'ko-KR': '전체 API 문서',
    'pt-BR': 'Documentação Completa da API', 'fr-FR': 'Documentation API complète',
    'es-ES': 'Documentación completa de la API', 'ar-SA': 'وثائق API الكاملة',
  },
  'copy.apiDocDesc': {
    'zh-CN': '包含所有数据端点、维度定义、分析规则与验证机制。', 'en-US': 'Includes all data endpoints, dimension definitions, analysis rules, and validation mechanisms.',
    'ja-JP': 'すべてのデータエンドポイント、ディメンション定義、分析ルール、検証メカニズムが含まれています。', 'ko-KR': '모든 데이터 엔드포인트, 차원 정의, 분석 규칙 및 검증 메커니즘이 포함되어 있습니다.',
    'pt-BR': 'Inclui todos os endpoints de dados, definições de dimensões, regras de análise e mecanismos de validação.', 'fr-FR': 'Inclut tous les points de données, définitions de dimensions, règles d\'analyse et mécanismes de validation.',
    'es-ES': 'Incluye todos los endpoints de datos, definiciones de dimensiones, reglas de análisis y mecanismos de validación.', 'ar-SA': 'يتضمن جميع نقاط البيانات وتعريفات الأبعاد وقواعد التحليل وآليات التحقق.',
  },
  'copy.callApiFirst': {
    'zh-CN': '请先调用以下 API 获取分析所需数据：', 'en-US': 'Call the following APIs first to get data for analysis:',
    'ja-JP': '分析に必要なデータを取得するため、まず以下の API を呼び出してください：', 'ko-KR': '분석에 필요한 데이터를 가져오려면 먼저 다음 API를 호출하세요:',
    'pt-BR': 'Chame as seguintes APIs primeiro para obter dados para análise:', 'fr-FR': 'Appelez d\'abord les API suivantes pour obtenir les données d\'analyse :',
    'es-ES': 'Llame primero a las siguientes APIs para obtener datos para el análisis:', 'ar-SA': 'استدعِ واجهات API التالية أولاً للحصول على بيانات التحليل:',
  },
  'copy.matchDetailWithExtras': {
    'zh-CN': '赛事详情（含天气/裁判/教练/赔率/预测）', 'en-US': 'Match details (weather/referee/coaches/odds/prediction)',
    'ja-JP': '試合詳細（天気/審判/コーチ/オッズ/予測を含む）', 'ko-KR': '경기 상세 (날씨/심판/코치/배당률/예측 포함)',
    'pt-BR': 'Detalhes da partida (clima/árbitro/técnicos/odds/previsão)', 'fr-FR': 'Détails du match (météo/arbitre/entraîneurs/cotes/prédiction)',
    'es-ES': 'Detalles del partido (clima/árbitro/entrenadores/cuotas/predicción)', 'ar-SA': 'تفاصيل المباراة (طقس/حكم/مدربون/احتمالات/توقعات)',
  },
  'copy.bothLineups': {
    'zh-CN': '双方阵容', 'en-US': 'Both lineups',
    'ja-JP': '両チームのスタメン', 'ko-KR': '양 팀 라인업',
    'pt-BR': 'Escalações de ambos os times', 'fr-FR': 'Compositions des deux équipes',
    'es-ES': 'Alineaciones de ambos equipos', 'ar-SA': 'تشكيلة الفريقين',
  },
  'copy.otherDataRefSkillMd': {
    'zh-CN': '其他补充数据（赔率对比/交锋记录/舆情/球员统计等）请参考 skill.md 文档按需获取', 'en-US': 'For other supplementary data (odds comparison/h2h/sentiment/player stats etc.), refer to skill.md as needed',
    'ja-JP': 'その他の補足データ（オッズ比較/対戦成績/センチメント/選手統計など）は skill.md ドキュメントを参照して必要に応じて取得してください', 'ko-KR': '기타 보충 데이터(배당률 비교/상대전적/감정/선수 통계 등)는 skill.md 문서를 참조하여 필요에 따라 가져오세요',
    'pt-BR': 'Para outros dados complementares (comparação de odds/h2h/sentimento/estatísticas de jogadores etc.), consulte skill.md conforme necessário', 'fr-FR': 'Pour d\'autres données complémentaires (comparaison des cotes/h2h/sentiment/statistiques des joueurs etc.), référez-vous à skill.md selon vos besoins',
    'es-ES': 'Para otros datos complementarios (comparación de cuotas/h2h/sentimiento/estadísticas de jugadores etc.), consulte skill.md según sea necesario', 'ar-SA': 'للبيانات التكميلية الأخرى (مقارنة الاحتمالات/مواجهات مباشرة/مشاعر/إحصائيات اللاعبين إلخ)، راجع skill.md حسب الحاجة',
  },
  'copy.keyDataSummary': {
    'zh-CN': '关键数据摘要', 'en-US': 'Key Data Summary',
    'ja-JP': '主要データサマリー', 'ko-KR': '핵심 데이터 요약',
    'pt-BR': 'Resumo dos Dados Principais', 'fr-FR': 'Résumé des données clés',
    'es-ES': 'Resumen de datos clave', 'ar-SA': 'ملخص البيانات الرئيسية',
  },
  'copy.returnGuide': {
    'zh-CN': '回传指引', 'en-US': 'Submission Guide',
    'ja-JP': '結果送信ガイド', 'ko-KR': '결과 제출 가이드',
    'pt-BR': 'Guia de Envio', 'fr-FR': 'Guide de soumission',
    'es-ES': 'Guía de envío', 'ar-SA': 'دليل الإرسال',
  },
  'copy.fullIntegrationDoc': {
    'zh-CN': '完整接入文档', 'en-US': 'Full Integration Doc',
    'ja-JP': '完全統合ドキュメント', 'ko-KR': '전체 통합 문서',
    'pt-BR': 'Documentação Completa de Integração', 'fr-FR': 'Documentation d\'intégration complète',
    'es-ES': 'Documentación completa de integración', 'ar-SA': 'وثائق التكامل الكاملة',
  },
  'copy.afterAnalysisSubmit': {
    'zh-CN': '完成分析后，请将结果回传至 CupAI：', 'en-US': 'After analysis, submit your results to CupAI:',
    'ja-JP': '分析完了後、結果を CupAI に送信してください：', 'ko-KR': '분석 완료 후, 결과를 CupAI에 제출하세요:',
    'pt-BR': 'Após a análise, envie seus resultados ao CupAI:', 'fr-FR': 'Après l\'analyse, soumettez vos résultats à CupAI :',
    'es-ES': 'Después del análisis, envíe sus resultados a CupAI:', 'ar-SA': 'بعد التحليل، أرسل نتائجك إلى CupAI:',
  },
  'copy.topOptionPlaceholder': {
    'zh-CN': '<首选结论>', 'en-US': '<top conclusion>',
    'ja-JP': '<最有力な結論>', 'ko-KR': '<최상위 결론>',
    'pt-BR': '<conclusão principal>', 'fr-FR': '<conclusion principale>',
    'es-ES': '<conclusión principal>', 'ar-SA': '<الاستنتاج الأرجح>',
  },
  'copy.summaryPlaceholder': {
    'zh-CN': '<分析摘要>', 'en-US': '<analysis summary>',
    'ja-JP': '<分析サマリー>', 'ko-KR': '<분석 요약>',
    'pt-BR': '<resumo da análise>', 'fr-FR': '<résumé de l\'analyse>',
    'es-ES': '<resumen del análisis>', 'ar-SA': '<ملخص التحليل>',
  },
  'copy.modelPlaceholder': {
    'zh-CN': '<模型名>', 'en-US': '<model name>',
    'ja-JP': '<モデル名>', 'ko-KR': '<모델명>',
    'pt-BR': '<nome do modelo>', 'fr-FR': '<nom du modèle>',
    'es-ES': '<nombre del modelo>', 'ar-SA': '<اسم النموذج>',
  },
  'copy.platformPlaceholder': {
    'zh-CN': '<Agent平台名>', 'en-US': '<Agent platform>',
    'ja-JP': '<Agentプラットフォーム名>', 'ko-KR': '<Agent 플랫폼명>',
    'pt-BR': '<plataforma Agent>', 'fr-FR': '<plateforme Agent>',
    'es-ES': '<plataforma Agent>', 'ar-SA': '<منصة الوكيل>',
  },
  'copy.fieldDesc': {
    'zh-CN': '字段说明：', 'en-US': 'Field descriptions: ',
    'ja-JP': 'フィールド説明：', 'ko-KR': '필드 설명: ',
    'pt-BR': 'Descrição dos campos: ', 'fr-FR': 'Description des champs : ',
    'es-ES': 'Descripción de campos: ', 'ar-SA': 'وصف الحقول: ',
  },
  'copy.fieldRequired': {
    'zh-CN': '(必填)', 'en-US': '(required)',
    'ja-JP': '(必須)', 'ko-KR': '(필수)',
    'pt-BR': '(obrigatório)', 'fr-FR': '(obligatoire)',
    'es-ES': '(obligatorio)', 'ar-SA': '(مطلوب)',
  },
  'copy.analysisTask': {
    'zh-CN': '分析任务', 'en-US': 'Analysis Task',
    'ja-JP': '分析タスク', 'ko-KR': '분석 과제',
    'pt-BR': 'Tarefa de Análise', 'fr-FR': 'Tâche d\'analyse',
    'es-ES': 'Tarea de análisis', 'ar-SA': 'مهمة التحليل',
  },
  'copy.question': {
    'zh-CN': '问题', 'en-US': 'Question',
    'ja-JP': '質問', 'ko-KR': '질문',
    'pt-BR': 'Pergunta', 'fr-FR': 'Question',
    'es-ES': 'Pregunta', 'ar-SA': 'السؤال',
  },
  'copy.optionsLabel': {
    'zh-CN': '可选结论（请从下列候选项中选一个或多个，并给出概率）', 'en-US': 'Options (select one or more from the candidates below, with probabilities)',
    'ja-JP': '選択肢（以下の候補から1つ以上を選択し、確率を付与してください）', 'ko-KR': '선택지 (아래 후보 중 하나 이상을 선택하고 확률을 부여하세요)',
    'pt-BR': 'Opções (selecione uma ou mais dos candidatos abaixo, com probabilidades)', 'fr-FR': 'Options (sélectionnez une ou plusieurs options parmi les candidats ci-dessous, avec probabilités)',
    'es-ES': 'Opciones (seleccione una o más de los candidatos a continuación, con probabilidades)', 'ar-SA': 'الخيارات (اختر خياراً أو أكثر من المرشحين أدناه، مع الاحتمالات)',
  },
  'copy.outputFormat': {
    'zh-CN': '输出格式', 'en-US': 'Output Format',
    'ja-JP': '出力形式', 'ko-KR': '출력 형식',
    'pt-BR': 'Formato de Saída', 'fr-FR': 'Format de sortie',
    'es-ES': 'Formato de salida', 'ar-SA': 'تنسيق الإخراج',
  },
  'copy.outputFormatDesc': {
    'zh-CN': '请使用 **Markdown** 输出，结构如下：', 'en-US': 'Please output in **Markdown** with the following structure:',
    'ja-JP': '**Markdown** で以下の構造で出力してください：', 'ko-KR': '**Markdown**으로 다음 구조로 출력해 주세요:',
    'pt-BR': 'Por favor, saída em **Markdown** com a seguinte estrutura:', 'fr-FR': 'Veuillez produire en **Markdown** avec la structure suivante :',
    'es-ES': 'Por favor, produzca en **Markdown** con la siguiente estructura:', 'ar-SA': 'يرجى الإخراج بتنسيق **Markdown** بالهيكل التالي:',
  },
  'copy.conclusion': {
    'zh-CN': '结论', 'en-US': 'Conclusion',
    'ja-JP': '結論', 'ko-KR': '결론',
    'pt-BR': 'Conclusão', 'fr-FR': 'Conclusion',
    'es-ES': 'Conclusión', 'ar-SA': 'الاستنتاج',
  },
  'copy.conclusionDesc': {
    'zh-CN': '<从候选项中选择 1 个最可能结论，给出 0-100% 的置信度>', 'en-US': '<Select 1 most likely option from candidates, with 0-100% confidence>',
    'ja-JP': '<候補から最も可能性の高い結論を1つ選択し、0-100%の信頼度を付与してください>', 'ko-KR': '<후보 중 가장 가능성 높은 결론 1개를 선택하고 0-100% 신뢰도를 부여하세요>',
    'pt-BR': '<Selecione 1 opção mais provável dos candidatos, com confiança de 0-100%>', 'fr-FR': '<Sélectionnez 1 option la plus probable parmi les candidats, avec un niveau de confiance de 0-100%>',
    'es-ES': '<Seleccione 1 opción más probable de los candidatos, con un nivel de confianza de 0-100%>', 'ar-SA': '<اختر الاستنتاج الأرجح من المرشحين، بمستوى ثقة 0-100%>',
  },
  'copy.probDistribution': {
    'zh-CN': '概率分布', 'en-US': 'Probability Distribution',
    'ja-JP': '確率分布', 'ko-KR': '확률 분포',
    'pt-BR': 'Distribuição de Probabilidade', 'fr-FR': 'Distribution de probabilité',
    'es-ES': 'Distribución de probabilidad', 'ar-SA': 'التوزيع الاحتمالي',
  },
  'copy.probDistributionDesc': {
    'zh-CN': '<列出所有候选项的概率分布，合计 100%>', 'en-US': '<List probability distribution for all candidates, summing to 100%>',
    'ja-JP': '<すべての候補の確率分布を列挙し、合計を100%にしてください>', 'ko-KR': '<모든 후보의 확률 분포를 나열하고 합계를 100%로 맞추세요>',
    'pt-BR': '<Liste a distribuição de probabilidade para todos os candidatos, somando 100%>', 'fr-FR': '<Listez la distribution de probabilité pour tous les candidats, totalisant 100%>',
    'es-ES': '<Liste la distribución de probabilidad para todos los candidatos, sumando 100%>', 'ar-SA': '<اذكر التوزيع الاحتمالي لجميع المرشحين، بحيث يكون المجموع 100%>',
  },
  'copy.reasoning': {
    'zh-CN': '推理依据', 'en-US': 'Reasoning',
    'ja-JP': '推論の根拠', 'ko-KR': '추론 근거',
    'pt-BR': 'Raciocínio', 'fr-FR': 'Raisonnement',
    'es-ES': 'Razonamiento', 'ar-SA': 'الاستدلال',
  },
  'copy.reasoningDesc': {
    'zh-CN': '<200-300 字：基于双方进攻/防守/历史/舆情/裁判风格等因素的推理>', 'en-US': '<200-300 words: reasoning based on offense/defense/history/sentiment/referee style etc.>',
    'ja-JP': '<200-300字：両チームの攻撃/守備/歴史/センチメント/審判スタイルなどに基づく推論>', 'ko-KR': '<200-300자: 양 팀의 공격/수비/역사/감정/심판 스타일 등에 기반한 추론>',
    'pt-BR': '<200-300 palavras: raciocínio baseado em ataque/defesa/histórico/sentimento/estilo do árbitro etc.>', 'fr-FR': '<200-300 mots : raisonnement basé sur l\'attaque/défense/historique/sentiment/style d\'arbitrage etc.>',
    'es-ES': '<200-300 palabras: razonamiento basado en ataque/defensa/historial/sentimiento/estilo arbitral etc.>', 'ar-SA': '<200-300 كلمة: استدلال مبني على الهجوم/الدفاع/التاريخ/المشاعر/أسلوب التحكيم إلخ>',
  },
  'copy.riskUncertainty': {
    'zh-CN': '风险与不确定性', 'en-US': 'Risks & Uncertainties',
    'ja-JP': 'リスクと不確実性', 'ko-KR': '위험 및 불확실성',
    'pt-BR': 'Riscos e Incertezas', 'fr-FR': 'Risques et incertitudes',
    'es-ES': 'Riesgos e incertidumbres', 'ar-SA': 'المخاطر وعدم اليقين',
  },
  'copy.riskDesc': {
    'zh-CN': '<100-150 字：影响结论的主要不确定因素>', 'en-US': '<100-150 words: main uncertain factors affecting the conclusion>',
    'ja-JP': '<100-150字：結論に影響を与える主な不確実要因>', 'ko-KR': '<100-150자: 결론에 영향을 미치는 주요 불확실 요인>',
    'pt-BR': '<100-150 palavras: principais fatores incertos que afetam a conclusão>', 'fr-FR': '<100-150 mots : principaux facteurs d\'incertitude affectant la conclusion>',
    'es-ES': '<100-150 palabras: principales factores de incertidumbre que afectan la conclusión>', 'ar-SA': '<100-150 كلمة: العوامل الرئيسية لعدم اليقين المؤثرة على الاستنتاج>',
  },
  'copy.stayObjective': {
    'zh-CN': '请保持客观中立，**不要遗漏任何要求项**。', 'en-US': 'Stay objective and neutral. **Do not omit any required item.**',
    'ja-JP': '客観的かつ中立的に保ってください。**いかなる必須項目も省略しないでください。**', 'ko-KR': '객관적이고 중립적으로 유지하세요. **필수 항목을 생략하지 마세요.**',
    'pt-BR': 'Mantenha-se objetivo e neutro. **Não omita nenhum item obrigatório.**', 'fr-FR': 'Restez objectif et neutre. **N\'omettez aucun élément requis.**',
    'es-ES': 'Manténgase objetivo y neutral. **No omita ningún elemento requerido.**', 'ar-SA': 'حافظ على الموضوعية والحياد. **لا تحذف أي عنصر مطلوب.**',
  },
  'copy.analysisDimensions': {
    'zh-CN': '分析维度（请逐项输出结论）', 'en-US': 'Analysis Dimensions (output conclusions for each)',
    'ja-JP': '分析ディメンション（各項目の結論を出力してください）', 'ko-KR': '분석 차원 (각 항목에 대한 결론을 출력하세요)',
    'pt-BR': 'Dimensões de Análise (emita conclusões para cada uma)', 'fr-FR': 'Dimensions d\'analyse (produisez des conclusions pour chacune)',
    'es-ES': 'Dimensiones de análisis (produzca conclusiones para cada una)', 'ar-SA': 'أبعاد التحليل (أخرج استنتاجات لكل بُعد)',
  },
  'copy.rulesRefSkillMd': {
    'zh-CN': '完整的维度定义、选项说明、数据来源优先级、处理流程与验证机制，请参考 skill.md 中的"分析规则"章节。', 'en-US': 'For complete dimension definitions, option descriptions, data source priority, processing flow, and validation mechanisms, refer to the "Analysis Rules" section in skill.md.',
    'ja-JP': '完全なディメンション定義、オプション説明、データソース優先度、処理フロー、検証メカニズムについては、skill.md の「分析ルール」セクションを参照してください。', 'ko-KR': '전체 차원 정의, 옵션 설명, 데이터 소스 우선순위, 처리 흐름 및 검증 메커니즘은 skill.md의 "분석 규칙" 섹션을 참조하세요.',
    'pt-BR': 'Para definições completas de dimensões, descrições de opções, prioridade de fontes de dados, fluxo de processamento e mecanismos de validação, consulte a seção "Regras de Análise" no skill.md.', 'fr-FR': 'Pour les définitions complètes de dimensions, descriptions d\'options, priorité des sources de données, flux de traitement et mécanismes de validation, référez-vous à la section "Règles d\'analyse" dans skill.md.',
    'es-ES': 'Para definiciones completas de dimensiones, descripciones de opciones, prioridad de fuentes de datos, flujo de procesamiento y mecanismos de validación, consulte la sección "Reglas de análisis" en skill.md.', 'ar-SA': 'لتعريفات الأبعاد الكاملة وأوصاف الخيارات وأولوية مصادر البيانات وتدفق المعالجة وآليات التحقق، راجع قسم "قواعد التحليل" في skill.md.',
  },
  'copy.sectionResult': {
    'zh-CN': '赛果比分板块', 'en-US': 'Match Result',
    'ja-JP': '試合結果セクション', 'ko-KR': '경기 결과 섹션',
    'pt-BR': 'Resultado da Partida', 'fr-FR': 'Résultat du match',
    'es-ES': 'Resultado del partido', 'ar-SA': 'نتيجة المباراة',
  },
  'copy.sectionGoal': {
    'zh-CN': '进球细节板块', 'en-US': 'Goal Details',
    'ja-JP': 'ゴール詳細セクション', 'ko-KR': '골 상세 섹션',
    'pt-BR': 'Detalhes dos Gols', 'fr-FR': 'Détails des buts',
    'es-ES': 'Detalles de goles', 'ar-SA': 'تفاصيل الأهداف',
  },
  'copy.sectionPenalty': {
    'zh-CN': '点球、VAR、判罚板块', 'en-US': 'Penalties & VAR',
    'ja-JP': 'ペナルティ・VAR・判定セクション', 'ko-KR': '페널티 & VAR 섹션',
    'pt-BR': 'Pênaltis e VAR', 'fr-FR': 'Penaltys et VAR',
    'es-ES': 'Penaltis y VAR', 'ar-SA': 'ركلات الجزاء وVAR',
  },
  'copy.sectionCard': {
    'zh-CN': '红黄牌、犯规板块', 'en-US': 'Cards & Fouls',
    'ja-JP': 'カード・ファウルセクション', 'ko-KR': '카드 & 파울 섹션',
    'pt-BR': 'Cartões e Faltas', 'fr-FR': 'Cartons et fautes',
    'es-ES': 'Tarjetas y faltas', 'ar-SA': 'البطاقات والأخطاء',
  },
  'copy.sectionCorner': {
    'zh-CN': '边角趣味数据板块', 'en-US': 'Fun Stats',
    'ja-JP': 'その他面白データセクション', 'ko-KR': '재미 통계 섹션',
    'pt-BR': 'Estatísticas Divertidas', 'fr-FR': 'Statistiques amusantes',
    'es-ES': 'Estadísticas divertidas', 'ar-SA': 'إحصائيات ممتعة',
  },
  'copy.outputFormatReq': {
    'zh-CN': '输出格式要求', 'en-US': 'Output Format Requirements',
    'ja-JP': '出力形式要件', 'ko-KR': '출력 형식 요구사항',
    'pt-BR': 'Requisitos de Formato de Saída', 'fr-FR': 'Exigences de format de sortie',
    'es-ES': 'Requisitos de formato de salida', 'ar-SA': 'متطلبات تنسيق الإخراج',
  },
  'copy.outputFormatReqDesc': {
    'zh-CN': '请使用 **Markdown** 输出，每个维度一个二级标题（##），结论在前、推理在后，**不要遗漏任何一项**。', 'en-US': 'Output in **Markdown**, one ## heading per dimension, conclusion first then reasoning. **Do not omit any dimension.**',
    'ja-JP': '**Markdown** で出力し、各ディメンションに2級見出し（##）を使用し、結論を先に、推論を後に記載してください。**いかなるディメンションも省略しないでください。**', 'ko-KR': '**Markdown**으로 출력하고, 각 차원에 2급 제목(##)을 사용하며, 결론을 먼저 그 다음 추론을 작성하세요. **어떤 차원도 생략하지 마세요.**',
    'pt-BR': 'Saída em **Markdown**, um cabeçalho ## por dimensão, conclusão primeiro e depois raciocínio. **Não omita nenhuma dimensão.**', 'fr-FR': 'Produisez en **Markdown**, un titre ## par dimension, conclusion d\'abord puis raisonnement. **N\'omettez aucune dimension.**',
    'es-ES': 'Produzca en **Markdown**, un encabezado ## por dimensión, conclusión primero y luego razonamiento. **No omita ninguna dimensión.**', 'ar-SA': 'أخرج بتنسيق **Markdown**، عنوان ## لكل بُعد، الاستنتاج أولاً ثم الاستدلال. **لا تحذف أي بُعد.**',
  },
  'copy.conclusionSummary': {
    'zh-CN': '综合结论', 'en-US': 'Overall Conclusion',
    'ja-JP': '総合結論', 'ko-KR': '종합 결론',
    'pt-BR': 'Conclusão Geral', 'fr-FR': 'Conclusion générale',
    'es-ES': 'Conclusión general', 'ar-SA': 'الاستنتاج الشامل',
  },
  'copy.conclusionSummaryDesc': {
    'zh-CN': '报告末尾给出一段 **200 字以内的"综合结论"**，包含：', 'en-US': 'At the end, provide an **"Overall Conclusion" within 200 words**, including:',
    'ja-JP': 'レポートの最後に**200字以内の「総合結論」**を記載してください。内容：', 'ko-KR': '보고서 마지막에 **200자 이내의 "종합 결론"**을 제공하세요. 포함 내용:',
    'pt-BR': 'No final, forneça uma **"Conclusão Geral" em até 200 palavras**, incluindo:', 'fr-FR': 'À la fin, fournissez une **"Conclusion générale" en moins de 200 mots**, incluant :',
    'es-ES': 'Al final, proporcione una **"Conclusión general" en menos de 200 palabras**, incluyendo:', 'ar-SA': 'في النهاية، قدم **"استنتاج شامل" في أقل من 200 كلمة**، يتضمن:',
  },
  'copy.mostLikelyResult': {
    'zh-CN': '- 最可能的结果 + 概率', 'en-US': '- Most likely result + probability',
    'ja-JP': '- 最も可能性の高い結果 + 確率', 'ko-KR': '- 가장 가능성 높은 결과 + 확률',
    'pt-BR': '- Resultado mais provável + probabilidade', 'fr-FR': '- Résultat le plus probable + probabilité',
    'es-ES': '- Resultado más probable + probabilidad', 'ar-SA': '- النتيجة الأكثر احتمالاً + الاحتمال',
  },
  'copy.keyUncertainties': {
    'zh-CN': '- 关键不确定因素', 'en-US': '- Key uncertainties',
    'ja-JP': '- 主要な不確実要因', 'ko-KR': '- 주요 불확실 요인',
    'pt-BR': '- Incertezas principais', 'fr-FR': '- Incertitudes clés',
    'es-ES': '- Incertidumbres clave', 'ar-SA': '- عوامل عدم اليقين الرئيسية',
  },
  'copy.bettingDisclaimer': {
    'zh-CN': '- 适合的投注玩法建议（仅作数据娱乐参考，不构成任何投注建议）', 'en-US': '- Suggested betting markets (for data entertainment only, not betting advice)',
    'ja-JP': '- 推奨されるベッティング市場（データエンターテインメント目的のみ、ベッティング助言ではありません）', 'ko-KR': '- 추천 베팅 시장 (데이터 엔터테인먼트 목적만, 베팅 조언이 아님)',
    'pt-BR': '- Mercados de apostas sugeridos (apenas para entretenimento de dados, não constitui conselho de apostas)', 'fr-FR': '- Marchés de paris suggérés (pour le divertissement des données uniquement, pas un conseil de pari)',
    'es-ES': '- Mercados de apuestas sugeridos (solo para entretenimiento de datos, no es consejo de apuestas)', 'ar-SA': '- أسواق الرهان المقترحة (للترفيه بالبيانات فقط، وليس نصيحة رهان)',
  },
  'copy.pleaseAnalyst': {
    'zh-CN': '请扮演专业的足球赛事分析师，**严格按照下方 21 维度逐项分析**，并使用 Markdown 格式输出报告。', 'en-US': 'Act as a professional football analyst. **Analyze all 21 dimensions strictly** and output in Markdown format.',
    'ja-JP': 'プロのサッカー試合アナリストとして振る舞い、**下記の21ディメンションを厳密に分析**し、Markdown形式でレポートを出力してください。', 'ko-KR': '프로 축구 경기 분석가로서 행동하세요. **아래 21개 차원을 엄격하게 분석**하고 Markdown 형식으로 출력하세요.',
    'pt-BR': 'Atue como um analista de futebol profissional. **Analise todas as 21 dimensões rigorosamente** e produza em formato Markdown.', 'fr-FR': 'Agissez comme un analyste de football professionnel. **Analysez strictement les 21 dimensions** et produisez au format Markdown.',
    'es-ES': 'Actúe como un analista de fútbol profesional. **Analice todas las 21 dimensiones estrictamente** y produzca en formato Markdown.', 'ar-SA': 'قم بدور محلل كرة قدم محترف. **حلل جميع الأبعاد الـ21 بدقة** وأخرج بتنسيق Markdown.',
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
 * 基础数据快照（精简版：引用 skill.md API，仅保留关键摘要）
 * Agent 可通过 skill.md 文档中的 API 端点获取完整数据
 */
function buildBaseSnapshot(input: CopyInstructionInput, dimTitle: string, _question: string, _optionsText: string): string {
  const m = input.match
  if (!m) return ''
  const loc = input.locale

  const homeTeamName = getTeamName(input, m.homeTeam) || i18n(loc, 'copy.homeTeam')
  const awayTeamName = getTeamName(input, m.awayTeam) || i18n(loc, 'copy.awayTeam')

  const base = input.appBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '<cupai_host>')
  const skillMdUrl = `${base}/api/v1/agent/open/skill.md?matchId=${m.id || ''}`
  const matchDetailUrl = `${base}/api/v1/match/${m.id || ''}`
  const lineupsUrl = `${base}/api/v1/match/${m.id || ''}/lineups`

  return `# ${i18n(loc, 'copy.dimAnalysis')} · ${dimTitle}

> ${i18n(loc, 'copy.thisMatch')}：**${homeTeamName} VS ${awayTeamName}**

## ${i18n(loc, 'copy.dataFetch')}

> **${i18n(loc, 'copy.fullApiDoc')}**：${skillMdUrl}
> ${i18n(loc, 'copy.apiDocDesc')}

${i18n(loc, 'copy.callApiFirst')}

1. **${i18n(loc, 'copy.matchDetailWithExtras')}**：\`GET ${matchDetailUrl}\`
2. **${i18n(loc, 'copy.bothLineups')}**：\`GET ${lineupsUrl}\`
3. ${i18n(loc, 'copy.otherDataRefSkillMd')}

## ${i18n(loc, 'copy.keyDataSummary')}

- **${i18n(loc, 'copy.event')}**：${m.leagueName || '—'}
- **${i18n(loc, 'copy.stage')}**：${m.stage || '—'}
- **${i18n(loc, 'copy.kickoff')}**：${m.startTime ? new Date(m.startTime).toISOString() : '—'}
- **${i18n(loc, 'copy.venue')}**：${m.venue || '—'}
${m.temperature ? `- **${i18n(loc, 'copy.weather')}**：${m.temperature}°C / ${m.weatherCondition || '—'}` : ''}
${m.refereeName ? `- **${i18n(loc, 'copy.referee')}**：${m.refereeName}` : ''}
${input.homeTeam ? `- **${i18n(loc, 'copy.homeTeam')}**：${getTeamName(input, m.homeTeam)} · FIFA #${input.homeTeam.fifaRank ?? '—'} · ${input.homeTeam.formation || '—'} · ${i18n(loc, 'copy.winRate')} ${(input.homeTeam.winRate || 0).toFixed(1)}%` : ''}
${input.awayTeam ? `- **${i18n(loc, 'copy.awayTeam')}**：${getTeamName(input, m.awayTeam)} · FIFA #${input.awayTeam.fifaRank ?? '—'} · ${input.awayTeam.formation || '—'} · ${i18n(loc, 'copy.winRate')} ${(input.awayTeam.winRate || 0).toFixed(1)}%` : ''}
`
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
  const loc = input.locale

  return `

---

## ${i18n(loc, 'copy.returnGuide')}

> **${i18n(loc, 'copy.fullIntegrationDoc')}**：${skillMdUrl}
> ${i18n(loc, 'copy.apiDocDesc')}

${i18n(loc, 'copy.afterAnalysisSubmit')}

\`\`\`bash
curl -X POST "${submitUrl}" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "matchId": "${matchId}",
    "dimKey": "${dimKey}",
    "topOption": "${i18n(loc, 'copy.topOptionPlaceholder')}",
    "topProbability": 0.55,
    "distribution": {},
    "summary": "${i18n(loc, 'copy.summaryPlaceholder')}",
    "model": "${i18n(loc, 'copy.modelPlaceholder')}",
    "platform": "${i18n(loc, 'copy.platformPlaceholder')}"
  }'
\`\`\`

${i18n(loc, 'copy.fieldDesc')}\`matchId\`${i18n(loc, 'copy.fieldRequired')} \`dimKey\`${i18n(loc, 'copy.fieldRequired')} \`topOption\` \`topProbability\`(0-1) \`distribution\` \`summary\` \`model\` \`platform\``
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
  locale?: string,
): string {
  return `## ${i18n(locale, 'copy.analysisTask')}

**${dimTitle}**

**${i18n(locale, 'copy.question')}**：${question}

**${i18n(locale, 'copy.optionsLabel')}**：
${optionsText}

## ${i18n(locale, 'copy.outputFormat')}

${i18n(locale, 'copy.outputFormatDesc')}

\`\`\`
## ${i18n(locale, 'copy.conclusion')}
${i18n(locale, 'copy.conclusionDesc')}

## ${i18n(locale, 'copy.probDistribution')}
${i18n(locale, 'copy.probDistributionDesc')}

## ${i18n(locale, 'copy.reasoning')}
${i18n(locale, 'copy.reasoningDesc')}

## ${i18n(locale, 'copy.riskUncertainty')}
${i18n(locale, 'copy.riskDesc')}
\`\`\`

${i18n(locale, 'copy.stayObjective')}`
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
  const task = buildDimensionPrompt(dimKey, resolvedTitle, resolvedQuestion, optionsText, input.locale)
  const returnGuide = buildReturnGuidance(input, dimKey)
  return [base, task, returnGuide].filter(Boolean).join('\n')
}

// ============================================================
// 完整赛事分析（保留兼容 + 综合回调用）
// ============================================================

/**
 * 21 维度分析规则（精简版，详细规则见 skill.md）
 * @param locale 当前语言
 */
function buildAnalysisRules(locale?: string): string {
  return `## ${i18n(locale, 'copy.analysisDimensions')}

> ${i18n(locale, 'copy.rulesRefSkillMd')}

### ${i18n(locale, 'copy.sectionResult')}
1. **result_wdl**：home / draw / away
2. **result_total_goals**：0 / 1 / 2 / 3 / 4+
3. **result_half_full**：HW / HD / HL / DW / DD / DL / LW / LD / LL
4. **result_exact_score**：top 3 most likely scores with probabilities

### ${i18n(locale, 'copy.sectionGoal')}
5. **goal_first_half**：yes / no
6. **goal_first**：home / away / noGoal
7. **goal_last**：home / away / noGoal
8. **goal_own**：yes / no
9. **goal_player_score**：score / noScore
10. **goal_stoppage**：yes / no
11. **goal_clean_sheet**：homeClean / awayClean / bothConcede
12. **goal_odd_even**：odd / even

### ${i18n(locale, 'copy.sectionPenalty')}
13. **penalty_awarded**：yes / no
14. **penalty_var_cancel**：yes / no
15. **penalty_knockout_extra**：extra / shootout / noExtra

### ${i18n(locale, 'copy.sectionCard')}
16. **card_red**：yes / no
17. **card_yellow_total**：0 / 1-2 / 3+
18. **card_yellow_compare**：homeMore / awayMore / equal

### ${i18n(locale, 'copy.sectionCorner')}
19. **corner_total**：0-3 / 4-6 / 7+
20. **corner_freekick_goal**：yes / no
21. **corner_substitutions**：homeMore / awayMore / equal

## ${i18n(locale, 'copy.outputFormatReq')}

${i18n(locale, 'copy.outputFormatReqDesc')}

${i18n(locale, 'copy.conclusionSummaryDesc')}
${i18n(locale, 'copy.mostLikelyResult')}
${i18n(locale, 'copy.keyUncertainties')}
${i18n(locale, 'copy.bettingDisclaimer')}`
}

/**
 * 生成比赛分析复制指令（精简版：引用 skill.md API，仅保留关键摘要 + 分析任务）
 */
export function buildMatchInstruction(input: CopyInstructionInput): string {
  const m = input.match
  if (!m) return ''
  const loc = input.locale

  const homeTeamName = getTeamName(input, m.homeTeam) || i18n(loc, 'copy.homeTeam')
  const awayTeamName = getTeamName(input, m.awayTeam) || i18n(loc, 'copy.awayTeam')

  const base = input.appBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '<cupai_host>')
  const skillMdUrl = `${base}/api/v1/agent/open/skill.md?matchId=${m.id || ''}`
  const matchDetailUrl = `${base}/api/v1/match/${m.id || ''}`
  const lineupsUrl = `${base}/api/v1/match/${m.id || ''}/lineups`

  const parts: string[] = [
    `# ${i18n(loc, 'copy.matchAnalysis')} · ${homeTeamName} VS ${awayTeamName}`,
    '',
    `> ${i18n(loc, 'copy.pleaseAnalyst')}`,
    '',
    `## ${i18n(loc, 'copy.dataFetch')}`,
    '',
    `> **${i18n(loc, 'copy.fullApiDoc')}**：${skillMdUrl}`,
    `> ${i18n(loc, 'copy.apiDocDesc')}`,
    '',
    i18n(loc, 'copy.callApiFirst'),
    '',
    `1. **${i18n(loc, 'copy.matchDetailWithExtras')}**：\`GET ${matchDetailUrl}\``,
    `2. **${i18n(loc, 'copy.bothLineups')}**：\`GET ${lineupsUrl}\``,
    `3. ${i18n(loc, 'copy.otherDataRefSkillMd')}`,
    '',
    `## ${i18n(loc, 'copy.keyDataSummary')}`,
    '',
    `- **${i18n(loc, 'copy.event')}**：${m.leagueName || '—'}`,
    `- **${i18n(loc, 'copy.stage')}**：${m.stage || '—'}`,
    `- **${i18n(loc, 'copy.kickoff')}**：${m.startTime ? new Date(m.startTime).toISOString() : '—'}`,
    `- **${i18n(loc, 'copy.venue')}**：${m.venue || '—'}`,
    m.temperature ? `- **${i18n(loc, 'copy.weather')}**：${m.temperature}°C / ${m.weatherCondition || '—'}` : '',
    m.refereeName ? `- **${i18n(loc, 'copy.referee')}**：${m.refereeName}` : '',
    input.homeTeam ? `- **${i18n(loc, 'copy.homeTeam')}**：${getTeamName(input, m.homeTeam)} · FIFA #${input.homeTeam.fifaRank ?? '—'} · ${input.homeTeam.formation || '—'} · ${i18n(loc, 'copy.winRate')} ${(input.homeTeam.winRate || 0).toFixed(1)}%` : '',
    input.awayTeam ? `- **${i18n(loc, 'copy.awayTeam')}**：${getTeamName(input, m.awayTeam)} · FIFA #${input.awayTeam.fifaRank ?? '—'} · ${input.awayTeam.formation || '—'} · ${i18n(loc, 'copy.winRate')} ${(input.awayTeam.winRate || 0).toFixed(1)}%` : '',
    '',
  ]

  if (input.promptTemplateContent) {
    parts.push(`## ${i18n(loc, 'copy.analysisTask')}`, '', input.promptTemplateContent, '')
  }

  parts.push(buildAnalysisRules(loc), '', buildReturnGuidance(input, 'all'))

  return parts.filter(Boolean).join('\n')
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
