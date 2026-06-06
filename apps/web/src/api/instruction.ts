/**
 * Agent 指令列表 API（仅用于在「复制指令」中预填 instructionId）
 *
 * 设计：
 * 1. 前端进入赛事详情页时拉一次 `listInstructions`，按 dimKey 建索引
 * 2. 用户点图表的「复制指令」按钮 → 生成的 curl 模板中自动预填 instructionId
 * 3. agent 完成分析后直接 POST /agent/open/answer 回传
 *
 * 鉴权：本接口为 Public（无需 API Key），但回传接口需要 X-API-Key。
 */
import { http } from '@/api/request'

const BASE = '/agent/open'

/** 单条指令记录 */
export interface IInstruction {
  id: string
  matchId: string
  matchLabel: string
  leagueName: string
  stage: string
  dimKey: string
  sectionKey: string
  questionI18nKey: string
  titleI18nKey: string
  optionsKeys: string[]
  optionsI18nKeys: string[]
  requiresPlayer: boolean
  createdAt: string
  updatedAt: string
  status: 'pending' | 'archived'
}

export interface IInstructionListResp {
  list: IInstruction[]
  total: number
  page: number
  pageSize: number
  lastRefreshAt: string
}

/**
 * 拉取待办指令清单（仅 GET）
 * @param matchId 限定到某场比赛
 * @param dimKey  限定到某个维度
 */
export async function listInstructions(
  params: { matchId?: string; dimKey?: string; status?: 'pending' | 'archived'; page?: number; pageSize?: number } = {},
): Promise<IInstructionListResp> {
  return http.get<IInstructionListResp>(`${BASE}/instructions`, { params })
}
