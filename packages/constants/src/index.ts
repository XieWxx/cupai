/**
 * CupAI 全局常量定义
 * 前后端共享的业务常量与配置
 */

// ============ 权重因子常量 ============

/** 8 大分析因子标识 */
export const FACTOR_KEYS = [
  'historicalRecord',
  'teamStrength',
  'playerStatus',
  'realtimeDynamic',
  'environment',
  'tacticalCounter',
  'socialSentiment',
  'hiddenFactors',
] as const

/** 因子中文名称映射 */
export const FACTOR_LABELS: Record<string, string> = {
  historicalRecord: '历史战绩',
  teamStrength: '球队实力',
  playerStatus: '球星状态',
  realtimeDynamic: '实时动态',
  environment: '临场环境',
  tacticalCounter: '战术克制',
  socialSentiment: '社交舆情',
  hiddenFactors: '隐性赛事因子',
}

/** 因子英文名称映射 */
export const FACTOR_LABELS_EN: Record<string, string> = {
  historicalRecord: 'Historical Record',
  teamStrength: 'Team Strength',
  playerStatus: 'Player Status',
  realtimeDynamic: 'Real-time Dynamic',
  environment: 'Environment',
  tacticalCounter: 'Tactical Counter',
  socialSentiment: 'Social Sentiment',
  hiddenFactors: 'Hidden Factors',
}

// ============ 权重约束 ============

/** 权重总和必须等于 100 */
export const WEIGHT_SUM = 100

/** 单因子权重上限（极值修正阈值） */
export const WEIGHT_MAX_SINGLE = 60

/** 单因子权重下限 */
export const WEIGHT_MIN = 0

// ============ 支持的大模型 ============

/** 平台支持的大模型列表 */
export const SUPPORTED_LLM_MODELS = [
  { key: 'deepseek', name: 'DeepSeek', nameEn: 'DeepSeek' },
  { key: 'gpt', name: 'GPT', nameEn: 'GPT' },
  { key: 'qwen', name: '通义千问', nameEn: 'Qwen' },
  { key: 'doubao', name: '豆包', nameEn: 'Doubao' },
  { key: 'spark', name: '讯飞星火', nameEn: 'iFlytek Spark' },
  { key: 'wenxin', name: '文心一言', nameEn: 'Wenxin' },
  { key: 'custom', name: '自定义', nameEn: 'Custom' },
] as const

// ============ 国际化常量 ============

/** 支持的语言列表 */
export const SUPPORTED_LOCALES = [
  { code: 'zh-CN', name: '简体中文', nameEn: 'Simplified Chinese' },
  { code: 'zh-TW', name: '繁体中文', nameEn: 'Traditional Chinese' },
  { code: 'en-US', name: 'English', nameEn: 'English' },
  { code: 'es-ES', name: 'Español', nameEn: 'Spanish' },
  { code: 'pt-BR', name: 'Português', nameEn: 'Portuguese' },
  { code: 'fr-FR', name: 'Français', nameEn: 'French' },
] as const

/** 默认语言 */
export const DEFAULT_LOCALE = 'zh-CN'

// ============ 风控常量 ============

/** 博彩相关屏蔽关键词（部分示例） */
export const GAMBLING_BLOCKED_WORDS = [
  '赔率',
  '下注',
  '稳赚',
  '跟单',
  '赌球',
  '投注',
  '精准比分',
  '输赢预测',
  'odds',
  'betting',
  'gamble',
  'wager',
] as const

// ============ 排行计分 ============

/** 预测精准匹配得分 */
export const PREDICTION_SCORES = {
  EXACT_MATCH: 10, // 精准匹配
  BASIC_MATCH: 6, // 基本匹配
  PARTIAL_MATCH: 2, // 偏差预判
  NO_MATCH: 0, // 完全偏差
} as const
