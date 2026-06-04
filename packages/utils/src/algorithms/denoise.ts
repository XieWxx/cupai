/**
 * 多维数据降噪与置信度算法
 * 对赛事数据进行异常值检测、平滑处理、置信度评估
 */

/**
 * 数据降噪：基于移动平均的异常值检测与修正
 * @param data 原始数据序列
 * @param windowSize 移动平均窗口大小（默认3）
 * @returns 降噪后的数据序列
 */
export function denoiseData(data: number[], windowSize = 3): number[] {
  if (data.length <= windowSize) return data

  const result: number[] = []

  for (let i = 0; i < data.length; i++) {
    // 计算窗口内的移动平均
    const start = Math.max(0, i - Math.floor(windowSize / 2))
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2))
    const window = data.slice(start, end)
    const movingAvg = window.reduce((sum, v) => sum + v, 0) / window.length

    // 计算标准差
    const variance = window.reduce((sum, v) => sum + Math.pow(v - movingAvg, 2), 0) / window.length
    const stdDev = Math.sqrt(variance)

    // 异常值检测：偏离移动平均超过 2 倍标准差视为异常
    const threshold = 2 * stdDev
    if (Math.abs(data[i] - movingAvg) > threshold && stdDev > 0) {
      // 用移动平均值替换异常值
      result.push(Number(movingAvg.toFixed(4)))
    } else {
      result.push(data[i])
    }
  }

  return result
}

/**
 * 置信度计算：基于数据完整度、时效性、一致性评估
 * @param completeness 数据完整度（0-1）
 * @param timeliness 数据时效性（0-1，越新越高）
 * @param consistency 数据一致性（0-1，多次来源是否一致）
 * @returns 综合置信度（0-1）
 */
export function calculateConfidence(
  completeness: number,
  timeliness: number,
  consistency: number,
): number {
  // 加权计算：完整度最重要，时效性次之，一致性辅助
  const weights = {
    completeness: 0.4,
    timeliness: 0.35,
    consistency: 0.25,
  }

  const confidence =
    completeness * weights.completeness +
    timeliness * weights.timeliness +
    consistency * weights.consistency

  return Number(Math.min(1, Math.max(0, confidence)).toFixed(4))
}

/**
 * 批量置信度评估
 * @param dataPoints 数据点数组，每项包含 value 和 metadata
 * @returns 每个数据点的置信度
 */
export function batchConfidence(
  dataPoints: Array<{ value: number; completeness: number; timeliness: number; consistency: number }>,
): Array<{ value: number; confidence: number }> {
  return dataPoints.map((point) => ({
    value: point.value,
    confidence: calculateConfidence(point.completeness, point.timeliness, point.consistency),
  }))
}
