<!--
  首页（按 PRD 4 大模块重组）
  1. 赛事动态区：进行中 / 今日待开赛 / 近期完赛（3 tab 切换）
  2. AI 热门分析简报：用户 Agent 分析热度最高的赛事 / 核心预测结论 / 综合准确率
  3. 排行榜摘要：TOP10 高准确率用户 / 热门大模型 / 热门 Agent 平台（3 列）
  4. 平台使用指南：3 步流程（指令复制 → Agent 分析 → 独立接口回调）
-->
<template>
  <div class="home-view">
    <!-- ========== Hero 区域：保留平台品牌与 2026 主题 ========== -->
    <section class="hero-section">
      <div class="hero-flags-bg" aria-hidden="true">
        <span class="fi fi-us hero-flag hero-flag-us" />
        <span class="fi fi-ca hero-flag hero-flag-ca" />
        <span class="fi fi-mx hero-flag hero-flag-mx" />
      </div>
      <div class="hero-content">
        <div class="hero-badge">WE ARE 26 · 48 TEAMS · 104 MATCHES</div>
        <h1 class="hero-title">
          <span class="hero-title-main">{{ $t('home.heroTitle') }}</span>
          <span class="hero-title-sub">{{ $t('home.heroSubtitle') }}</span>
        </h1>
        <p class="hero-desc">
          <span class="fi fi-us hero-flag-inline" />
          <span class="fi fi-ca hero-flag-inline" />
          <span class="fi fi-mx hero-flag-inline" />
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

    <!-- ============================================================
         模块 1：赛事动态区（PRD 3.1.2 · 赛事动态区）
         正在进行 / 今日待开赛 / 近期完赛（3 个 tab）
         ============================================================ -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Calendar /></el-icon>
          {{ $t('home.matchDynamics') }}
        </h2>
        <el-button text @click="$router.push('/match')">{{ $t('common.more') }} →</el-button>
      </div>
      <el-tabs v-model="dynamicsTab" class="dynamics-tabs">
        <el-tab-pane :label="$t('home.live')" name="live">
          <div v-loading="dynamicsLoading" class="match-card-grid">
            <el-empty v-if="!dynamicsLoading && dynamicsMatches.live.length === 0" :description="$t('home.noLive')" :image-size="80" />
            <el-card
              v-for="match in dynamicsMatches.live"
              :key="match.id"
              shadow="hover"
              class="match-card match-card--live"
              @click="$router.push(`/match/${match.id}`)"
            >
              <div class="match-teams">
                <div class="team-info">
                  <span v-if="getFlagClass(match.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam?.countryCode)} team-flag`" />
                  <span class="team-name">{{ match.homeTeam?.name }}</span>
                </div>
                <div class="match-vs">
                  <span class="score">{{ match.homeScore ?? '-' }} : {{ match.awayScore ?? '-' }}</span>
                  <span class="status-dot" />
                </div>
                <div class="team-info">
                  <span v-if="getFlagClass(match.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam?.countryCode)} team-flag`" />
                  <span class="team-name">{{ match.awayTeam?.name }}</span>
                </div>
              </div>
              <div class="match-meta">
                <el-tag size="small" type="danger" effect="dark">
                  <span class="live-dot" />
                  {{ $t('home.live') }} · {{ match.matchMinute || "0'" }}
                </el-tag>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('home.todayUpcoming')" name="upcoming">
          <div v-loading="dynamicsLoading" class="match-card-grid">
            <el-empty v-if="!dynamicsLoading && dynamicsMatches.upcoming.length === 0" :description="$t('home.noUpcoming')" :image-size="80" />
            <el-card
              v-for="match in dynamicsMatches.upcoming"
              :key="match.id"
              shadow="hover"
              class="match-card"
              @click="$router.push(`/match/${match.id}`)"
            >
              <div class="match-teams">
                <div class="team-info">
                  <span v-if="getFlagClass(match.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam?.countryCode)} team-flag`" />
                  <span class="team-name">{{ match.homeTeam?.name }}</span>
                </div>
                <div class="match-vs">
                  <span class="vs-text">VS</span>
                </div>
                <div class="team-info">
                  <span v-if="getFlagClass(match.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam?.countryCode)} team-flag`" />
                  <span class="team-name">{{ match.awayTeam?.name }}</span>
                </div>
              </div>
              <div class="match-meta">
                <el-tag size="small" type="success" effect="plain">
                  <el-icon :size="12"><Clock /></el-icon>
                  <span style="margin-left: 4px">{{ formatTime(match.startTime) }}</span>
                </el-tag>
                <el-tag size="small" effect="plain" type="info">
                  {{ match.leagueName }}
                </el-tag>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('home.recentFinished')" name="finished">
          <div v-loading="dynamicsLoading" class="match-card-grid">
            <el-empty v-if="!dynamicsLoading && dynamicsMatches.finished.length === 0" :description="$t('home.noFinished')" :image-size="80" />
            <el-card
              v-for="match in dynamicsMatches.finished"
              :key="match.id"
              shadow="hover"
              class="match-card match-card--finished"
              @click="$router.push(`/match/${match.id}`)"
            >
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
                <el-tag size="small" type="info" effect="plain">
                  <el-icon :size="12"><Check /></el-icon>
                  <span style="margin-left: 4px">{{ $t('home.finished') }}</span>
                </el-tag>
                <span class="match-time">{{ formatTime(match.startTime) }}</span>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- ============================================================
         模块 2：AI 热门分析简报（PRD 3.1.2 · AI 热门分析简报）
         展示用户 Agent 分析热度最高的赛事 / 核心预测结论 / 综合准确率
         ============================================================ -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><MagicStick /></el-icon>
          {{ $t('home.aiBrief') }}
        </h2>
        <el-button text @click="$router.push('/match')">{{ $t('common.more') }} →</el-button>
      </div>
      <el-row :gutter="16" v-loading="briefLoading">
        <el-col v-for="brief in hotBriefs" :key="brief.matchId" :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="brief-card" @click="$router.push(`/match/${brief.matchId}`)">
            <div class="brief-header">
              <div class="brief-teams">
                <span v-if="getFlagClass(brief.homeCountryCode)" :class="`${getFlagClass(brief.homeCountryCode)} team-flag`" />
                <span class="brief-team-name">{{ brief.homeTeamName }}</span>
                <span class="brief-vs">VS</span>
                <span v-if="getFlagClass(brief.awayCountryCode)" :class="`${getFlagClass(brief.awayCountryCode)} team-flag`" />
                <span class="brief-team-name">{{ brief.awayTeamName }}</span>
              </div>
              <el-tag size="small" type="warning" effect="dark">
                <el-icon :size="12"><Cpu /></el-icon>
                <span style="margin-left: 4px">{{ brief.analysisCount || 0 }}</span>
              </el-tag>
            </div>
            <div class="brief-body">
              <div class="brief-conclusion">
                <el-icon class="brief-icon"><Aim /></el-icon>
                <span class="brief-conclusion-text">{{ brief.topConclusion }}</span>
              </div>
              <div class="brief-accuracy">
                <span class="brief-accuracy-label">{{ $t('home.avgAccuracy') }}</span>
                <el-progress
                  :percentage="Number(brief.accuracyRate || 0)"
                  :stroke-width="6"
                  :color="accuracyColor"
                />
                <span class="brief-accuracy-num">{{ Number(brief.accuracyRate || 0).toFixed(1) }}%</span>
              </div>
            </div>
            <div class="brief-footer">
              <el-tag size="small" effect="plain" type="info">{{ brief.leagueName }}</el-tag>
              <span class="brief-platform">
                <el-icon :size="12"><Platform /></el-icon>
                <span style="margin-left: 4px">{{ brief.topModel || '-' }}</span>
              </span>
            </div>
          </el-card>
        </el-col>
        <el-col v-if="!briefLoading && hotBriefs.length === 0" :span="24">
          <el-empty :description="$t('home.noBrief')" :image-size="100" />
        </el-col>
      </el-row>
    </section>

    <!-- ============================================================
         模块 3：排行榜摘要（PRD 3.1.2 · 排行榜摘要）
         TOP10 高准确率用户 / 热门大模型 / 热门 Agent 平台（3 列）
         ============================================================ -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Trophy /></el-icon>
          {{ $t('home.rankingSummary') }}
        </h2>
        <el-button text @click="$router.push('/ranking')">{{ $t('common.more') }} →</el-button>
      </div>
      <el-row :gutter="16" v-loading="rankingSummaryLoading">
        <!-- TOP10 高准确率用户 -->
        <el-col :xs="24" :md="12" :lg="8">
          <el-card shadow="hover" class="summary-card">
            <template #header>
              <div class="summary-card-header">
                <span class="summary-icon summary-icon--user">
                  <el-icon :size="16"><UserFilled /></el-icon>
                </span>
                <span>{{ $t('home.topUsers') }}</span>
              </div>
            </template>
            <ul class="summary-list">
              <li
                v-for="(row, idx) in topUsers"
                :key="row.id"
                class="summary-list-item"
                @click="$router.push('/ranking')"
              >
                <span :class="['summary-rank', idx < 3 ? `summary-rank--top${idx + 1}` : '']">
                  {{ idx + 1 }}
                </span>
                <span :class="`fi fi-${regionToFlag(row.user?.region)} summary-flag`" />
                <span class="summary-name">{{ row.user?.nickname || 'Anonymous' }}</span>
                <span class="summary-accuracy">{{ Number(row.accuracyRate || 0).toFixed(1) }}%</span>
              </li>
              <li v-if="topUsers.length === 0" class="summary-empty">{{ $t('home.noData') }}</li>
            </ul>
          </el-card>
        </el-col>

        <!-- 热门大模型 -->
        <el-col :xs="24" :md="12" :lg="8">
          <el-card shadow="hover" class="summary-card">
            <template #header>
              <div class="summary-card-header">
                <span class="summary-icon summary-icon--model">
                  <el-icon :size="16"><Cpu /></el-icon>
                </span>
                <span>{{ $t('home.topModels') }}</span>
              </div>
            </template>
            <ul class="summary-list">
              <li
                v-for="(row, idx) in topModels"
                :key="row.modelName + idx"
                class="summary-list-item"
                @click="$router.push('/ranking')"
              >
                <span :class="['summary-rank', idx < 3 ? `summary-rank--top${idx + 1}` : '']">
                  {{ idx + 1 }}
                </span>
                <span class="summary-name">{{ row.modelName }}</span>
                <span class="summary-accuracy">{{ row.totalPredictions || 0 }} {{ $t('home.predCount') }}</span>
              </li>
              <li v-if="topModels.length === 0" class="summary-empty">{{ $t('home.noData') }}</li>
            </ul>
          </el-card>
        </el-col>

        <!-- 热门 Agent 平台 -->
        <el-col :xs="24" :md="12" :lg="8">
          <el-card shadow="hover" class="summary-card">
            <template #header>
              <div class="summary-card-header">
                <span class="summary-icon summary-icon--platform">
                  <el-icon :size="16"><Connection /></el-icon>
                </span>
                <span>{{ $t('home.topPlatforms') }}</span>
              </div>
            </template>
            <ul class="summary-list">
              <li
                v-for="(row, idx) in topPlatforms"
                :key="row.platform + idx"
                class="summary-list-item"
                @click="$router.push('/ranking')"
              >
                <span :class="['summary-rank', idx < 3 ? `summary-rank--top${idx + 1}` : '']">
                  {{ idx + 1 }}
                </span>
                <span class="summary-name">{{ row.platform }}</span>
                <span class="summary-accuracy">{{ row.userCount || 0 }} {{ $t('home.userCount') }}</span>
              </li>
              <li v-if="topPlatforms.length === 0" class="summary-empty">{{ $t('home.noData') }}</li>
            </ul>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- ============================================================
         模块 4：平台使用指南（PRD 3.1.2 · 平台使用指南）
         简述 Agent 分析流程 / 指令使用方法 / 回调机制说明
         ============================================================ -->
    <section class="section guide-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Reading /></el-icon>
          {{ $t('home.guide') }}
        </h2>
      </div>
      <el-row :gutter="16">
        <el-col :xs="24" :md="8">
          <div class="guide-step">
            <div class="guide-step-num">1</div>
            <div class="guide-step-icon">
              <el-icon :size="28"><DocumentCopy /></el-icon>
            </div>
            <h3 class="guide-step-title">{{ $t('home.guideStep1Title') }}</h3>
            <p class="guide-step-desc">{{ $t('home.guideStep1Desc') }}</p>
            <el-button type="primary" plain size="small" @click="$router.push('/match')">
              {{ $t('home.guideStep1Cta') }}
            </el-button>
          </div>
        </el-col>
        <el-col :xs="24" :md="8">
          <div class="guide-step">
            <div class="guide-step-num">2</div>
            <div class="guide-step-icon">
              <el-icon :size="28"><ChatDotRound /></el-icon>
            </div>
            <h3 class="guide-step-title">{{ $t('home.guideStep2Title') }}</h3>
            <p class="guide-step-desc">{{ $t('home.guideStep2Desc') }}</p>
            <el-tag type="info" effect="plain" size="small">
              <el-icon :size="12"><InfoFilled /></el-icon>
              <span style="margin-left: 4px">{{ $t('home.guideStep2Hint') }}</span>
            </el-tag>
          </div>
        </el-col>
        <el-col :xs="24" :md="8">
          <div class="guide-step">
            <div class="guide-step-num">3</div>
            <div class="guide-step-icon">
              <el-icon :size="28"><Upload /></el-icon>
            </div>
            <h3 class="guide-step-title">{{ $t('home.guideStep3Title') }}</h3>
            <p class="guide-step-desc">{{ $t('home.guideStep3Desc') }}</p>
            <el-button type="success" plain size="small" @click="$router.push('/ranking')">
              {{ $t('home.guideStep3Cta') }}
            </el-button>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 首页（PRD 4 大模块）
 * 1. 赛事动态区（live / upcoming / finished 三 tab）
 * 2. AI 热门分析简报
 * 3. 排行榜摘要（TOP10 用户 / 热门大模型 / 热门 Agent 平台）
 * 4. 平台使用指南
 */
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMatchStore } from '@/stores/match'
import { http } from '@/api/request'
import { regionToFlagClass } from '@/utils/agentPlatform'
import { getFlagClass } from '@/utils/flag'

const { locale: i18nLocale } = useI18n()
const matchStore = useMatchStore()

// ============ 模块 1：赛事动态 ============
const dynamicsTab = ref<'live' | 'upcoming' | 'finished'>('live')
const dynamicsLoading = ref(false)
const dynamicsMatches = reactive<{ live: any[]; upcoming: any[]; finished: any[] }>({
  live: [],
  upcoming: [],
  finished: [],
})

/** 拉取赛事动态（按状态分桶，失败时静默降级为空数组） */
async function loadMatchDynamics() {
  dynamicsLoading.value = true
  try {
    const [live, upcoming, finished] = await Promise.all([
      matchStore.fetchMatches({ status: 'live', pageSize: 6 }).catch(() => ({ list: [] })),
      matchStore.fetchMatches({ status: 'upcoming', pageSize: 6 }).catch(() => ({ list: [] })),
      matchStore.fetchMatches({ status: 'finished', pageSize: 6 }).catch(() => ({ list: [] })),
    ])
    dynamicsMatches.live = live.list || []
    dynamicsMatches.upcoming = upcoming.list || []
    dynamicsMatches.finished = finished.list || []
  } finally {
    dynamicsLoading.value = false
  }
}

// ============ 模块 2：AI 热门分析简报 ============
const briefLoading = ref(false)
interface HotBrief {
  matchId: string
  homeTeamName: string
  homeCountryCode?: string
  awayTeamName: string
  awayCountryCode?: string
  leagueName: string
  topConclusion: string
  accuracyRate: number
  analysisCount: number
  topModel?: string
}
const hotBriefs = ref<HotBrief[]>([])

/** 拉取 AI 热门分析简报（公开榜接口） */
async function loadHotBriefs() {
  briefLoading.value = true
  try {
    const res = await http
      .get<{ list: HotBrief[] }>('/ranking/hot-briefs', { params: { pageSize: 6 } })
      .catch(() => ({ list: [] }))
    hotBriefs.value = res.list || []
  } finally {
    briefLoading.value = false
  }
}

// ============ 模块 3：排行榜摘要 ============
const rankingSummaryLoading = ref(false)
const topUsers = ref<any[]>([])
const topModels = ref<any[]>([])
const topPlatforms = ref<any[]>([])

/** 准确率进度条渐变色 */
const accuracyColor = [
  { color: '#f56c6c', percentage: 33 },
  { color: '#e6a23c', percentage: 66 },
  { color: '#67c23a', percentage: 100 },
]

/** 国家/地区转 flag class（包一层以避免 view 内 import） */
function regionToFlag(region?: string | null): string {
  return regionToFlagClass(region)
}

/** 拉取排行榜摘要（TOP10 用户 + Top 大模型 + Top 平台） */
async function loadRankingSummary() {
  rankingSummaryLoading.value = true
  try {
    const [users, models, platforms] = await Promise.all([
      http.get<{ list: any[] }>('/ranking/users', { params: { pageSize: 10 } }).catch(() => ({ list: [] })),
      http.get<{ list: any[] }>('/ranking/models', { params: { pageSize: 5 } }).catch(() => ({ list: [] })),
      http.get<{ list: any[] }>('/ranking/platforms/top').catch(() => ({ list: [] })),
    ])
    topUsers.value = (users.list || []).slice(0, 10)
    topModels.value = models.list || []
    topPlatforms.value = platforms.list || []
  } finally {
    rankingSummaryLoading.value = false
  }
}

// ============ 工具 ============
/** 本地化格式化赛事开赛时间 */
function formatTime(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString(i18nLocale.value, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ============ 生命周期 ============
onMounted(() => {
  loadMatchDynamics()
  loadHotBriefs()
  loadRankingSummary()
})
</script>

<style scoped>
/* ============ Hero 区域 ============ */
.hero-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0a1f3d 0%, #163168 40%, #0a1f3d 100%);
  border-radius: 16px;
  padding: 56px 40px 48px;
  margin-bottom: 24px;
  color: #fff;
  box-shadow: 0 12px 40px rgba(10, 31, 61, 0.25);
}
.hero-flags-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.hero-flag {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  opacity: 0.08;
  filter: blur(2px);
}
.hero-flag-us { top: -40px; left: -40px; opacity: 0.12; }
.hero-flag-ca { top: 30%; right: -60px; opacity: 0.1; }
.hero-flag-mx { bottom: -60px; left: 35%; opacity: 0.1; }
.hero-content { position: relative; z-index: 1; max-width: 920px; }
.hero-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(245, 184, 0, 0.15);
  border: 1px solid rgba(245, 184, 0, 0.4);
  color: #f5b800;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 18px;
}
.hero-title { display: flex; flex-direction: column; gap: 8px; margin: 0 0 14px; line-height: 1.1; }
.hero-title-main { font-size: 48px; font-weight: 900; }
.hero-title-sub { font-size: 20px; font-weight: 500; color: #cbd5e1; }
.hero-desc { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #94a3b8; margin: 0 0 22px; }
.hero-flag-inline { font-size: 18px; border-radius: 2px; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.hero-cta-primary,
.hero-cta-secondary { font-weight: 600; }

/* ============ 通用 section ============ */
.section { margin-bottom: 28px; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

/* ============ 模块 1：赛事动态 ============ */
.dynamics-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
.dynamics-tabs :deep(.el-tabs__item) { font-weight: 500; }
.match-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 8px;
}
.match-card {
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  border: 1px solid #eef0f3;
}
.match-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(10, 31, 61, 0.08); }
.match-card--live { border-color: rgba(245, 108, 108, 0.4); }
.match-card--finished { opacity: 0.92; }
.match-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 4px 0 12px;
}
.team-info { display: flex; align-items: center; gap: 6px; min-width: 0; }
.team-info:last-child { justify-content: flex-end; }
.team-flag { font-size: 22px; flex-shrink: 0; }
.team-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.match-vs { display: flex; align-items: center; justify-content: center; min-width: 60px; }
.score { font-size: 18px; font-weight: 700; color: #1a1a2e; }
.vs-text { font-size: 13px; color: #94a3b8; font-weight: 600; }
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f56c6c;
  display: inline-block;
  margin-left: 4px;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
}
.live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  margin-right: 4px;
  animation: pulse 1.4s ease-in-out infinite;
}
.match-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}
.match-time { font-size: 12px; color: #94a3b8; }

/* ============ 模块 2：AI 热门分析简报 ============ */
.brief-card {
  cursor: pointer;
  margin-bottom: 14px;
  height: calc(100% - 14px);
  border: 1px solid #eef0f3;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.brief-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(10, 31, 61, 0.08); }
.brief-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.brief-teams { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.brief-team-name { font-size: 13px; font-weight: 600; color: #1a1a2e; }
.brief-vs { color: #94a3b8; font-size: 12px; padding: 0 4px; }
.brief-body { padding: 14px 0 10px; min-height: 90px; }
.brief-conclusion {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: #334155;
  margin-bottom: 12px;
}
.brief-icon { color: #5b8ff9; margin-top: 2px; flex-shrink: 0; }
.brief-conclusion-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.brief-accuracy { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; }
.brief-accuracy-label { font-size: 12px; color: #64748b; }
.brief-accuracy-num { font-size: 13px; font-weight: 600; color: #1a1a2e; }
.brief-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  font-size: 12px;
  color: #94a3b8;
}
.brief-platform { display: flex; align-items: center; }

/* ============ 模块 3：排行榜摘要 ============ */
.summary-card { height: 100%; border: 1px solid #eef0f3; }
.summary-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1a1a2e;
}
.summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: #fff;
}
.summary-icon--user { background: linear-gradient(135deg, #5b8ff9, #3b6dd6); }
.summary-icon--model { background: linear-gradient(135deg, #f59e0b, #d97706); }
.summary-icon--platform { background: linear-gradient(135deg, #10b981, #059669); }
.summary-list { list-style: none; margin: 0; padding: 0; }
.summary-list-item {
  display: grid;
  grid-template-columns: 32px 28px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: background 0.15s ease;
}
.summary-list-item:hover { background: #f8fafc; }
.summary-list-item:last-child { border-bottom: none; }
.summary-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}
.summary-rank--top1 { background: linear-gradient(135deg, #fde68a, #f59e0b); color: #fff; }
.summary-rank--top2 { background: linear-gradient(135deg, #e2e8f0, #94a3b8); color: #fff; }
.summary-rank--top3 { background: linear-gradient(135deg, #fed7aa, #ea580c); color: #fff; }
.summary-flag { font-size: 18px; border-radius: 2px; }
.summary-name { font-size: 13px; color: #1a1a2e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.summary-accuracy { font-size: 13px; font-weight: 600; color: #1a1a2e; }
.summary-empty { padding: 24px 0; text-align: center; color: #94a3b8; font-size: 13px; }

/* ============ 模块 4：使用指南 ============ */
.guide-section { margin-bottom: 0; }
.guide-step {
  position: relative;
  background: #fff;
  border: 1px solid #eef0f3;
  border-radius: 12px;
  padding: 28px 20px 24px;
  text-align: center;
  height: 100%;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.guide-step:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(10, 31, 61, 0.08); }
.guide-step-num {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a2e, #e94560);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.guide-step-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #4338ca;
  margin-bottom: 14px;
}
.guide-step-title { font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
.guide-step-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
  margin: 0 0 14px;
  min-height: 60px;
}
</style>
