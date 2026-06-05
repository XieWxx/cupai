/**
 * 多语言情感分析引擎
 * 支持 8 种语言的海外舆情精准识别
 * 基于语言特定关键词 + 权重体系 + 文化语境修正
 */

/** 支持的语言代码 */
export type SupportedLanguage = 'zh-CN' | 'en-US' | 'es-ES' | 'fr-FR' | 'pt-BR' | 'ar-SA' | 'ja-JP' | 'ko-KR'

/** 情感分析结果 */
export interface MultilingualSentimentResult {
  /** 情绪分值（-1 到 1） */
  score: number
  /** 情绪极性 */
  polarity: 'positive' | 'negative' | 'neutral'
  /** 情绪强度（0-1） */
  intensity: number
  /** 置信度（0-1） */
  confidence: number
  /** 检测到的语言 */
  detectedLanguage: SupportedLanguage
  /** 匹配到的关键词列表 */
  matchedKeywords: string[]
  /** 文化语境修正系数 */
  culturalModifier: number
}

/**
 * 各语言正面/负面关键词库
 * 每个词附带权重（0.1-1.0），权重越高影响越大
 */
const LANGUAGE_LEXICONS: Record<SupportedLanguage, {
  positive: Record<string, number>
  negative: Record<string, number>
  /** 文化修正系数：某些语言文化表达更含蓄/更激烈 */
  culturalWeight: number
}> = {
  'zh-CN': {
    positive: {
      '强大': 0.8, '出色': 0.7, '精彩': 0.8, '夺冠': 0.9, '无敌': 0.9,
      '稳定': 0.6, '默契': 0.7, '核心': 0.6, '突破': 0.7, '领先': 0.7,
      '优势': 0.6, '信心': 0.6, '看好': 0.7, '实力': 0.6, '状态好': 0.7,
    },
    negative: {
      '低迷': 0.8, '失误': 0.7, '伤病': 0.9, '崩盘': 0.9, '出局': 0.8,
      '压力': 0.6, '紧张': 0.5, '不利': 0.6, '落后': 0.7, '爆冷': 0.6,
      '失望': 0.7, '危机': 0.8, '隐患': 0.6, '疲态': 0.7, '争议': 0.5,
    },
    culturalWeight: 1.0,
  },
  'en-US': {
    positive: {
      'strong': 0.7, 'excellent': 0.8, 'brilliant': 0.9, 'champion': 0.9, 'dominant': 0.8,
      'solid': 0.6, 'confident': 0.7, 'impressive': 0.8, 'outstanding': 0.9, 'unstoppable': 0.9,
      'favorite': 0.7, 'powerful': 0.7, 'skilled': 0.6, 'winning': 0.8, 'formidable': 0.8,
      'tactical': 0.6, 'disciplined': 0.6, 'creative': 0.7, 'resilient': 0.7, 'focused': 0.6,
    },
    negative: {
      'weak': 0.7, 'poor': 0.7, 'disappointing': 0.8, 'injury': 0.9, 'collapse': 0.9,
      'struggling': 0.7, 'pressure': 0.6, 'nervous': 0.5, 'behind': 0.6, 'upset': 0.6,
      'crisis': 0.8, 'concern': 0.6, 'fatigue': 0.7, 'controversy': 0.5, 'vulnerable': 0.7,
      'inconsistent': 0.6, 'defensive': 0.4, 'overrated': 0.7, 'underperform': 0.7, 'chaotic': 0.7,
    },
    culturalWeight: 1.1, // 英语表达倾向更夸张
  },
  'es-ES': {
    positive: {
      'fuerte': 0.7, 'excelente': 0.8, 'brillante': 0.9, 'campeón': 0.9, 'dominante': 0.8,
      'sólido': 0.6, 'confiado': 0.7, 'impresionante': 0.8, 'increíble': 0.9, 'imparable': 0.9,
      'favorito': 0.7, 'potente': 0.7, 'hábil': 0.6, 'ganador': 0.8, 'extraordinario': 0.8,
      'táctico': 0.6, 'disciplinado': 0.6, 'creativo': 0.7, 'resiliente': 0.7, 'enfocado': 0.6,
    },
    negative: {
      'débil': 0.7, 'malo': 0.7, 'decepcionante': 0.8, 'lesión': 0.9, 'colapso': 0.9,
      'luchando': 0.7, 'presión': 0.6, 'nervioso': 0.5, 'detrás': 0.6, 'sorprendente': 0.5,
      'crisis': 0.8, 'preocupación': 0.6, 'fatiga': 0.7, 'controversia': 0.5, 'vulnerable': 0.7,
      'inconsistente': 0.6, 'defensivo': 0.4, 'sobrevalorado': 0.7, 'fracaso': 0.8, 'caótico': 0.7,
    },
    culturalWeight: 1.15, // 西语表达更激情
  },
  'fr-FR': {
    positive: {
      'fort': 0.7, 'excellent': 0.8, 'brillant': 0.9, 'champion': 0.9, 'dominant': 0.8,
      'solide': 0.6, 'confiant': 0.7, 'impressionnant': 0.8, 'extraordinaire': 0.9, 'imbattable': 0.9,
      'favori': 0.7, 'puissant': 0.7, 'habile': 0.6, 'gagnant': 0.8, 'remarquable': 0.8,
      'tactique': 0.6, 'discipliné': 0.6, 'créatif': 0.7, 'résilient': 0.7, 'concentré': 0.6,
    },
    negative: {
      'faible': 0.7, 'mauvais': 0.7, 'décevant': 0.8, 'blessure': 0.9, 'effondrement': 0.9,
      'difficulté': 0.7, 'pression': 0.6, 'nerveux': 0.5, 'derrière': 0.6, 'surpris': 0.5,
      'crise': 0.8, 'inquiétude': 0.6, 'fatigue': 0.7, 'controverse': 0.5, 'vulnérable': 0.7,
      'incohérent': 0.6, 'défensif': 0.4, 'surévalué': 0.7, 'échec': 0.8, 'chaotique': 0.7,
    },
    culturalWeight: 1.05,
  },
  'pt-BR': {
    positive: {
      'forte': 0.7, 'excelente': 0.8, 'brilhante': 0.9, 'campeão': 0.9, 'dominante': 0.8,
      'sólido': 0.6, 'confiante': 0.7, 'impressionante': 0.8, 'incrível': 0.9, 'imparável': 0.9,
      'favorito': 0.7, 'potente': 0.7, 'habilidoso': 0.6, 'vencedor': 0.8, 'extraordinário': 0.8,
      'tático': 0.6, 'disciplinado': 0.6, 'criativo': 0.7, 'resiliente': 0.7, 'focado': 0.6,
    },
    negative: {
      'fraco': 0.7, 'ruim': 0.7, 'decepcionante': 0.8, 'lesão': 0.9, 'colapso': 0.9,
      'lutando': 0.7, 'pressão': 0.6, 'nervoso': 0.5, 'atrás': 0.6, 'surpresa': 0.5,
      'crise': 0.8, 'preocupação': 0.6, 'fadiga': 0.7, 'controvérsia': 0.5, 'vulnerável': 0.7,
      'inconsistente': 0.6, 'defensivo': 0.4, 'superestimado': 0.7, 'fracasso': 0.8, 'caótico': 0.7,
    },
    culturalWeight: 1.15, // 巴西人表达更激情
  },
  'ar-SA': {
    positive: {
      'ممتاز': 0.8, 'رائع': 0.9, 'بطل': 0.9, 'مهيمن': 0.8,
      'متماسك': 0.6, 'واثق': 0.7, 'مبهر': 0.8, 'استثنائي': 0.9, 'لا يقهر': 0.9,
      'مرشح': 0.7, 'قوي': 0.7, 'ماهر': 0.6, 'فائز': 0.8, 'مذهل': 0.8,
    },
    negative: {
      'سيء': 0.7, 'مخيب': 0.8, 'إصابة': 0.9, 'انهيار': 0.9,
      'يعاني': 0.7, 'ضغط': 0.6, 'متوتر': 0.5, 'متأخر': 0.6, 'أزمة': 0.8,
      'قلق': 0.6, 'إرهاق': 0.7, 'جدل': 0.5, 'ضعيف': 0.7, 'فاشل': 0.8,
    },
    culturalWeight: 1.1,
  },
  'ja-JP': {
    positive: {
      '強い': 0.7, '素晴らしい': 0.8, '見事': 0.8, '優勝': 0.9, '圧倒的': 0.9,
      '安定': 0.6, '自信': 0.7, '素晴': 0.7, '好調': 0.7, '有力': 0.7,
      '期待': 0.6, '実力': 0.6, '勝利': 0.8, '活躍': 0.7, '快勝': 0.8,
    },
    negative: {
      '弱い': 0.7, '残念': 0.7, '怪我': 0.9, '崩壊': 0.9, '敗退': 0.8,
      '不安': 0.6, '緊張': 0.5, '不利': 0.6, '低迷': 0.7, '波乱': 0.6,
      '失望': 0.7, '危機': 0.8, '疲労': 0.7, '混乱': 0.6, '苦戦': 0.7,
    },
    culturalWeight: 0.9, // 日语表达更含蓄
  },
  'ko-KR': {
    positive: {
      '강하다': 0.7, '훌륭하다': 0.8, '멋지다': 0.8, '우승': 0.9, '압도적': 0.9,
      '안정': 0.6, '자신감': 0.7, '호조': 0.7, '유력': 0.7, '기대': 0.6,
      '실력': 0.6, '승리': 0.8, '활약': 0.7, '완승': 0.8, '최고': 0.9,
    },
    negative: {
      '약하다': 0.7, '아쉽다': 0.7, '부상': 0.9, '붕괴': 0.9, '탈락': 0.8,
      '불안': 0.6, '긴장': 0.5, '불리': 0.6, '부진': 0.7, '파란': 0.6,
      '실망': 0.7, '위기': 0.8, '피로': 0.7, '혼란': 0.6, '고전': 0.7,
    },
    culturalWeight: 0.95,
  },
}

/**
 * 语言检测（基于字符特征快速判断）
 * 生产环境建议接入专业语言检测 API
 */
export function detectLanguage(text: string): SupportedLanguage {
  // 阿拉伯语字符范围
  if (/[\u0600-\u06FF]/.test(text)) return 'ar-SA'
  // 日语平假名/片假名
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja-JP'
  // 韩语字符
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko-KR'
  // 中文字符
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN'
  // 葡萄牙语特征词
  if (/\b(não|ção|mente|idade|que|uma|para)\b/i.test(text)) return 'pt-BR'
  // 西班牙语特征词
  if (/\b(el|la|los|las|ción|mente|que|una|para)\b/i.test(text)) return 'es-ES'
  // 法语特征词
  if (/\b(le|la|les|tion|ment|une|pour|avec)\b/i.test(text)) return 'fr-FR'
  // 默认英语
  return 'en-US'
}

/**
 * 多语言情感分析
 * 自动检测语言 → 匹配对应词库 → 文化语境修正 → 输出结果
 */
export function analyzeMultilingualSentiment(text: string, language?: SupportedLanguage): MultilingualSentimentResult {
  const detectedLanguage = language || detectLanguage(text)
  const lexicon = LANGUAGE_LEXICONS[detectedLanguage]

  const lowerText = text.toLowerCase()
  let positiveScore = 0
  let negativeScore = 0
  const matchedKeywords: string[] = []

  // 正面词匹配
  for (const [word, weight] of Object.entries(lexicon.positive)) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = lowerText.match(regex)
    if (matches) {
      positiveScore += weight * matches.length
      matchedKeywords.push(word)
    }
  }

  // 负面词匹配
  for (const [word, weight] of Object.entries(lexicon.negative)) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = lowerText.match(regex)
    if (matches) {
      negativeScore += weight * matches.length
      matchedKeywords.push(word)
    }
  }

  // 文化语境修正
  const culturalModifier = lexicon.culturalWeight

  // 计算综合情绪分值
  const totalScore = positiveScore - negativeScore
  const maxPossible = (positiveScore + negativeScore) || 1
  let normalizedScore = totalScore / maxPossible

  // 应用文化修正（含蓄文化放大偏差，激烈文化缩小偏差）
  normalizedScore = normalizedScore * culturalModifier

  // 钳制到 [-1, 1]
  normalizedScore = Math.max(-1, Math.min(1, normalizedScore))

  // 判断极性
  const polarity: 'positive' | 'negative' | 'neutral' =
    normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral'

  // 情绪强度
  const intensity = Math.min(1, Math.abs(normalizedScore))

  // 置信度：匹配词越多越可信
  const confidence = Math.min(1, matchedKeywords.length / 8)

  return {
    score: Number(normalizedScore.toFixed(4)),
    polarity,
    intensity: Number(intensity.toFixed(4)),
    confidence: Number(confidence.toFixed(4)),
    detectedLanguage,
    matchedKeywords,
    culturalModifier: Number(culturalModifier.toFixed(2)),
  }
}

/**
 * 批量分析舆情数据
 * 用于 Agent 定时任务批量处理
 */
export function batchAnalyzeSentiment(
  items: Array<{ text: string; language?: SupportedLanguage }>,
): MultilingualSentimentResult[] {
  return items.map((item) => analyzeMultilingualSentiment(item.text, item.language))
}

/**
 * 舆情聚合统计
 * 将多条舆情数据聚合为球队/赛事级别的统计指标
 */
export interface SentimentAggregation {
  /** 样本数量 */
  sampleCount: number
  /** 平均情绪分值 */
  avgScore: number
  /** 正面占比 */
  positiveRatio: number
  /** 负面占比 */
  negativeRatio: number
  /** 中性占比 */
  neutralRatio: number
  /** 平均情绪强度 */
  avgIntensity: number
  /** 平均置信度 */
  avgConfidence: number
  /** 压力指数（基于负面占比计算） */
  pressureIndex: number
  /** 语言分布 */
  languageDistribution: Record<string, number>
  /** 地区分布 */
  regionDistribution: Record<string, number>
  /** 热度趋势（最近N条的时间分布） */
  trendDirection: 'rising' | 'falling' | 'stable'
}

/**
 * 聚合舆情数据
 */
export function aggregateSentiment(results: Array<MultilingualSentimentResult & { region?: string }>): SentimentAggregation {
  if (results.length === 0) {
    return {
      sampleCount: 0, avgScore: 0, positiveRatio: 0, negativeRatio: 0,
      neutralRatio: 0, avgIntensity: 0, avgConfidence: 0, pressureIndex: 0,
      languageDistribution: {}, regionDistribution: {}, trendDirection: 'stable',
    }
  }

  const total = results.length
  const scores = results.map((r) => r.score)
  const avgScore = scores.reduce((a, b) => a + b, 0) / total

  const positiveCount = results.filter((r) => r.polarity === 'positive').length
  const negativeCount = results.filter((r) => r.polarity === 'negative').length
  const neutralCount = total - positiveCount - negativeCount

  const avgIntensity = results.reduce((a, r) => a + r.intensity, 0) / total
  const avgConfidence = results.reduce((a, r) => a + r.confidence, 0) / total

  // 压力指数：负面占比越高压力越大
  const negativeRatio = negativeCount / total
  const pressureIndex = Math.min(1, negativeRatio * 1.5)

  // 语言分布
  const languageDistribution: Record<string, number> = {}
  for (const r of results) {
    const lang = r.detectedLanguage
    languageDistribution[lang] = (languageDistribution[lang] || 0) + 1
  }

  // 地区分布
  const regionDistribution: Record<string, number> = {}
  for (const r of results) {
    if (r.region) {
      regionDistribution[r.region] = (regionDistribution[r.region] || 0) + 1
    }
  }

  // 趋势方向（简单判断：后一半 vs 前一半的平均分）
  const half = Math.floor(total / 2)
  const firstHalfAvg = scores.slice(0, half).reduce((a, b) => a + b, 0) / (half || 1)
  const secondHalfAvg = scores.slice(half).reduce((a, b) => a + b, 0) / (total - half || 1)
  const diff = secondHalfAvg - firstHalfAvg
  const trendDirection: 'rising' | 'falling' | 'stable' =
    diff > 0.05 ? 'rising' : diff < -0.05 ? 'falling' : 'stable'

  return {
    sampleCount: total,
    avgScore: Number(avgScore.toFixed(4)),
    positiveRatio: Number((positiveCount / total).toFixed(4)),
    negativeRatio: Number(negativeRatio.toFixed(4)),
    neutralRatio: Number((neutralCount / total).toFixed(4)),
    avgIntensity: Number(avgIntensity.toFixed(4)),
    avgConfidence: Number(avgConfidence.toFixed(4)),
    pressureIndex: Number(pressureIndex.toFixed(4)),
    languageDistribution,
    regionDistribution,
    trendDirection,
  }
}
