/**
 * CupAI 自研算法模块
 * 五大核心算法 + 多语言舆情引擎
 */

// ============ 1. 动态权重归一化算法 ============
export { normalizeWeights, smoothExtremeWeights, validateWeights } from './normalize'

// ============ 2. 多维数据降噪与置信度算法 ============
export { denoiseData, calculateConfidence } from './denoise'

// ============ 3. 社交舆情量化算法 ============
export { quantifySentiment, calculatePressureIndex, calculateFocusIndex } from './sentiment'

// ============ 4. 跨因子制衡修正算法 ============
export { crossFactorBalance, detectConflicts } from './cross-factor'

// ============ 5. 场景自适应智能调参算法 ============
export { adaptiveAdjust, detectScene } from './adaptive'
export type { MatchScene } from './adaptive'

// ============ 6. 多语言情感分析引擎 ============
export {
  analyzeMultilingualSentiment,
  batchAnalyzeSentiment,
  aggregateSentiment,
  detectLanguage,
} from './multilingual-sentiment'
export type { SupportedLanguage, MultilingualSentimentResult, SentimentAggregation } from './multilingual-sentiment'
