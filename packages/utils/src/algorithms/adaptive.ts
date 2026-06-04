/**
 * 场景自适应智能调参算法
 * 根据赛事阶段、环境条件、数据特征自动调整权重模型
 */

/** 赛事场景类型 */
export type MatchScene = 'group' | 'knockout' | 'final' | 'derby' | 'neutral'

/** 环境条件 */
export interface EnvironmentContext {
  /** 是否为主场优势明显 */
  homeAdvantage: boolean
  /** 天气极端程度（0-1） */
  weatherExtreme: number
  /** 赛事重要性（0-1） */
  matchImportance: number
  /** 是否为德比战 */
  isDerby: boolean
}

/** 场景预设权重偏移量 */
const SCENE_PRESETS: Record<MatchScene, Record<string, number>> = {
  // 小组赛：历史战绩和球队实力权重较高
  group: {
    historicalRecord: 3,
    teamStrength: 3,
    playerStatus: 0,
    realtimeDynamic: -1,
    environment: -2,
    tacticalCounter: -1,
    socialSentiment: -1,
    hiddenFactors: -1,
  },
  // 淘汰赛：球星状态和战术克制权重提升
  knockout: {
    historicalRecord: -2,
    teamStrength: 0,
    playerStatus: 3,
    realtimeDynamic: 2,
    environment: 0,
    tacticalCounter: 2,
    socialSentiment: 1,
    hiddenFactors: -2,
  },
  // 决赛：隐性因子和实时动态权重提升
  final: {
    historicalRecord: -3,
    teamStrength: -1,
    playerStatus: 2,
    realtimeDynamic: 3,
    environment: 2,
    tacticalCounter: 1,
    socialSentiment: 2,
    hiddenFactors: 3,
  },
  // 德比战：社交舆情和战术克制权重提升
  derby: {
    historicalRecord: -2,
    teamStrength: 0,
    playerStatus: 1,
    realtimeDynamic: 2,
    environment: 0,
    tacticalCounter: 3,
    socialSentiment: 3,
    hiddenFactors: 1,
  },
  // 中立场：环境因子降低
  neutral: {
    historicalRecord: 2,
    teamStrength: 2,
    playerStatus: 1,
    realtimeDynamic: 0,
    environment: -3,
    tacticalCounter: 0,
    socialSentiment: -1,
    hiddenFactors: 1,
  },
}

/**
 * 场景自适应调参
 * 根据赛事场景自动调整权重模型
 * @param weights 原始权重
 * @param scene 赛事场景
 * @param envContext 环境上下文（可选）
 * @returns 调整后的权重
 */
export function adaptiveAdjust(
  weights: Record<string, number>,
  scene: MatchScene,
  envContext?: Partial<EnvironmentContext>,
): Record<string, number> {
  const result = { ...weights }
  const preset = SCENE_PRESETS[scene] || SCENE_PRESETS.group

  // 应用场景预设偏移
  for (const [key, offset] of Object.entries(preset)) {
    if (result[key] !== undefined) {
      result[key] = Number((result[key] + offset).toFixed(2))
      // 确保权重不为负
      result[key] = Math.max(0, result[key])
    }
  }

  // 环境条件微调
  if (envContext) {
    // 主场优势：增加实时动态权重
    if (envContext.homeAdvantage) {
      result.realtimeDynamic = Number((result.realtimeDynamic + 2).toFixed(2))
    }

    // 极端天气：增加环境因子权重
    if (envContext.weatherExtreme && envContext.weatherExtreme > 0.7) {
      result.environment = Number((result.environment + 3).toFixed(2))
    }

    // 高重要性赛事：增加隐性因子权重
    if (envContext.matchImportance && envContext.matchImportance > 0.8) {
      result.hiddenFactors = Number((result.hiddenFactors + 2).toFixed(2))
    }
  }

  // 重新归一化确保总和 = 100
  const sum = Object.values(result).reduce((s, v) => s + v, 0)
  if (Math.abs(sum - 100) > 0.01 && sum > 0) {
    for (const key of Object.keys(result)) {
      result[key] = Number(((result[key] / sum) * 100).toFixed(2))
    }
  }

  return result
}

/**
 * 自动识别赛事场景
 * @param stage 赛事阶段
 * @param isDerby 是否德比
 * @param isNeutral 是否中立场
 * @returns 推荐的场景类型
 */
export function detectScene(
  stage: string,
  isDerby = false,
  isNeutral = false,
): MatchScene {
  if (isDerby) return 'derby'
  if (isNeutral) return 'neutral'
  if (stage.includes('决赛') || stage.includes('final')) return 'final'
  if (stage.includes('淘汰') || stage.includes('knockout')) return 'knockout'
  return 'group'
}
