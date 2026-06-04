import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

// 创建 Axios 实例，统一管理请求配置
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401:
          // 未授权，跳转登录
          localStorage.removeItem('cupai_token')
          window.location.href = '/'
          break
        case 403:
          console.error('无权限访问')
          break
        case 500:
          console.error('服务器错误')
          break
      }
    }
    return Promise.reject(error)
  },
)

// 通用请求方法封装
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
