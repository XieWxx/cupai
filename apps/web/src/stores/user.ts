import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http } from '@/api/request'

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // 用户信息
  const user = ref<{
    id: string
    username: string
    nickname: string
    avatar: string
    language: string
    timezone: string
    apiKey?: string
  } | null>(null)

  // Token
  const token = ref<string>(localStorage.getItem('cupai_token') || '')

  // 是否已登录
  const isLoggedIn = computed(() => !!token.value)

  /**
   * 用户注册
   */
  async function register(data: { username: string; password: string; nickname: string; region: string }) {
    const res = await http.post<{ user: typeof user.value; token: string }>('/user/register', data)
    token.value = res.token
    user.value = res.user
    localStorage.setItem('cupai_token', res.token)
    // 存储 apiKey 到 localStorage（供复制指令使用）
    if (res.user?.apiKey) {
      localStorage.setItem('cupai_api_key', res.user.apiKey)
    }
    return res
  }

  /**
   * 用户登录
   */
  async function login(data: { username: string; password: string }) {
    const res = await http.post<{ user: typeof user.value; token: string }>('/user/login', data)
    token.value = res.token
    user.value = res.user
    localStorage.setItem('cupai_token', res.token)
    // 存储 apiKey 到 localStorage（供复制指令使用）
    if (res.user?.apiKey) {
      localStorage.setItem('cupai_api_key', res.user.apiKey)
    }
    return res
  }

  /**
   * 获取用户信息
   */
  async function fetchProfile() {
    const res = await http.get<typeof user.value>('/user/profile')
    user.value = res
    // 同步 apiKey 到 localStorage
    if (res?.apiKey) {
      localStorage.setItem('cupai_api_key', res.apiKey)
    }
    return res
  }

  /**
   * 更新用户信息
   */
  async function updateProfile(data: { nickname?: string; avatar?: string; language?: string; timezone?: string }) {
    const res = await http.put<typeof user.value>('/user/profile', data)
    user.value = res
    return res
  }

  /**
   * 退出登录
   */
  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('cupai_token')
  }

  return {
    user,
    token,
    isLoggedIn,
    register,
    login,
    fetchProfile,
    updateProfile,
    logout,
  }
})
