import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/api/request'

/**
 * AI 分析状态管理
 */
export const useAnalysisStore = defineStore('analysis', () => {
  // AI 配置列表
  const aiConfigs = ref<any[]>([])
  // 权重模型列表
  const weightModels = ref<any[]>([])
  // 分析报告列表
  const reports = ref<any[]>([])
  // 公开报告（广场）
  const publicReports = ref<any[]>([])
  const loading = ref(false)

  // ---- AI 配置 ----

  async function fetchAiConfigs() {
    const res = await http.get<any[]>('/ai/config')
    aiConfigs.value = res
    return res
  }

  async function createAiConfig(data: any) {
    const res = await http.post('/ai/config', data)
    await fetchAiConfigs()
    return res
  }

  async function deleteAiConfig(id: string) {
    await http.delete(`/ai/config/${id}`)
    await fetchAiConfigs()
  }

  async function testConnection(data: { apiEndpoint: string; apiKey: string }) {
    return http.post('/ai/test-connection', data)
  }

  // ---- 权重模型 ----

  async function fetchWeightModels() {
    const res = await http.get<any[]>('/ranking/model')
    weightModels.value = res
    return res
  }

  async function createWeightModel(data: any) {
    const res = await http.post('/ranking/model', data)
    await fetchWeightModels()
    return res
  }

  async function updateWeightModel(id: string, data: any) {
    const res = await http.put(`/ranking/model/${id}`, data)
    await fetchWeightModels()
    return res
  }

  async function deleteWeightModel(id: string) {
    await http.delete(`/ranking/model/${id}`)
    await fetchWeightModels()
  }

  async function setDefaultModel(id: string) {
    await http.put(`/ranking/model/${id}/default`)
    await fetchWeightModels()
  }

  // ---- 分析报告 ----

  /**
   * 生成分析报告（完整闭环）
   * 前端解密 API Key 后传入，后端组装 Prompt → 调 AI → 保存报告
   */
  async function generateAnalysis(data: {
    matchId: string
    aiConfigId: string
    weightModelId?: string
    promptTemplateId?: string
    apiKey: string
    isPublic?: boolean
    displayLanguage?: string
  }) {
    return http.post<any>('/analysis/generate', data)
  }

  async function createManualReport(data: any) {
    return http.post('/analysis/manual', data)
  }

  async function createAgentReport(data: any) {
    return http.post('/analysis/agent', data)
  }

  async function fetchMyReports() {
    const res = await http.get<any[]>('/analysis/my')
    reports.value = res
    return res
  }

  async function fetchPublicReports(params?: any) {
    loading.value = true
    try {
      const res = await http.get<{ list: any[]; total: number }>('/analysis/square', { params })
      publicReports.value = res.list
      return res
    } finally {
      loading.value = false
    }
  }

  async function toggleReportVisibility(id: string, isPublic: boolean) {
    return http.put(`/analysis/${id}/visibility`, { isPublic })
  }

  async function deleteReport(id: string) {
    await http.delete(`/analysis/${id}`)
    await fetchMyReports()
  }

  return {
    aiConfigs,
    weightModels,
    reports,
    publicReports,
    loading,
    fetchAiConfigs,
    createAiConfig,
    deleteAiConfig,
    testConnection,
    fetchWeightModels,
    createWeightModel,
    updateWeightModel,
    deleteWeightModel,
    setDefaultModel,
    createManualReport,
    createAgentReport,
    generateAnalysis,
    fetchMyReports,
    fetchPublicReports,
    toggleReportVisibility,
    deleteReport,
  }
})
