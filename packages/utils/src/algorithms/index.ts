/**
 * CupAI 自研算法模块
 * 五大核心算法：归一化、降噪、舆情量化、跨因子制衡、自适应调参
 */

// ============ 1. 动态权重归一化算法（已有，此处导出） ============
export { normalizeWeights, smoothExtremeWeights, validateWeights } from './normalize'

// ============ 2. 多维数据降噪与置信度算法 ============
export { denoiseData, calculateConfidence } from './denoise'

// ============ 3. 社交舆情量化算法 ============
export { quantifySentiment, calculatePressureIndex, calculateFocusIndex } from './sentiment'

// ============ 4. 跨因子制衡修正算法 ============
export { crossFactorBalance } from './cross-factor'

// ============ 5. 场景自适应智能调参算法 ============
export { adaptiveAdjust } from './adaptive'
