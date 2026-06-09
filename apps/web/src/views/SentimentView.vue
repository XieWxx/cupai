<template>
  <div class="sentiment-view">
    <header class="page-header">
      <h1 class="page-title">{{ $t('sentiment.title') }}</h1>
      <p class="page-subtitle">{{ $t('sentiment.subtitle') }}</p>
    </header>

    <!-- 全局概览卡片 -->
    <el-row :gutter="16" class="overview-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="common-card overview-card">
          <div class="stat-card">
            <div class="stat-value">{{ overview.total || 0 }}</div>
            <div class="stat-label">{{ $t('sentiment.totalCount') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="common-card overview-card">
          <div class="stat-card">
            <div class="stat-value" :style="{ color: getScoreColor(overview.avgScore) }">
              {{ formatScore(overview.avgScore) }}
            </div>
            <div class="stat-label">{{ $t('sentiment.avgScore') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="common-card overview-card">
          <div class="stat-card">
            <div class="stat-value">{{ platformCount }}</div>
            <div class="stat-label">{{ $t('sentiment.platformCount') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="common-card overview-card">
          <div class="stat-card">
            <div class="stat-value">{{ languageCount }}</div>
            <div class="stat-label">{{ $t('sentiment.languageCount') }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: var(--space-4)">
      <!-- 情绪趋势图 -->
      <el-col :span="16">
        <el-card class="common-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('sentiment.trendTitle') }}</span>
              <el-radio-group v-model="trendInterval" size="small" @change="loadTimeline">
                <el-radio-button value="hour">{{ $t('sentiment.byHour') }}</el-radio-button>
                <el-radio-button value="day">{{ $t('sentiment.byDay') }}</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>

      <!-- 语言分布饼图 -->
      <el-col :span="8">
        <el-card class="common-card">
          <template #header>{{ $t('sentiment.languageDist') }}</template>
          <div ref="langChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: var(--space-4)">
      <!-- 平台统计 -->
      <el-col :span="8">
        <el-card class="common-card">
          <template #header>{{ $t('sentiment.platformDist') }}</template>
          <div ref="platformChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>

      <!-- 地区分布 -->
      <el-col :span="8">
        <el-card class="common-card">
          <template #header>{{ $t('sentiment.regionDist') }}</template>
          <div ref="regionChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>

      <!-- 情绪得分分布 -->
      <el-col :span="8">
        <el-card class="common-card">
          <template #header>{{ $t('sentiment.scoreDist') }}</template>
          <div ref="scoreChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: var(--space-4)">
      <!-- 各队情绪趋势 -->
      <el-col :span="12">
        <el-card class="common-card">
          <template #header>{{ $t('sentiment.teamTrend') }}</template>
          <div class="team-ranking">
            <div v-for="(team, idx) in teamRanking" :key="team.id" class="team-item">
              <span class="team-rank">{{ idx + 1 }}</span>
              <span class="team-name">{{ getTeamName({ name: team.name }) }}</span>
              <span class="team-score" :style="{ color: getScoreColor(team.avgScore) }">
                {{ formatScore(team.avgScore) }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 实时舆情流 -->
      <el-col :span="12">
        <el-card class="common-card">
          <template #header>{{ $t('sentiment.realTimeFeed') }}</template>
          <div class="sentiment-feed">
            <div v-for="item in feedList" :key="item.id" class="feed-item">
              <div class="feed-header">
                <span class="feed-platform">{{ item.platform }}</span>
                <span class="feed-lang">{{ item.language }}</span>
                <span class="feed-time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <p class="feed-text">{{ item.text }}</p>
              <div class="feed-footer">
                <span class="feed-score" :style="{ color: getScoreColor(item.sentimentScore) }">
                  {{ formatScore(item.sentimentScore) }}
                </span>
                <span class="feed-confidence">{{ t('sentiment.confidence') }}: {{ item.confidence }}%</span>
              </div>
            </div>
            <el-empty v-if="feedList.length === 0" :description="$t('sentiment.noFeed')" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { http } from '@/api/request'
import { useI18n } from 'vue-i18n'
import { useTeamName } from '@/composables/useTeamName'
const { t, locale: i18nLocale } = useI18n()
const { getTeamName } = useTeamName()

const overview = ref<any>({})
const timeline = ref<any[]>([])
const langDist = ref<any[]>([])
const platformDist = ref<any[]>([])
const regionDist = ref<any[]>([])
const scoreDist = ref<any[]>([])
const teamRanking = ref<any[]>([])
const feedList = ref<any[]>([])
const trendInterval = ref('hour')

const trendChartRef = ref<HTMLElement>()
const langChartRef = ref<HTMLElement>()
const platformChartRef = ref<HTMLElement>()
const regionChartRef = ref<HTMLElement>()
const scoreChartRef = ref<HTMLElement>()

const platformCount = computed(() => platformDist.value.length)
const languageCount = computed(() => langDist.value.length)

function getScoreColor(score: number): string {
  if (score >= 60) return 'var(--color-success)'
  if (score >= 40) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function formatScore(score: number | null | undefined): string {
  if (score == null) return '-'
  return `${Math.round(score)}`
}

function formatTime(time: string): string {
  return new Date(time).toLocaleTimeString()
}

async function loadOverview() {
  try {
    const res = await http.get<{
      total: number
      avgScore: number
      platformStats: Array<{ platform: string; count: number; avgScore: number }>
      languageStats: Array<{ language: string; count: number; avgScore: number }>
      regionStats: Array<{ region: string; count: number; avgScore: number }>
    }>('/sentiment/overview')
    overview.value = {
      ...(res || {}),
      // 后端 avgScore 是 .toFixed(4) 字符串，转为 number 便于 getScoreColor 比较
      avgScore: Number(res?.avgScore) || 0,
      total: Number(res?.total) || 0,
    }

    // 从 overview 派生分布图数据（后端 GET /sentiment/charts 暂未实现，
    // 文档 §4.1 建议由 overview 前端聚合临时替代）
    langDist.value = (res?.languageStats || []).map((s) => ({ name: s.language, value: Number(s.count) }))
    platformDist.value = (res?.platformStats || []).map((s) => ({ name: s.platform, value: Number(s.count) }))
    regionDist.value = (res?.regionStats || []).map((s) => ({ name: s.region, value: Number(s.count) }))

    renderLangChart()
    renderPlatformChart()
    renderRegionChart()
  } catch (err) {
    console.error('[loadOverview] failed:', err)
  }
}

async function loadTimeline() {
  try {
    // 后端字段：period / positiveCount / negativeCount / neutralCount
    const res = await http.get<Array<{
      period: string
      positiveCount: number
      negativeCount: number
      neutralCount: number
    }>>('/sentiment/timeline', {
      params: { interval: trendInterval.value },
    })
    timeline.value = res || []
    renderTrendChart()
  } catch (err) {
    console.error('[loadTimeline] failed:', err)
  }
}

/**
 * 派生出 teamRanking / scoreDist / feedList 等聚合数据
 * scoreDist 从 overview.recentTrend 真实数据按桶聚合（0-0.25 / 0.25-0.5 / 0.5-0.75 / 0.75-1.0）
 */
async function loadDerivedData() {
  try {
    // 球队情绪排行：后端暂未提供 topTeams 字段，保留空态等接口完善
    teamRanking.value = []

    // 情感得分分布：基于 overview.recentTrend 中各时段 avgScore 按桶聚合
    const trend: any[] = overview.value?.recentTrend || []
    if (trend.length > 0) {
      const buckets = [
        { range: '0-25', min: 0, max: 0.25, count: 0 },
        { range: '25-50', min: 0.25, max: 0.5, count: 0 },
        { range: '50-75', min: 0.5, max: 0.75, count: 0 },
        { range: '75-100', min: 0.75, max: 1.01, count: 0 },
      ]
      for (const item of trend) {
        const score = Number(item.avgScore) || 0
        for (const b of buckets) {
          if (score >= b.min && score < b.max) { b.count++; break }
        }
      }
      scoreDist.value = buckets.map((b) => ({ range: b.range, count: b.count }))
    } else {
      // 无趋势数据时保留空态
      scoreDist.value = []
    }
    renderScoreChart()

    // 实时舆情流：后端无 feedList 接口，保留空态
    feedList.value = []
  } catch (err) {
    console.error('[loadDerivedData] failed:', err)
  }
}

function renderTrendChart() {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: [t('sentiment.positive'), t('sentiment.neutral'), t('sentiment.negative')] },
    grid: { left: 40, right: 20, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: timeline.value.map((item) => item.period) },
    yAxis: { type: 'value' },
    series: [
      { name: t('sentiment.positive'), type: 'line', data: timeline.value.map((item) => Number(item.positiveCount) || 0) },
      { name: t('sentiment.neutral'), type: 'line', data: timeline.value.map((item) => Number(item.neutralCount) || 0) },
      { name: t('sentiment.negative'), type: 'line', data: timeline.value.map((item) => Number(item.negativeCount) || 0) },
    ],
  })
}

function renderLangChart() {
  if (!langChartRef.value) return
  const chart = echarts.init(langChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: langDist.value.map((d) => ({ name: d.name, value: d.value })),
      },
    ],
  })
}

function renderPlatformChart() {
  if (!platformChartRef.value) return
  const chart = echarts.init(platformChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: platformDist.value.map((d) => ({ name: d.name, value: d.value })),
      },
    ],
  })
}

function renderRegionChart() {
  if (!regionChartRef.value) return
  const chart = echarts.init(regionChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: regionDist.value.map((d) => ({ name: d.name, value: d.value })),
      },
    ],
  })
}

function renderScoreChart() {
  if (!scoreChartRef.value) return
  const chart = echarts.init(scoreChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: scoreDist.value.map((d) => d.range) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: scoreDist.value.map((d) => d.count) }],
  })
}

onMounted(() => {
  loadOverview()
  loadTimeline()
  loadDerivedData()
})

/** 语言切换时重渲染所有图表 */
watch(i18nLocale, () => {
  renderTrendChart()
  renderLangChart()
  renderPlatformChart()
  renderRegionChart()
  renderScoreChart()
})

onUnmounted(() => {
  // 解构 ref 时已做 ref.value 守卫，避免 TS undefined 报错
  const refs = [
    trendChartRef.value,
    langChartRef.value,
    platformChartRef.value,
    regionChartRef.value,
    scoreChartRef.value,
  ]
  refs.forEach((el) => el && echarts.dispose(el))
})
</script>

<style scoped>
.sentiment-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* .page-header、.card-header、.stat-card、.stat-value、.stat-label 使用全局样式 */

.overview-cards {
  margin-bottom: var(--space-4);
}

.overview-card :deep(.el-statistic__content) {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
}

.team-ranking {
  max-height: 300px;
  overflow-y: auto;
}

.team-item {
  display: flex;
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.team-item:last-child {
  border-bottom: none;
}

.team-rank {
  width: 24px;
  font-weight: var(--font-bold);
  text-align: center;
}

.team-name {
  min-width: 60px;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.team-score {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  margin-left: auto;
}

.sentiment-feed {
  max-height: 500px;
  overflow-y: auto;
}

.feed-item {
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.feed-item:last-child {
  border-bottom: none;
}

.feed-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.feed-platform {
  font-size: var(--text-xs);
  color: var(--color-primary);
  font-weight: var(--font-semibold);
}

.feed-lang {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.feed-time {
  font-size: var(--text-xs);
  color: var(--color-text-placeholder);
  margin-left: auto;
}

.feed-text {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-regular);
  margin: 0 0 var(--space-1);
}

.feed-footer {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.feed-score {
  font-weight: var(--font-semibold);
}

@media (max-width: 768px) {
  .sentiment-view :deep(.el-col) {
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
  .overview-cards :deep(.el-col) {
    max-width: 50% !important;
    flex: 0 0 50% !important;
  }
}

@media (max-width: 480px) {
  .overview-cards :deep(.el-col) {
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
}
</style>
