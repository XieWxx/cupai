import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'flag-icons/css/flag-icons.min.css'

import App from './App.vue'
import router from './router'
import i18n from './locales'
import './styles/index.css'

// 调试：捕获未捕获的错误（过滤 Vite 懒加载导航竞态产生的良性 abort）
const isBenignAbort = (msg?: string): boolean =>
  !!msg && (/Failed to fetch dynamically imported module/.test(msg) || /Loading chunk \S+ failed/.test(msg))

window.addEventListener('error', (e) => {
  const msg = e.error?.message || e.message
  if (isBenignAbort(msg)) return
  // eslint-disable-next-line no-console
  console.error('[boot-error]', msg, e.error?.stack)
})
window.addEventListener('unhandledrejection', (e) => {
  const msg = e.reason?.message || String(e.reason)
  if (isBenignAbort(msg)) return
  // eslint-disable-next-line no-console
  console.error('[boot-reject]', msg, e.reason?.stack)
})

// 创建 Vue 应用实例
const app = createApp(App)

// 过滤 Vite 开发环境 + 懒加载导航竞态产生的"动态导入失败"误报
// 该错误已被 router.onError 中的重试逻辑处理，重复打日志会污染控制台
const isBenignDynamicImportError = (err: unknown): boolean => {
  if (!(err instanceof TypeError)) return false
  return /Failed to fetch dynamically imported module/.test(err.message)
}

app.config.errorHandler = (err, _instance, info) => {
  if (isBenignDynamicImportError(err)) return
  // eslint-disable-next-line no-console
  console.error('[vue-error]', info, (err as Error)?.message, (err as Error)?.stack)
}

// 注册全局插件
app.use(createPinia()) // 状态管理
app.use(router) // 路由
app.use(i18n) // 国际化
app.use(ElementPlus) // UI 组件库

app.mount('#app')
