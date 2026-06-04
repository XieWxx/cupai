import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/api/request'

/**
 * Prompt 模板状态管理
 */
export const usePromptStore = defineStore('prompt', () => {
  // 个人模板
  const myTemplates = ref<any[]>([])
  // 市场公开模板
  const marketTemplates = ref<any[]>([])
  const loading = ref(false)

  /**
   * 获取个人模板
   */
  async function fetchMyTemplates() {
    const res = await http.get<any[]>('/prompt/my')
    myTemplates.value = res
    return res
  }

  /**
   * 创建模板
   */
  async function createTemplate(data: any) {
    const res = await http.post('/prompt', data)
    await fetchMyTemplates()
    return res
  }

  /**
   * 更新模板
   */
  async function updateTemplate(id: string, data: any) {
    const res = await http.put(`/prompt/${id}`, data)
    await fetchMyTemplates()
    return res
  }

  /**
   * 删除模板
   */
  async function deleteTemplate(id: string) {
    await http.delete(`/prompt/${id}`)
    await fetchMyTemplates()
  }

  /**
   * 设置公开/私密
   */
  async function toggleVisibility(id: string, isPublic: boolean) {
    await http.put(`/prompt/${id}/visibility`, { isPublic })
    await fetchMyTemplates()
  }

  /**
   * 获取公开市场模板
   */
  async function fetchMarketTemplates(params?: { scene?: string; sortBy?: string; page?: number; pageSize?: number }) {
    loading.value = true
    try {
      const res = await http.get<{ list: any[]; total: number }>('/prompt/market', { params })
      marketTemplates.value = res.list
      return res
    } finally {
      loading.value = false
    }
  }

  /**
   * 收藏模板
   */
  async function collectTemplate(id: string) {
    await http.post(`/prompt/${id}/collect`)
  }

  return {
    myTemplates,
    marketTemplates,
    loading,
    fetchMyTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleVisibility,
    fetchMarketTemplates,
    collectTemplate,
  }
})
