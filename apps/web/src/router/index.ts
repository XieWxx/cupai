import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'

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
        meta: { title: '首页' },
      },
      {
        path: 'match',
        name: 'MatchCenter',
        component: () => import('@/views/MatchCenterView.vue'),
        meta: { title: '赛事数据中心' },
      },
      {
        path: 'match/:id',
        name: 'MatchDetail',
        component: () => import('@/views/MatchDetailView.vue'),
        meta: { title: '赛事详情' },
      },
      {
        path: 'analysis',
        name: 'AnalysisCenter',
        component: () => import('@/views/AnalysisCenterView.vue'),
        meta: { title: 'AI 自定义分析中心' },
      },
      {
        path: 'prompt-market',
        name: 'PromptMarket',
        component: () => import('@/views/PromptMarketView.vue'),
        meta: { title: 'Prompt 模板市场' },
      },
      {
        path: 'square',
        name: 'AnalysisSquare',
        component: () => import('@/views/AnalysisSquareView.vue'),
        meta: { title: '分析广场' },
      },
      {
        path: 'ranking',
        name: 'Ranking',
        component: () => import('@/views/RankingView.vue'),
        meta: { title: '排行榜' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  const title = to.meta.title as string
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
