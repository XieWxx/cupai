import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/match',
    name: 'MatchCenter',
    component: () => import('@/views/MatchCenterView.vue'),
    meta: { title: '赛事数据中心' },
  },
  {
    path: '/analysis',
    name: 'AnalysisCenter',
    component: () => import('@/views/AnalysisCenterView.vue'),
    meta: { title: 'AI 自定义分析中心' },
  },
  {
    path: '/prompt-market',
    name: 'PromptMarket',
    component: () => import('@/views/PromptMarketView.vue'),
    meta: { title: 'Prompt 模板市场' },
  },
  {
    path: '/square',
    name: 'AnalysisSquare',
    component: () => import('@/views/AnalysisSquareView.vue'),
    meta: { title: '分析广场' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: '个人中心' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局路由守卫 - 设置页面标题
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  document.title = title ? `${title} - CupAI` : 'CupAI'
  next()
})

export default router
