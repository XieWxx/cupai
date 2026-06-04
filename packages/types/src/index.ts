/**
 * CupAI 统一类型定义
 * 前后端共享的 TypeScript 类型与接口
 */

// ============ 用户相关类型 ============

/** 用户信息 */
export interface IUser {
  id: string
  username: string
  nickname: string
  avatar: string
  region: string
  language: string
  timezone: string
  createdAt: string
  updatedAt: string
}

/** 用户 AI 配置（不含 API Key） */
export interface IUserAiConfig {
  id: string
  userId: string
  modelName: string
  apiEndpoint: string
  temperature: number
  maxTokens: number
}

// ============ 赛事相关类型 ============

/** 赛事基础信息 */
export interface IMatch {
  id: string
  leagueName: string
  stage: string
  homeTeam: ITeam
  awayTeam: ITeam
  startTime: string
  status: MatchStatus
  score: IMatchScore | null
  venue: string
  referee: string
  weather: IWeather | null
}

/** 赛事状态 */
export enum MatchStatus {
  UPCOMING = 'upcoming', // 未开赛
  LIVE = 'live', // 进行中
  FINISHED = 'finished', // 已完赛
}

/** 赛事比分 */
export interface IMatchScore {
  homeScore: number
  awayScore: number
  halfTimeHome: number
  halfTimeAway: number
  goals: IGoal[]
  cards: ICard[]
}

/** 球队信息 */
export interface ITeam {
  id: string
  name: string
  nameEn: string
  countryCode: string
  fifaRank: number
  logo: string
}

/** 进球记录 */
export interface IGoal {
  playerId: string
  playerName: string
  assistPlayerName: string | null
  minute: number
  isPenalty: boolean
  isOwnGoal: boolean
}

/** 卡牌记录 */
export interface ICard {
  playerId: string
  playerName: string
  minute: number
  type: 'yellow' | 'red'
}

/** 天气信息 */
export interface IWeather {
  temperature: number
  humidity: number
  condition: string
  windSpeed: number
}

// ============ 权重模型类型 ============

/** 分析因子权重配置 */
export interface IWeightModel {
  id: string
  userId: string
  name: string
  historicalRecord: number // 历史战绩权重
  teamStrength: number // 球队实力权重
  playerStatus: number // 球星状态权重
  realtimeDynamic: number // 实时动态权重
  environment: number // 临场环境权重
  tacticalCounter: number // 战术克制权重
  socialSentiment: number // 社交舆情权重
  hiddenFactors: number // 隐性赛事因子权重
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

/** 默认均衡模型权重 */
export const DEFAULT_WEIGHTS: Omit<IWeightModel, 'id' | 'userId' | 'name' | 'isDefault' | 'createdAt' | 'updatedAt'> = {
  historicalRecord: 18,
  teamStrength: 18,
  playerStatus: 14,
  realtimeDynamic: 12,
  environment: 10,
  tacticalCounter: 5,
  socialSentiment: 8,
  hiddenFactors: 15,
}

// ============ Prompt 模板类型 ============

/** Prompt 模板 */
export interface IPromptTemplate {
  id: string
  userId: string
  name: string
  scene: PromptScene
  content: string
  adaptedModel: string
  adaptedStage: string
  isPublic: boolean
  collectCount: number
  useCount: number
  isOriginal: boolean
  createdAt: string
  updatedAt: string
}

/** Prompt 适配场景 */
export enum PromptScene {
  MATCH_PREVIEW = 'match_preview', // 赛事前瞻
  TEAM_COMPARE = 'team_compare', // 球队对比
  PLAYER_ANALYSIS = 'player_analysis', // 球星分析
  QUALIFICATION_PREDICT = 'qualification_predict', // 出线推演
  SENTIMENT_ANALYSIS = 'sentiment_analysis', // 舆情研判
}

// ============ 分析报告类型 ============

/** AI 分析报告 */
export interface IAnalysisReport {
  id: string
  userId: string
  matchId: string
  modelId: string
  promptTemplateId: string
  llmType: string
  weightSnapshot: IWeightModel
  content: string
  isPublic: boolean
  source: ReportSource
  isAuthorized: boolean
  displayLanguage: string
  likeCount: number
  collectCount: number
  commentCount: number
  createdAt: string
}

/** 报告来源 */
export enum ReportSource {
  MANUAL = 'manual', // 用户手动生成
  AGENT = 'agent', // Agent 自动生成
}

// ============ 排行榜类型 ============

/** 用户排行信息 */
export interface IUserRanking {
  userId: string
  nickname: string
  countryCode: string
  avatar: string
  rank: number
  rankChange: number
  totalPredictions: number
  totalScore: number
  accuracy: number
  recentAccuracy: number
  preferredModel: string
}

// ============ 通用类型 ============

/** 分页请求参数 */
export interface IPaginationParams {
  page: number
  pageSize: number
}

/** 分页响应结果 */
export interface IPaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 统一 API 响应格式 */
export interface IApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
