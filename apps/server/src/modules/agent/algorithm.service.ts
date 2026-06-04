import { Injectable } from '@nestjs/common'
import {
  normalizeWeights,
  smoothExtremeWeights,
  crossFactorBalance,
  detectConflicts,
  adaptiveAdjust,
  detectScene,
  denoiseData,
  calculateConfidence,
  quantifySentiment,
  calculatePressureIndex,
  calculateFocusIndex,
} from '@cupai/utils'
import type { MatchScene } from '@cupai/utils'

/**
 * 算法引擎服务
 * 封装五大自研算法，供分析流程调用
 */
@Injectable()
export class AlgorithmService {
  /**
   * 完整的权重处理流程
   * 1. 归一化 → 2. 极值修正 → 3. 跨因子制衡 → 4. 场景自适应
   * @param rawWeights 原始权重
   * @param scene 赛事场景
   * @param envContext 环境上下文
   * @returns 处理后的权重 + 冲突检测结果
   */
  processWeights(
    rawWeights: Record<string, number>,
    scene?: MatchScene,
    envContext?: { homeAdvantage?: boolean; weatherExtreme?: number; matchImportance?: number },
  ) {
    // 步骤1：归一化
    const normalized = normalizeWeights(rawWeights)

    // 步骤2：极值修正
    const smoothed = smoothExtremeWeights(normalized)

    // 步骤3：跨因子制衡
    const balanced = crossFactorBalance(smoothed)

    // 步骤4：场景自适应（如果提供了场景）
    const finalWeights = scene
      ? adaptiveAdjust(balanced, scene, envContext)
      : balanced

    // 检测冲突
    const conflicts = detectConflicts(rawWeights)

    return {
      original: rawWeights,
      normalized,
      smoothed,
      balanced,
      final: finalWeights,
      conflicts,
      scene: scene || null,
    }
  }

  /**
   * 自动检测场景并处理权重
   * @param rawWeights 原始权重
   * @param stage 赛事阶段
   * @param isDerby 是否德比
   * @param isNeutral 是否中立场
   * @returns 处理结果
   */
  autoProcessWeights(
    rawWeights: Record<string, number>,
    stage: string,
    isDerby = false,
    isNeutral = false,
  ) {
    const scene = detectScene(stage, isDerby, isNeutral)
    return this.processWeights(rawWeights, scene)
  }

  /**
   * 数据降噪处理
   * @param data 原始数据序列
   * @param windowSize 移动平均窗口
   * @returns 降噪后的数据
   */
  processDataDenoise(data: number[], windowSize = 3) {
    return denoiseData(data, windowSize)
  }

  /**
   * 置信度评估
   * @param completeness 数据完整度
   * @param timeliness 数据时效性
   * @param consistency 数据一致性
   * @returns 置信度分数
   */
  evaluateConfidence(completeness: number, timeliness: number, consistency: number) {
    return calculateConfidence(completeness, timeliness, consistency)
  }

  /**
   * 舆情分析
   * @param positiveWords 正面词库
   * @param negativeWords 负面词库
   * @param text 待分析文本
   * @returns 情绪分析结果
   */
  analyzeSentiment(
    positiveWords: Record<string, number>,
    negativeWords: Record<string, number>,
    text: string,
  ) {
    return quantifySentiment(positiveWords, negativeWords, text)
  }

  /**
   * 压力指数计算
   */
  calculatePressure(negativeRatio: number, expectationGap: number, historicalPressure: number) {
    return calculatePressureIndex(negativeRatio, expectationGap, historicalPressure)
  }

  /**
   * 专注度计算
   */
  calculateFocus(attendanceRate: number, mediaFocus: number, distractionScore: number) {
    return calculateFocusIndex(attendanceRate, mediaFocus, distractionScore)
  }

  /**
   * 生成分析 Prompt（将权重+赛事数据注入模板）
   * @param promptTemplate Prompt 模板
   * @param weights 最终权重
   * @param matchData 赛事数据
   * @returns 注入数据后的完整 Prompt
   */
  generateAnalysisPrompt(
    promptTemplate: string,
    weights: Record<string, number>,
    matchData: Record<string, unknown>,
  ): string {
    let prompt = promptTemplate

    // 注入权重信息
    const weightSection = Object.entries(weights)
      .map(([key, value]) => `- ${key}: ${value}%`)
      .join('\n')
    prompt = prompt.replace(/\{\{weights\}\}/g, weightSection)

    // 注入赛事数据
    const dataSection = JSON.stringify(matchData, null, 2)
    prompt = prompt.replace(/\{\{matchData\}\}/g, dataSection)

    // 注入时间戳
    prompt = prompt.replace(/\{\{timestamp\}\}/g, new Date().toISOString())

    return prompt
  }
}
