<!--
  首页（按 PRD 4 大模块重组）
  1. 赛事动态区：进行中 / 今日待开赛（合并为一个 tab）
  2. 排行榜摘要：TOP10 高准确率用户 / 热门大模型 / 热门 Agent 平台（3 列）
  3. 平台使用指南：3 步流程
-->
<template>
  <div class="home-view">
    <!-- ========== Hero 区域：保留平台品牌与 2026 主题 ========== -->
    <section class="hero-section">
      <div class="hero-flags-bg" aria-hidden="true">
        <div class="flag-scroll-row row-1" :class="{ 'is-paused': isPaused1 }" @mouseenter="isPaused1 = true" @mouseleave="isPaused1 = false">
          <span v-for="flag in heroFlags" :key="`r1-${flag}`" :class="`fi fi-${flag} hero-flag`" />
          <span v-for="flag in heroFlags" :key="`r1-dup-${flag}`" :class="`fi fi-${flag} hero-flag`" />
        </div>
        <div class="flag-scroll-row row-2" :class="{ 'is-paused': isPaused2 }" @mouseenter="isPaused2 = true" @mouseleave="isPaused2 = false">
          <span v-for="flag in [...heroFlags].reverse()" :key="`r2-${flag}`" :class="`fi fi-${flag} hero-flag`" />
          <span v-for="flag in [...heroFlags].reverse()" :key="`r2-dup-${flag}`" :class="`fi fi-${flag} hero-flag`" />
        </div>
        <div class="flag-scroll-row row-3" :class="{ 'is-paused': isPaused3 }" @mouseenter="isPaused3 = true" @mouseleave="isPaused3 = false">
          <span v-for="flag in heroFlags" :key="`r3-${flag}`" :class="`fi fi-${flag} hero-flag`" />
          <span v-for="flag in [...heroFlags].reverse()" :key="`r3-dup-${flag}`" :class="`fi fi-${flag} hero-flag`" />
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">{{ $t('home.heroBadge') }}</div>
        <h1 class="hero-title">
          <span class="hero-title-main">{{ $t('home.heroTitle') }}</span>
          <span class="hero-title-sub">{{ $t('home.heroSubtitle') }}</span>
        </h1>
        <p class="hero-desc">
          {{ $t('home.heroDesc') }}
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" class="hero-cta-primary" @click="$router.push('/match')">
            ⚽ {{ $t('home.ctaMatches') }}
          </el-button>
          <el-button size="large" class="hero-cta-secondary" @click="$router.push('/ranking')">
            🏆 {{ $t('home.ctaRanking') }}
          </el-button>
        </div>
      </div>
    </section>

    <!-- ========== 2026 世界杯装饰分隔条 ========== -->
    <div class="wc-divider">
      <span class="wc-divider-flag fi fi-us"></span>
      <span class="wc-divider-flag fi fi-ca"></span>
      <span class="wc-divider-flag fi fi-mx"></span>
      <span class="wc-divider-text">{{ $t('home.wcBadge') }}</span>
    </div>

    <!-- 模块 1：赛事动态区（进行中 + 待开赛合并展示） -->
    <section class="section match-dynamics">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Calendar /></el-icon>
          {{ $t('home.matchDynamics') }}
        </h2>
        <el-button text @click="$router.push('/match')"><el-icon><DataLine /></el-icon> {{ $t('common.more') }}</el-button>
      </div>
      <el-tabs v-model="dynamicsTab" class="dynamics-tabs">
        <!-- 待开赛 tab -->
        <el-tab-pane name="upcoming">
          <template #label>
            <span class="tab-with-badge">
              {{ $t('home.todayUpcoming') }}
            </span>
          </template>
          <div v-loading="dynamicsLoading" class="match-card-grid">
            <el-empty v-if="!dynamicsLoading && dynamicsMatches.upcoming.length === 0" :description="$t('home.noUpcoming')" :image-size="80" />
            <el-card
              v-for="match in dynamicsMatches.upcoming"
              :key="match.id"
              shadow="hover"
              class="match-card"
              @click="$router.push(`/match/${match.id}`)"
            >
              <div class="match-header">
                <el-tag size="small" type="warning" effect="plain">
                  {{ $t('home.todayUpcoming') }}
                </el-tag>
                <span class="match-stage">{{ match.stage }}</span>
              </div>
              <div class="match-teams">
                <div class="team-info">
                  <span v-if="getFlagClass(match.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam?.countryCode)} team-flag`" />
                  <span class="team-name">{{ match.homeTeam?.name }}</span>
                </div>
                <div class="match-vs">
                  <span class="score">{{ match.homeScore ?? '-' }} : {{ match.awayScore ?? '-' }}</span>
                </div>
                <div class="team-info">
                  <span v-if="getFlagClass(match.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam?.countryCode)} team-flag`" />
                  <span class="team-name">{{ match.awayTeam?.name }}</span>
                </div>
              </div>
              <div class="match-meta">
                <span class="match-time">{{ match.startTime ? new Date(match.startTime).toLocaleString(i18nLocale) : '-' }}</span>
                <span class="match-venue" v-if="match.venue">{{ match.venue }}</span>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
        <!-- 进行中 tab -->
        <el-tab-pane name="live">
          <template #label>
            <span class="tab-with-badge">
              {{ $t('home.live') }}
            </span>
          </template>
          <div v-loading="dynamicsLoading" class="match-card-grid">
            <el-empty v-if="!dynamicsLoading && dynamicsMatches.live.length === 0" :description="$t('home.noLive')" :image-size="80" />
            <el-card
              v-for="match in dynamicsMatches.live"
              :key="match.id"
              shadow="hover"
              class="match-card match-card--live"
              @click="$router.push(`/match/${match.id}`)"
            >
              <div class="match-header">
                <el-tag size="small" type="danger" effect="dark">
                  <span class="live-dot" />
                  {{ match.currentMinute ? `${match.currentMinute}'` : $t('home.live') }}
                </el-tag>
                <span class="match-stage">{{ match.stage }}</span>
              </div>
              <div class="match-teams">
                <div class="team-info">
                  <span v-if="getFlagClass(match.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam?.countryCode)} team-flag`" />
                  <span class="team-name">{{ match.homeTeam?.name }}</span>
                </div>
                <div class="match-vs">
                  <span class="score">{{ match.homeScore ?? '-' }} : {{ match.awayScore ?? '-' }}</span>
                </div>
                <div class="team-info">
                  <span v-if="getFlagClass(match.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam?.countryCode)} team-flag`" />
                  <span class="team-name">{{ match.awayTeam?.name }}</span>
                </div>
              </div>
              <div class="match-meta">
                <span class="match-time">{{ match.startTime ? new Date(match.startTime).toLocaleString(i18nLocale) : '-' }}</span>
                <span class="match-venue" v-if="match.venue">{{ match.venue }}</span>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- ========== 2026 世界杯口号装饰条 ========== -->
    <div class="wc-slogan-bar">
      <span class="wc-slogan-emoji">⚽</span>
      <span class="wc-slogan-text">{{ $t('home.wcSlogan') }}</span>
      <span class="wc-slogan-emoji">🏆</span>
    </div>

    <!-- 模块 2：排行榜摘要（显示预测数据量，不显示积分） -->
    <section class="section ranking-summary">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Trophy /></el-icon>
          {{ $t('home.rankingSummary') }}
        </h2>
        <el-button text @click="$router.push('/ranking')"><el-icon><Trophy /></el-icon> {{ $t('common.more') }}</el-button>
      </div>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="ranking-panel">
            <div class="panel-header">
              <span class="panel-icon panel-icon--user"><el-icon><User /></el-icon></span>
              <span>{{ $t('home.topUsers') }}</span>
            </div>
            <div class="panel-body">
              <div v-for="(u, i) in userRanking.slice(0, 5)" :key="u.id || u.userId" class="panel-item" @click="$router.push(`/ranking`)">
                <span :class="['panel-rank', i < 3 ? `rank-${i + 1}` : '']">{{ i + 1 }}</span>
                <span :class="`fi fi-${regionToFlagClass(u.user?.region)} panel-flag`" />
                <span class="panel-name">{{ u.user?.nickname || u.nickname || t('common.anonymous') }}</span>
                <span class="panel-value">{{ u.totalPredictions || '-' }}</span>
              </div>
              <p v-if="!userRanking.length" class="panel-empty">—</p>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="ranking-panel">
            <div class="panel-header">
              <span class="panel-icon panel-icon--model"><el-icon><Cpu /></el-icon></span>
              <span>{{ $t('home.topModels') }}</span>
            </div>
            <div class="panel-body">
              <div v-for="(m, i) in modelRanking.slice(0, 5)" :key="m.id || m.modelName" class="panel-item" @click="$router.push(`/ranking`)">
                <span :class="['panel-rank', i < 3 ? `rank-${i + 1}` : '']">{{ i + 1 }}</span>
                <!-- 模型列：split 模式让 icon + name 分别落到第 2、3 列，与"高准确率用户"列布局一致 -->
                <PlatformBadge :platform="resolveModelPlatform(m)" :split="true" />
                <span class="panel-value">{{ m.totalPredictions || '-' }}</span>
              </div>
              <p v-if="!modelRanking.length" class="panel-empty">—</p>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="ranking-panel">
            <div class="panel-header">
              <span class="panel-icon panel-icon--platform"><el-icon><Connection /></el-icon></span>
              <span>{{ $t('home.topPlatforms') }}</span>
            </div>
            <div class="panel-body">
              <div v-for="(p, i) in platformRanking.slice(0, 5)" :key="p.id || p.platform" class="panel-item" @click="$router.push(`/ranking`)">
                <span :class="['panel-rank', i < 3 ? `rank-${i + 1}` : '']">{{ i + 1 }}</span>
                <!-- 平台列：split 模式，与"高准确率用户"列布局一致 -->
                <PlatformBadge :platform="resolvePlatformBadge(p)" :split="true" />
                <span class="panel-value">{{ p.totalPredictions || p.userCount || '-' }}</span>
              </div>
              <p v-if="!platformRanking.length" class="panel-empty">—</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 模块 3：使用指南 -->
    <section class="section guide-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><ChatDotRound /></el-icon>
          {{ $t('home.usageGuide') }}
        </h2>
      </div>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="guide-step">
            <span class="guide-step-num">1</span>
            <div class="guide-step-icon"><el-icon><CopyDocument /></el-icon></div>
            <h3 class="guide-step-title">{{ $t('home.guideStep1') }}</h3>
            <p class="guide-step-desc">{{ $t('home.guideStep1Desc') }}</p>
            <el-button type="primary" text @click="$router.push('/match')">{{ $t('common.go') }}</el-button>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="guide-step">
            <span class="guide-step-num">2</span>
            <div class="guide-step-icon"><el-icon><Cpu /></el-icon></div>
            <h3 class="guide-step-title">{{ $t('home.guideStep2') }}</h3>
            <p class="guide-step-desc">{{ $t('home.guideStep2Desc') }}</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="guide-step">
            <span class="guide-step-num">3</span>
            <div class="guide-step-icon"><el-icon><Connection /></el-icon></div>
            <h3 class="guide-step-title">{{ $t('home.guideStep3') }}</h3>
            <p class="guide-step-desc">{{ $t('home.guideStep3Desc') }}</p>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Calendar, Trophy, User, Cpu, Connection, ChatDotRound, CopyDocument, DataLine } from '@element-plus/icons-vue'
import PlatformBadge from '@/components/ranking/PlatformBadge.vue'
import { detectModel, detectPlatform, regionToFlagClass, type AgentPlatform } from '@/utils/agentPlatform'
import { http } from '@/api/request'

const { t, locale: i18nLocale } = useI18n()

const heroFlags = ['us', 'ca', 'mx', 'ar', 'au', 'be', 'br', 'cn', 'co', 'cr', 'cv', 'cz', 'de', 'ec', 'eg', 'es', 'fi', 'fr', 'gb', 'gh', 'gr', 'hu', 'id', 'ie', 'ir', 'il', 'it', 'jp', 'kr', 'ma', 'nl', 'ng', 'nz', 'pa', 'pe', 'ph', 'pl', 'pt', 'qa', 'ro', 'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'sn', 'tr']

const isPaused1 = ref(false)
const isPaused2 = ref(false)
const isPaused3 = ref(false)

const dynamicsTab = ref('upcoming')
const dynamicsLoading = ref(false)
/**
 * 首页"赛事动态"数据结构
 * - live：进行中（后端 GET /match/dynamics 返回）
 * - upcoming：未来 24h 内待开赛
 * @see docs/api-spec.md §3.6.11
 */
const dynamicsMatches = reactive({
  live: [] as any[],
  upcoming: [] as any[],
})

const userRanking = ref<any[]>([])
const modelRanking = ref<any[]>([])
const platformRanking = ref<any[]>([])
let timer: ReturnType<typeof setInterval> | null = null

function getFlagClass(countryCode?: string): string {
  if (!countryCode) return ''
  return `fi fi-${countryCode.toLowerCase()}`
}

/**
 * 把模型行转换成 PlatformBadge 所需的元数据
 * - 优先使用行内已 denormalize 出的 platform/modelValue
 * - 退化：使用 modelName 调用 detectModel 推断（与 RankingView 行为一致）
 */
function resolveModelPlatform(row: any): AgentPlatform | null {
  if (!row) return null
  const name: string = row.modelName || row.modelValue || row.name || ''
  if (!name) return null
  return detectModel(name)
}

/**
 * 把平台行转换成 PlatformBadge 所需的元数据
 * - 优先使用行内的 platformKey（platformValue）调用 detectPlatform 推断
 * - 退化：使用 platform 名称直接当 modelName 推断
 */
function resolvePlatformBadge(row: any): AgentPlatform | null {
  if (!row) return null
  // 真实后端/部分 mock 直接给出 platformKey（如 chatgpt / claude / deepseek）
  if (row.platformKey) return detectPlatform(row.platformKey)
  if (row.platformValue) return detectPlatform(row.platformValue)
  // 兼容旧数据：用名称当 endpoint 识别
  if (row.platform) return detectPlatform(row.platform)
  return null
}

/**
 * 加载首页"赛事动态"列
 * 后端：GET /match/dynamics?limit=6
 *   - live：进行中（按 startTime 升序）
 *   - upcoming：未来 24h 内（按 startTime 升序）
 * 见 docs/api-spec.md §3.6.11
 */
async function loadDynamics() {
  dynamicsLoading.value = true
  try {
    const res: any = await http.get('/match/dynamics', { params: { limit: 6 } })
    dynamicsMatches.live = res?.live || []
    dynamicsMatches.upcoming = res?.upcoming || []
  } catch (err) {
    // 失败时保留空态，由 UI 显示「暂无数据」
    console.error('[loadDynamics] failed:', err)
  } finally {
    dynamicsLoading.value = false
  }
}

async function loadRankingSummary() {
  try {
    // 三列接口与 RankingView 完全对齐：
    // - 用户排行：sort=total（与"高准确率"语义一致），让后端按 accuracyRate 排序
    // - 模型排行：后端默认按 totalScore 排序
    // - 平台排行：与后端 /ranking/platforms 接口对齐（前端依赖 platformKey 字段）
    const [userRes, modelRes, platformRes] = await Promise.all([
      http.get('/ranking/users', { params: { sort: 'total' } }),
      http.get('/ranking/models'),
      http.get('/ranking/platforms'),
    ])
    userRanking.value = (userRes as any)?.list || []
    modelRanking.value = (modelRes as any)?.list || []
    platformRanking.value = (platformRes as any)?.list || []
  } catch (err) {
    console.error('[loadRankingSummary] failed:', err)
  }
}

async function loadAll() {
  await Promise.all([loadDynamics(), loadRankingSummary()])
}

onMounted(() => {
  loadAll()
  // 每 60 秒刷新赛事动态
  timer = setInterval(loadDynamics, 60_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.home-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* ============ Hero 区域 ========== */
.hero-section {
  position: relative;
  padding: var(--space-10) var(--space-6);
  text-align: center;
  border-radius: 0;
  margin-bottom: var(--space-8);
  /* 允许国旗溢出显示，避免上下行被裁切 */
  overflow: visible;
  background: transparent;
  /* 全屏宽度：突破 home-view 的 max-width 限制 */
  width: 100vw;
  left: 50%;
  right: auto;
  margin-left: -50vw;
  /* 最小高度确保三行国旗完整展示 */
  min-height: 460px;
}

/* ========== 国旗滚动背景 ========== */
.hero-flags-bg {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* 国旗上下间距增大，避免上下行被遮挡 */
  gap: var(--space-4);
  pointer-events: none;
  z-index: 0;
  /* 无遮罩 */
  opacity: 1;
  width: 100%;
  padding: var(--space-8) 0;
  /* 确保三行国旗完整显示，不被裁切 */
  overflow: visible;
}

.flag-scroll-row {
  display: flex;
  gap: var(--space-6);
  animation: flag-scroll 80s linear infinite;
  width: max-content;
  /* 每行高度自适应，避免行间重叠 */
  line-height: 1;
}

.flag-scroll-row.row-2 {
  animation-direction: reverse;
  animation-duration: 100s;
}

.flag-scroll-row.row-3 {
  animation-duration: 90s;
}

.flag-scroll-row.is-paused {
  animation-play-state: paused;
}

.hero-flag {
  font-size: 120px;
  flex-shrink: 0;
  /* 防止行内元素溢出遮挡上下行 */
  display: inline-block;
  line-height: 1;
}

@keyframes flag-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* ========== 前景内容 ========== */
.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-4);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-2xl);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0 0 var(--space-4);
}

.hero-title-main {
  font-size: var(--text-4xl);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-title-sub {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.hero-desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
}

/* ========== 2026 世界杯装饰分隔条 ========== */
.wc-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  padding: var(--space-3) 0;
}

.wc-divider-flag {
  font-size: var(--text-lg);
}

.wc-divider-text {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  letter-spacing: 0.15em;
  background: var(--gradient-wc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ========== 2026 世界杯口号装饰条 ========== */
.wc-slogan-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-8);
}

.wc-slogan-emoji {
  font-size: var(--text-xl);
}

.wc-slogan-text {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  letter-spacing: 0.05em;
}

/* ============ Section 通用 ========== */
.section {
  margin-bottom: var(--space-8);
}

.section:last-child {
  margin-bottom: 0;
}

.dynamics-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--space-4);
}

/* ========== 合并 tab 徽章 ========== */
.tab-with-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* ============ 赛事卡片网格 ========== */
.match-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
}

.match-card {
  cursor: pointer;
  transition: transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.match-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.match-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border-light);
}

.match-stage {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.match-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) 0;
}

.team-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.team-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.match-vs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.score {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-danger);
}

.live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-bg-elevated);
  margin-right: var(--space-1);
  animation: pulse var(--duration-slow) var(--ease-in-out) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.match-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
  font-size: var(--text-xs);
}

.match-time {
  color: var(--color-text-secondary);
}

.match-venue {
  color: var(--color-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: auto;
}

/* ========== 排行榜面板 ========== */
.ranking-panel {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  height: 100%;
  transition: transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.ranking-panel:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.panel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  color: #fff;
}

.panel-icon--user { background: var(--gradient-brand); }
.panel-icon--model { background: linear-gradient(135deg, var(--color-warning), #d97706); }
.panel-icon--platform { background: linear-gradient(135deg, var(--color-success), #059669); }

.panel-body {
  padding: var(--space-1) 0;
}

.panel-item {
  display: grid;
  /* 关键：minmax(0, 1fr) 让名字列的 min-width 为 0，
     PlatformBadge 内的长名称才能正确截断而非撑破容器（"重叠遮罩"修复） */
  grid-template-columns: 28px 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-bg-muted);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.panel-item:hover {
  background: var(--color-primary-bg);
}

.panel-item:last-child {
  border-bottom: none;
}

.panel-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: #fff;
  background: var(--color-text-tertiary);
}

.rank-1 { background: #f59e0b; }
.rank-2 { background: #94a3b8; }
.rank-3 { background: #d97706; }

.panel-flag {
  font-size: var(--text-lg);
}

.panel-name {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-tertiary);
}

.panel-empty {
  padding: var(--space-6) 0;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  margin: 0;
}

/* ============ 使用指南 ========== */
.guide-section {
  margin-bottom: 0;
}

.guide-step {
  position: relative;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-7) var(--space-5) var(--space-6);
  text-align: center;
  height: 100%;
  transition: transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.guide-step:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.guide-step-num {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}

.guide-step-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  margin-bottom: var(--space-3);
}

.guide-step-title {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.guide-step-desc {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-3);
  min-height: 60px;
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--space-8) var(--space-4);
    width: 100vw;
    left: 50%;
    margin-left: -50vw;
  }
  .hero-title-main {
    font-size: var(--text-2xl);
  }
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  .match-card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-6) var(--space-3);
    width: 100vw;
    left: 50%;
    margin-left: -50vw;
  }
  .hero-title-main {
    font-size: var(--text-xl);
  }
  .hero-title-sub {
    font-size: var(--text-base);
  }
  .hero-flag {
    font-size: 36px;
  }
  .flag-scroll-row {
    gap: var(--space-4);
  }
  .match-card-grid {
    grid-template-columns: 1fr;
  }
  .ranking-summary :deep(.el-col),
  .guide-section :deep(.el-col) {
    max-width: 100%;
    flex: 0 0 100%;
    margin-bottom: var(--space-4);
  }
  .guide-step {
    padding: var(--space-5) var(--space-4) var(--space-4);
  }
  .guide-step-icon {
    width: 48px;
    height: 48px;
  }
  .wc-slogan-bar {
    flex-direction: column;
    gap: var(--space-1);
  }
  .wc-slogan-text {
    text-align: center;
  }
}
</style>
