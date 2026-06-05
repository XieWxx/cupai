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
        component: () => import('@/views/MatchCenterView.vue'),
        meta: { title: 'page.matchCenter' },
      },
      {
        path: 'match/:id',
        name: 'MatchDetail',
        component: () => import('@/views/MatchDetailView.vue'),
        meta: { title: 'page.matchDetail' },
      },
      {
        path: 'analysis',
        name: 'AnalysisCenter',
        component: () => import('@/views/AnalysisCenterView.vue'),
        meta: { title: 'page.analysisCenter' },
      },
      {
        path: 'prompt-market',
        name: 'PromptMarket',
        component: () => import('@/views/PromptMarketView.vue'),
        meta: { title: 'page.promptMarket' },
      },
      {
        path: 'square',
        name: 'AnalysisSquare',
        component: () => import('@/views/AnalysisSquareView.vue'),
        meta: { title: 'page.analysisSquare' },
      },
      {
        path: 'ranking',
        name: 'Ranking',
        component: () => import('@/views/RankingView.vue'),
        meta: { title: 'page.ranking' },
      },
      {
        path: 'standings',
        name: 'Standings',
        component: () => import('@/views/StandingsView.vue'),
        meta: { title: 'page.standings' },
      },
      {
        path: 'sentiment',
        name: 'Sentiment',
        component: () => import('@/views/SentimentView.vue'),
        meta: { title: 'page.sentiment' },
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

// 全局路由守卫
router.beforeEach((to, _from, next) => {
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
