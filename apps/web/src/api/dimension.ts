/**
 * 维度报告 API
 *
 * 用于赛事详情页加载「单维度指令报告」列表
 * （21 维度，每条 agent 分析指令只回传对应维度的 distribution）
 */
import { http } from './request'

/** 维度报告条目（与后端 DimensionSubmissionEntity 对应） */
export interface IDimensionReport {
  id: string
  dimKey: string
  topOption: string | null
  topProbability: number | null
  distribution: Record<string, number> | null
  summary: string | null
  model: string | null
  apiKeyHint?: string | null
  createdAt: string
}

interface ListDimensionsResponse {
  list: IDimensionReport[]
  total: number
}

/**
 * 拉取某赛事已完成的单维度报告
 * @param matchId 赛事 id
 * @param range 时间范围（toISO / 24h / 7d），可选
 * @param pageSize 每页条数，默认 50
 */
export async function listDimensions(
  matchId: string,
  range?: string,
  pageSize: number = 50,
): Promise<ListDimensionsResponse> {
  return http.get<ListDimensionsResponse>('/agent/open/dimensions', {
    params: { matchId, range, pageSize },
  })
}
