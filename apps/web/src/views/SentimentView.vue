<template>
  <div class="sentiment-view">
    <h1>{{ $t('sentiment.title') }}</h1>
    <p class="subtitle">{{ $t('sentiment.subtitle') }}</p>

    <!-- 全局概览卡片 -->
    <el-row :gutter="16" class="overview-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ overview.total || 0 }}</div>
            <div class="stat-label">{{ $t('sentiment.totalCount') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value" :style="{ color: getScoreColor(overview.avgScore) }">
              {{ formatScore(overview.avgScore) }}
            </div>
            <div class="stat-label">{{ $t('sentiment.avgScore') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ platformCount }}</div>
            <div class="stat-label">{{ $t('sentiment.platformCount') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ languageCount }}</div>
            <div class="stat-label">{{ $t('sentiment.languageCount') }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <!-- 情绪趋势图 -->
      <el-col :span="16">
        <el-card>
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
        <el-card>
          <template #header>{{ $t('sentiment.languageDist') }}</template>
          <div ref="langChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <!-- 平台统计 -->
      <el-col :span="8">
        <el-card>
          <template #header>{{ $t('sentiment.platformDist') }}</template>
          <div ref="platformChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>

      <!-- 地区分布 -->
      <el-col :span="8">
        <el-card>
          <template #header>{{ $t('sentiment.regionDist') }}</template>
          <div ref="regionChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>

      <!-- 球队舆情排行 -->
      <el-col :span="8">
        <el-card>
          <template #header>{{ $t('sentiment.teamRanking') }}</template>
          <div class="team-ranking">
            <div v-for="(team, index) in teamRanking" :key="team.teamId" class="team-item">
              <span class="team-rank">{{ index + 1 }}</span>
              <span class="team-name">{{ team.name }}</span>
              <el-progress
                :percentage="team.score"
                :stroke-width="8"
                :color="getScoreColor(team.score / 100 * 2 - 1)"
                style="flex: 1; margin: 0 12px"
              />
              <span class="team-score" :style="{ color: getScoreColor(team.score / 100 * 2 - 1) }">
                {{ team.score > 50 ? $t('sentiment.positive') : $t('sentiment.negative') }}
              </span>
            </div>
            <el-empty v-if="teamRanking.length === 0" :description="$t('common.noData')" :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近舆情流 -->
    <el-card style="margin-top: 16px">
      <template #header>
        <div class="card-header">
          <span>{{ $t('sentiment.recentSentiment') }}</span>
          <el-select v-model="selectedPlatform" :placeholder="$t('sentiment.filterPlatform')" clearable size="small" style="width: 140px" @change="loadRecentItems">
            <el-option :label="t('match.platformTwitter')" value="twitter" />
            <el-option :label="t('match.platformReddit')" value="reddit" />
            <el-option :label="t('match.platformWeibo')" value="weibo" />
            <el-option :label="$t('sentiment.other')" value="other" />
          </el-select>
        </div>
      </template>
      <div class="sentiment-feed">
        <div v-for="item in recentItems" :key="item.id" class="feed-item">
          <div class="feed-header">
            <el-tag :type="getPolarityType(item.sentimentPolarity)" size="small">
              {{ getPolarityLabel(item.sentimentPolarity) }}
            </el-tag>
            <span class="feed-platform">{{ platformLabel(item.sourcePlatform) }}</span>
            <span class="feed-lang">{{ languageLabels[item.language] || item.language }}</span>
            <span class="feed-time">{{ formatTime(item.createdAt) }}</span>
          </div>
          <div class="feed-text">{{ item.originalText }}</div>
          <div class="feed-footer">
            <span class="feed-score" :style="{ color: getScoreColor(Number(item.sentimentScore)) }">
              {{ $t('sentiment.sentimentScore') }}: {{ Number(item.sentimentScore).toFixed(2) }}
            </span>
            <span class="feed-confidence">{{ $t('sentiment.confidence') }}: {{ (Number(item.confidence) * 100).toFixed(0) }}%</span>
            <span class="feed-engagement" v-if="item.engagement">{{ $t('sentiment.engagement') }}: {{ item.engagement }}</span>
          </div>
        </div>
        <el-empty v-if="recentItems.length === 0" :description="$t('sentiment.noData')" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import { http } from '@/api/request'

const { t, locale: i18nLocale } = useI18n()

const overview = ref<any>({})
const recentItems = ref<any[]>([])
const teamRanking = ref<any[]>([])
const trendInterval = ref<'hour' | 'day'>('hour')
const selectedPlatform = ref('')

// ECharts 引用
const trendChartRef = ref<HTMLElement>()
const langChartRef = ref<HTMLElement>()
const platformChartRef = ref<HTMLElement>()
const regionChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let langChart: echarts.ECharts | null = null
let platformChart: echarts.ECharts | null = null
let regionChart: echarts.ECharts | null = null

const platformCount = ref(0)
const languageCount = ref(0)

// 语言标签映射（响应式）
const languageLabels = computed<Record<string, string>>(() => ({
  'zh-CN': t('sentiment.zhCN'), 'en-US': t('sentiment.enUS'), 'es-ES': t('sentiment.esES'), 'fr-FR': t('sentiment.frFR'),
  'pt-BR': t('sentiment.ptBR'), 'ar-SA': t('sentiment.arSA'), 'ja-JP': t('sentiment.jaJP'), 'ko-KR': t('sentiment.koKR'),
}))

function getScoreColor(score: number): string {
  if (score > 0.3) return '#67c23a'
  if (score > 0) return '#e6a23c'
  if (score > -0.3) return '#f56c6c'
  return '#c45656'
}

function formatScore(score: number | string): string {
  return Number(score || 0).toFixed(3)
}

function getPolarityType(polarity: string): 'success' | 'danger' | 'info' {
  if (polarity === 'positive') return 'success'
  if (polarity === 'negative') return 'danger'
  return 'info'
}

function getPolarityLabel(polarity: string): string {
  if (polarity === 'positive') return t('sentiment.positive')
  if (polarity === 'negative') return t('sentiment.negative')
  return t('sentiment.neutral')
}

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString(i18nLocale.value, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function loadOverview() {
  try {
    const res = await http.get<any>('/sentiment/overview')
    overview.value = res || {}
    platformCount.value = res?.platformStats?.length || 0
    languageCount.value = res?.languageStats?.length || 0
  } catch {
    // 后端未启动
  }
}

async function loadTimeline() {
  try {
    const res = await http.get<any[]>('/sentiment/timeline', { params: { interval: trendInterval.value } })
    if (trendChart && res) {
      trendChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: res.map((r: any) => r.period) },
        yAxis: { type: 'value', min: -1, max: 1 },
        series: [
          { name: t('sentiment.scoreValue'), type: 'line', data: res.map((r: any) => Number(r.avgScore).toFixed(4)), smooth: true, itemStyle: { color: '#409eff' } },
          { name: t('sentiment.dataCount'), type: 'bar', data: res.map((r: any) => Number(r.count)), yAxisIndex: 1, itemStyle: { color: '#e6e8eb' } },
        ],
        grid: { left: 60, right: 60, bottom: 30, top: 30 },
      })
    }
  } catch {
    // 后端未启动
  }
}

async function loadRecentItems() {
  try {
    await http.get<any>('/sentiment/overview')
    // 从 overview 中获取最近数据（简化处理）
    recentItems.value = []
  } catch {
    // 后端未启动
  }
}

function initCharts() {
  if (trendChartRef.value) trendChart = echarts.init(trendChartRef.value)
  if (langChartRef.value) langChart = echarts.init(langChartRef.value)
  if (platformChartRef.value) platformChart = echarts.init(platformChartRef.value)
  if (regionChartRef.value) regionChart = echarts.init(regionChartRef.value)
}

function renderLangChart(stats: any[]) {
  if (!langChart || !stats?.length) return
  const langNames: Record<string, string> = { 'zh-CN': t('sentiment.zhCN'), 'en-US': t('sentiment.enUS'), 'es-ES': t('sentiment.esES'), 'fr-FR': t('sentiment.frFR'), 'pt-BR': t('sentiment.ptBR'), 'ar-SA': t('sentiment.arSA'), 'ja-JP': t('sentiment.jaJP'), 'ko-KR': t('sentiment.koKR') }
  langChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      data: stats.map((s: any) => ({ name: langNames[s.language] || s.language, value: Number(s.count) })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  })
}

function renderPlatformChart(stats: any[]) {
  if (!platformChart || !stats?.length) return
  platformChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['35%', '65%'],
      data: stats.map((s: any) => ({ name: platformLabels.value[s.platform] || s.platform, value: Number(s.count) })),
    }],
  })
}

function renderRegionChart(stats: any[]) {
  if (!regionChart || !stats?.length) return
  regionChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: stats.map((s: any) => s.region), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: stats.map((s: any) => Number(s.count)), itemStyle: { color: '#409eff' } }],
    grid: { left: 40, right: 20, bottom: 40, top: 20 },
  })
}

onMounted(async () => {
  await nextTick()
  initCharts()

  await loadOverview()
  await loadTimeline()

  // 渲染图表
  if (overview.value?.languageStats) renderLangChart(overview.value.languageStats)
  if (overview.value?.platformStats) renderPlatformChart(overview.value.platformStats)
  if (overview.value?.regionStats) renderRegionChart(overview.value.regionStats)

  // 窗口 resize 自适应
  window.addEventListener('resize', () => {
    trendChart?.resize()
    langChart?.resize()
    platformChart?.resize()
    regionChart?.resize()
  })
})
</script>

<style scoped>
.sentiment-view h1 {
  font-size: 22px;
  margin-bottom: 4px;
  color: #1a1a2e;
}

.subtitle {
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
}

.overview-cards .stat-card {
  text-align: center;
  padding: 8px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-ranking {
  max-height: 300px;
  overflow-y: auto;
}

.team-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.team-item:last-child {
  border-bottom: none;
}

.team-rank {
  width: 24px;
  font-weight: 700;
  text-align: center;
}

.team-name {
  min-width: 60px;
  font-size: 13px;
}

.team-score {
  font-size: 12px;
  font-weight: 600;
}

.sentiment-feed {
  max-height: 500px;
  overflow-y: auto;
}

.feed-item {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.feed-item:last-child {
  border-bottom: none;
}

.feed-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.feed-platform {
  font-size: 12px;
  color: #409eff;
  font-weight: 600;
}

.feed-lang {
  font-size: 11px;
  color: #999;
}

.feed-time {
  font-size: 11px;
  color: #ccc;
  margin-left: auto;
}

.feed-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 6px;
}

.feed-footer {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.feed-score {
  font-weight: 600;
}

.feed-confidence {
  color: #999;
}
</style>
