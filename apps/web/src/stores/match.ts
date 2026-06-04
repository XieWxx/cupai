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
   */
  async function fetchMatches(params?: { status?: string; stage?: string; page?: number; pageSize?: number }) {
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

  return {
    matches,
    currentMatch,
    teams,
    currentTeam,
    loading,
    fetchMatches,
    fetchMatchDetail,
    fetchTeams,
    fetchTeamDetail,
  }
})
