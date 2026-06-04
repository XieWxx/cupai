/**
 * 跨因子制衡修正算法
 * 当某些因子之间存在逻辑冲突或过度依赖时，自动进行制衡修正
 * 例如：历史战绩极好但球星状态极差 → 需要制衡修正
 */

/** 因子间制衡规则 */
interface BalanceRule {
  /** 因子A */
  factorA: string
  /** 因子B */
  factorB: string
  /** 冲突条件：当 A > thresholdA 且 B < thresholdB 时触发制衡 */
  thresholdA: number
  thresholdB: number
  /** 制衡修正量（从A转移给B的权重比例） */
  transferRatio: number
}

// 预定义制衡规则
const DEFAULT_RULES: BalanceRule[] = [
  // 历史战绩极好但球星状态极差 → 历史权重向球星状态转移
  {
    factorA: 'historicalRecord',
    factorB: 'playerStatus',
    thresholdA: 25,
    thresholdB: 8,
    transferRatio: 0.15,
  },
  // 球队实力极强但战术克制明显 → 实力权重向战术克制转移
  {
    factorA: 'teamStrength',
    factorB: 'tacticalCounter',
    thresholdA: 25,
    thresholdB: 5,
    transferRatio: 0.12,
  },
  // 社交舆情极好但隐性因子风险高 → 舆情权重向隐性因子转移
  {
    factorA: 'socialSentiment',
    factorB: 'hiddenFactors',
    thresholdA: 15,
    thresholdB: 10,
    transferRatio: 0.1,
  },
]

/**
 * 跨因子制衡修正
 * 检测因子间冲突并自动修正权重
 * @param weights 原始权重对象
 * @param rules 制衡规则（默认使用预定义规则）
 * @returns 修正后的权重对象
 */
export function crossFactorBalance(
  weights: Record<string, number>,
  rules: BalanceRule[] = DEFAULT_RULES,
): Record<string, number> {
  const result = { ...weights }

  for (const rule of rules) {
    const valueA = result[rule.factorA] ?? 0
    const valueB = result[rule.factorB] ?? 0

    // 检测冲突条件
    if (valueA > rule.thresholdA && valueB < rule.thresholdB) {
      // 计算转移量
      const transferAmount = Number((valueA * rule.transferRatio).toFixed(2))

      // 从 A 转移到 B
      result[rule.factorA] = Number((valueA - transferAmount).toFixed(2))
      result[rule.factorB] = Number((valueB + transferAmount).toFixed(2))
    }
  }

  return result
}

/**
 * 检测因子间冲突
 * @param weights 权重对象
 * @returns 冲突列表
 */
export function detectConflicts(
  weights: Record<string, number>,
  rules: BalanceRule[] = DEFAULT_RULES,
): Array<{ factorA: string; factorB: string; severity: 'low' | 'medium' | 'high' }> {
  const conflicts: Array<{ factorA: string; factorB: string; severity: 'low' | 'medium' | 'high' }> = []

  for (const rule of rules) {
    const valueA = weights[rule.factorA] ?? 0
    const valueB = weights[rule.factorB] ?? 0

    if (valueA > rule.thresholdA && valueB < rule.thresholdB) {
      // 评估冲突严重程度
      const gap = valueA - valueB
      const severity: 'low' | 'medium' | 'high' = gap > 30 ? 'high' : gap > 15 ? 'medium' : 'low'

      conflicts.push({
        factorA: rule.factorA,
        factorB: rule.factorB,
        severity,
      })
    }
  }

  return conflicts
}
