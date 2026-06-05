import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import i18n from '@/locales'

/**
 * 统一响应格式
 * 后端 TransformInterceptor 返回 { code, message, data }
 */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 快捷获取国际化翻译函数
const t = (key: string) => i18n.global.t(key)

// 创建 Axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 注入 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cupai_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器 - 适配统一响应格式 { code, message, data }
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse

    // code === 0 表示成功，直接返回 data
    if (res.code === 0) {
      return res.data as any
    }

    // code !== 0 表示业务错误
    const errorMsg = res.message || t('common.requestFailed')
    ElMessage.error(errorMsg)
    return Promise.reject(new Error(errorMsg))
  },
  (error) => {
    const { response } = error
    if (response) {
      const data = response.data as ApiResponse
      const errorMsg = data?.message || t('common.requestFailed')

      switch (response.status) {
        case 401:
          localStorage.removeItem('cupai_token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error(t('common.noPermission'))
          break
        case 500:
          ElMessage.error(t('common.serverError'))
          break
        default:
          ElMessage.error(errorMsg)
      }
    } else {
      ElMessage.error(t('common.networkError'))
    }
    return Promise.reject(error)
  },
)

// 通用请求方法封装（自动解包 data 字段）
export const http = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request.get<unknown, T>(url, config),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.post<unknown, T>(url, data, config),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.put<unknown, T>(url, data, config),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request.delete<unknown, T>(url, config),
}

export default request
