/**
 * 社交舆情量化算法
 * 将社交平台文本数据转化为可量化的情绪分值、压力指数、专注度
 */

/** 情绪极性枚举 */
export type SentimentPolarity = 'positive' | 'negative' | 'neutral'

/** 舆情分析结果 */
export interface SentimentResult {
  /** 情绪分值（-1 到 1，负=悲观，正=乐观） */
  score: number
  /** 情绪极性 */
  polarity: SentimentPolarity
  /** 情绪强度（0-1） */
  intensity: number
  /** 置信度（0-1） */
  confidence: number
}

/**
 * 社交舆情量化：基于关键词权重的情绪打分
 * @param positiveWords 正面关键词及权重
 * @param negativeWords 负面关键词及权重
 * @param text 待分析文本
 * @returns 情绪分析结果
 */
export function quantifySentiment(
  positiveWords: Record<string, number>,
  negativeWords: Record<string, number>,
  text: string,
): SentimentResult {
  const lowerText = text.toLowerCase()

  let positiveScore = 0
  let negativeScore = 0
  let matchCount = 0

  // 正面词匹配
  for (const [word, weight] of Object.entries(positiveWords)) {
    const regex = new RegExp(word, 'gi')
    const matches = lowerText.match(regex)
    if (matches) {
      positiveScore += weight * matches.length
      matchCount += matches.length
    }
  }

  // 负面词匹配
  for (const [word, weight] of Object.entries(negativeWords)) {
    const regex = new RegExp(word, 'gi')
    const matches = lowerText.match(regex)
    if (matches) {
      negativeScore += weight * matches.length
      matchCount += matches.length
    }
  }

  // 计算综合情绪分值（-1 到 1）
  const totalScore = positiveScore - negativeScore
  const maxPossible = positiveScore + negativeScore || 1
  const normalizedScore = Number((totalScore / maxPossible).toFixed(4))

  // 判断极性
  const polarity: SentimentPolarity =
    normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral'

  // 情绪强度
  const intensity = Number(Math.min(1, Math.abs(normalizedScore)).toFixed(4))

  // 置信度：匹配词越多越可信
  const confidence = Number(Math.min(1, matchCount / 10).toFixed(4))

  return { score: normalizedScore, polarity, intensity, confidence }
}

/**
 * 压力指数计算
 * 基于舆论负面情绪、期望差距、历史压力数据
 * @param negativeRatio 负面舆情占比（0-1）
 * @param expectationGap 期望差距（实际-期望，负值表示低于期望）
 * @param historicalPressure 历史压力基线（0-1）
 * @returns 压力指数（0-1，越高压力越大）
 */
export function calculatePressureIndex(
  negativeRatio: number,
  expectationGap: number,
  historicalPressure: number,
): number {
  // 负面舆情权重最高
  const sentimentWeight = 0.45
  // 期望差距权重次之（归一化到 0-1）
  const gapNormalized = Math.min(1, Math.max(0, (0 - expectationGap) / 2))
  const gapWeight = 0.35
  // 历史压力权重最低
  const historyWeight = 0.2

  const pressure =
    negativeRatio * sentimentWeight +
    gapNormalized * gapWeight +
    historicalPressure * historyWeight

  return Number(Math.min(1, Math.max(0, pressure)).toFixed(4))
}

/**
 * 专注度计算
 * 基于训练出席率、媒体采访专注度、场外干扰因素
 * @param attendanceRate 训练出席率（0-1）
 * @param mediaFocus 媒体专注度评分（0-1，越高越专注）
 * @param distractionScore 场外干扰评分（0-1，越高干扰越大）
 * @returns 专注度（0-1，越高越专注）
 */
export function calculateFocusIndex(
  attendanceRate: number,
  mediaFocus: number,
  distractionScore: number,
): number {
  const attendanceWeight = 0.4
  const mediaWeight = 0.35
  const distractionWeight = 0.25

  const focus =
    attendanceRate * attendanceWeight +
    mediaFocus * mediaWeight +
    (1 - distractionScore) * distractionWeight

  return Number(Math.min(1, Math.max(0, focus)).toFixed(4))
}
