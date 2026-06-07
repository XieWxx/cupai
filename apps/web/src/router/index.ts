import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import i18n from '@/locales'

// 路由配置 - 使用 MainLayout 布局
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'page.home' },
      },
      {
        path: 'match',
        name: 'MatchCenter',
        // 改造后的"赛事数据中心"：对阵图 + 12 小组积分榜
        component: () => import('@/views/MatchDataCenterView.vue'),
        meta: { title: 'page.matchCenter' },
      },
      {
        path: 'match/:id',
        name: 'MatchDetail',
        component: () => import('@/views/MatchDetailView.vue'),
        meta: { title: 'page.matchDetail' },
      },
      {
        path: 'ranking',
        name: 'Ranking',
        component: () => import('@/views/RankingView.vue'),
        meta: { title: 'page.ranking' },
      },
      {
        path: 'sponsor',
        name: 'Sponsor',
        component: () => import('@/views/SponsorView.vue'),
        meta: { title: 'page.sponsor' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: 'page.profile', requiresAuth: true },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'page.login' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 是否正在重试加载路由（防止 onError 重试时无限循环）
let isReloading = false

// 全局路由错误处理：吞掉 HMR / 快速导航导致的动态 import abort
// 这是 Vite 开发环境 + vue-router 懒加载的已知竞态副作用，不影响生产构建
router.onError((err, to) => {
  const isDynamicImportError =
    err instanceof TypeError &&
    /Failed to fetch dynamically imported module/.test(err.message)

  if (!isDynamicImportError) {
    console.error('[router] navigation error:', err)
    return
  }

  // 避免无限重试：仅在未重试过且目标路径与当前不同时执行一次
  if (isReloading) return
  if (typeof to !== 'object' || !to.path) return

  const target = router.resolve(to).fullPath
  if (router.currentRoute.value.fullPath === target) return

  isReloading = true
  // 用 location 强制刷新一次模块缓存，再走正常导航
  const retryUrl = router.resolve(to).href
  // 通过 replace + 重新进入，让 vue-router 重新触发 import()
  router
    .replace(target)
    .catch(() => {
      // 二次失败则降级为整页跳转，确保不会卡死
      window.location.replace(retryUrl)
    })
    .finally(() => {
      // 给浏览器一个微任务窗口再放行，避免同帧内再次触发
      setTimeout(() => {
        isReloading = false
      }, 0)
    })
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 同一路径重复导航：取消本次导航，避免触发重复的 import() 导致前一次被 abort
  // 仅当 path/query/hash 全部一致时短路，params 变化或重定向仍按正常流程
  // 注意：首次加载时 from 是 '初始空路由'，不要误判
  const isInitialNavigation = from.name === undefined && from.matched.length === 0
  const sameQuery =
    JSON.stringify(to.query || {}) === JSON.stringify(from.query || {}) &&
    to.hash === from.hash
  if (
    !isInitialNavigation &&
    to.path === from.path &&
    to.fullPath === from.fullPath &&
    sameQuery
  ) {
    next(false)
    return
  }

  // 设置页面标题（支持 i18n key）
  const titleKey = to.meta.title as string
  const title = titleKey ? i18n.global.t(titleKey) : ''
  document.title = title ? `${title} - CupAI` : 'CupAI'

  // 需要登录的页面检查
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('cupai_token')
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
