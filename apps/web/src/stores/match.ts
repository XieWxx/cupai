import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/api/request'

/**
 * 赛事数据状态管理
 */
export const useMatchStore = defineStore('match', () => {
  // 赛事列表
  const matches = ref<any[]>([])
  // 当前赛事
  const currentMatch = ref<any>(null)
  // 球队列表
  const teams = ref<any[]>([])
  // 当前球队
  const currentTeam = ref<any>(null)
  // 加载状态
  const loading = ref(false)

  /**
   * 获取赛事列表
   * @param params 查询参数：status=状态, stage=阶段, leagueId=联赛ID, page=页码, pageSize=每页条数
   */
  async function fetchMatches(params?: { status?: string; stage?: string; leagueId?: number; page?: number; pageSize?: number }) {
    loading.value = true
    try {
      const res = await http.get<{ list: any[]; total: number }>('/match', { params })
      matches.value = res.list
      return res
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取淘汰赛对阵图数据
   */
  async function fetchBracket() {
    loading.value = true
    try {
      const res = await http.get('/match/bracket')
      return res
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取赛事详情
   */
  async function fetchMatchDetail(matchId: string) {
    loading.value = true
    try {
      const res = await http.get(`/match/${matchId}`)
      currentMatch.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取球队列表
   */
  async function fetchTeams() {
    loading.value = true
    try {
      const res = await http.get<any[]>('/match/teams/all')
      teams.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取球队详情（含球员）
   * 复用后端 GET /match/teams/:id（已包含 players 数组）
   */
  async function fetchTeamDetail(teamId: string) {
    loading.value = true
    try {
      const res = await http.get(`/match/teams/${teamId}`)
      currentTeam.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取球队下的球员列表（首发阵容）
   * 修复：原 MatchDetailView.loadPlayers 调用了不存在的 fetchTeamPlayers，
   *      导致同步抛错使 playersLoading 永远不被关闭而一直转圈。
   *      现复用 fetchTeamDetail 取出 players 字段。
   */
  async function fetchTeamPlayers(teamId: string): Promise<any[]> {
    try {
      const team = await fetchTeamDetail(teamId)
      return (team && (team as any).players) || []
    } catch {
      // 任意失败都返回空数组，让 UI 进入"暂无球员"空态而非一直 loading
      return []
    }
  }

  return {
    matches,
    currentMatch,
    teams,
    currentTeam,
    loading,
    fetchMatches,
    fetchBracket,
    fetchMatchDetail,
    fetchTeams,
    fetchTeamDetail,
    fetchTeamPlayers,
  }
})
