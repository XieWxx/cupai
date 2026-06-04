/**
 * 动态权重归一化算法
 * 确保所有因子权重总和 = 100%，处理零值/极值
 */

import { WEIGHT_SUM, WEIGHT_MAX_SINGLE, WEIGHT_MIN, FACTOR_KEYS } from '@cupai/constants'
import type { IWeightModel } from '@cupai/types'

/**
 * 动态权重归一化
 * @param weights 原始权重对象
 * @returns 归一化后的权重对象
 */
export function normalizeWeights(weights: Record<string, number>): Record<string, number> {
  // 过滤掉零值因子
  const activeFactors = Object.entries(weights).filter(([, v]) => v > 0)

  if (activeFactors.length === 0) {
    // 全部为零时，均分权重
    const equalWeight = WEIGHT_SUM / FACTOR_KEYS.length
    const result: Record<string, number> = {}
    FACTOR_KEYS.forEach((key) => {
      result[key] = Number(equalWeight.toFixed(2))
    })
    return result
  }

  // 计算原始总和
  const rawSum = activeFactors.reduce((sum, [, v]) => sum + v, 0)

  // 归一化：按比例缩放至总和 = 100
  const result: Record<string, number> = {}
  FACTOR_KEYS.forEach((key) => {
    const raw = weights[key] ?? 0
    result[key] = raw === 0 ? 0 : Number(((raw / rawSum) * WEIGHT_SUM).toFixed(2))
  })

  // 修正浮点误差，确保总和精确 = 100
  const normalizedSum = Object.values(result).reduce((sum, v) => sum + v, 0)
  if (Math.abs(normalizedSum - WEIGHT_SUM) > 0.01) {
    const maxKey = activeFactors.sort((a, b) => b[1] - a[1])[0][0]
    result[maxKey] = Number((result[maxKey] + (WEIGHT_SUM - normalizedSum)).toFixed(2))
  }

  return result
}

/**
 * 极值修正：单因子权重超阈值时平滑处理
 * @param weights 归一化后的权重
 * @returns 修正后的权重
 */
export function smoothExtremeWeights(weights: Record<string, number>): Record<string, number> {
  const hasExtreme = Object.values(weights).some((v) => v > WEIGHT_MAX_SINGLE)
  if (!hasExtreme) return weights

  const result = { ...weights }
  let overflow = 0
  const belowMaxKeys: string[] = []

  FACTOR_KEYS.forEach((key) => {
    if (result[key] > WEIGHT_MAX_SINGLE) {
      overflow += result[key] - WEIGHT_MAX_SINGLE
      result[key] = WEIGHT_MAX_SINGLE
    } else if (result[key] > 0) {
      belowMaxKeys.push(key)
    }
  })

  if (belowMaxKeys.length > 0 && overflow > 0) {
    const share = overflow / belowMaxKeys.length
    belowMaxKeys.forEach((key) => {
      result[key] = Number((result[key] + share).toFixed(2))
    })
  }

  return result
}

/**
 * 校验权重模型是否合法
 * @param weights 权重对象
 * @returns 校验结果
 */
export function validateWeights(weights: Partial<IWeightModel>): { valid: boolean; message: string } {
  const factorValues = FACTOR_KEYS.map((key) => weights[key as keyof IWeightModel] as number)

  if (factorValues.some((v) => v < WEIGHT_MIN)) {
    return { valid: false, message: '权重值不能为负数' }
  }

  const sum = factorValues.reduce((a, b) => a + b, 0)
  if (Math.abs(sum - WEIGHT_SUM) > 0.01) {
    return { valid: false, message: `权重总和必须为 ${WEIGHT_SUM}%，当前为 ${sum}%` }
  }

  return { valid: true, message: '校验通过' }
}
