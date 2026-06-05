<template>
  <div class="match-detail-view" v-loading="loading">
    <el-page-header @back="$router.back()" :title="$t('common.back')">
      <template #content>
        <span>{{ match?.homeTeam?.name }} {{ $t('common.vs') }} {{ match?.awayTeam?.name }}</span>
        <el-tag v-if="match?.status === 'live'" type="danger" size="small" style="margin-left: 8px">{{ $t('match.live') }}</el-tag>
        <el-tag v-else-if="match?.status === 'finished'" type="success" size="small" style="margin-left: 8px">{{ $t('match.finished') }}</el-tag>
        <el-tag v-else type="info" size="small" style="margin-left: 8px">{{ $t('match.upcoming') }}</el-tag>
      </template>
    </el-page-header>

    <!-- 比分板 -->
    <el-card class="scoreboard" v-if="match?.homeScore !== null && match?.homeScore !== undefined">
      <div class="score-row">
        <div class="team-info">
          <span class="team-name">{{ match?.homeTeam?.name }}</span>
          <span class="team-rank" v-if="match?.homeTeam?.fifaRank">FIFA #{{ match.homeTeam.fifaRank }}</span>
        </div>
        <div class="score-display">
          <span class="score-num">{{ match?.homeScore }}</span>
          <span class="score-sep">:</span>
          <span class="score-num">{{ match?.awayScore }}</span>
        </div>
        <div class="team-info">
          <span class="team-name">{{ match?.awayTeam?.name }}</span>
          <span class="team-rank" v-if="match?.awayTeam?.fifaRank">FIFA #{{ match.awayTeam.fifaRank }}</span>
        </div>
      </div>
      <div class="half-time" v-if="match?.halfTimeHome !== null">
        {{ $t('match.halfTime') }} {{ match.halfTimeHome }} : {{ match.halfTimeAway }}
      </div>
    </el-card>

    <el-row :gutter="24" style="margin-top: 16px">
      <el-col :span="16">
        <!-- 赛事基础信息 -->
        <el-card>
          <template #header>{{ $t('match.matchInfo') }}</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('match.match')">{{ match?.leagueName }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.stage')">{{ stageLabel(match?.stage) }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.startTime')">{{ formatTime(match?.startTime) }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.venue')">{{ match?.venue || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.referee')">{{ match?.refereeName || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.refereeNationality')">{{ match?.refereeNationality || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.refereeStyle')">{{ match?.refereeStyle || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 临场环境 -->
        <el-card style="margin-top: 16px" v-if="match?.temperature || match?.humidity">
          <template #header>{{ $t('match.environment') }}</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('match.temperature')">{{ match?.temperature ?? '-' }}℃</el-descriptions-item>
            <el-descriptions-item :label="$t('match.humidity')">{{ match?.humidity ?? '-' }}%</el-descriptions-item>
            <el-descriptions-item :label="$t('match.weather')">{{ match?.weatherCondition || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.windSpeed')">{{ match?.windSpeed ?? '-' }} km/h</el-descriptions-item>
            <el-descriptions-item :label="$t('match.homeFans')">{{ match?.homeAttendance?.toLocaleString() || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.awayFans')">{{ match?.awayAttendance?.toLocaleString() || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.totalAttendance')">{{ match?.totalAttendance?.toLocaleString() || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 8 因子数据 -->
        <el-card style="margin-top: 16px" v-if="match?.matchData">
          <template #header>{{ $t('match.factorData') }}</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item
              v-for="(value, key) in match.matchData"
              :key="key"
              :label="factorLabel(String(key))"
            >
              {{ formatFactorValue(value) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 数据源溯源 -->
        <el-card style="margin-top: 16px" v-if="match?.dataSource">
          <template #header>{{ $t('match.dataSource') }}</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('match.dataSource')">{{ match.dataSource }}</el-descriptions-item>
            <el-descriptions-item :label="$t('match.sourceLink')" v-if="match.dataSourceUrl">
              <a :href="match.dataSourceUrl" target="_blank" rel="noopener noreferrer">{{ match.dataSourceUrl }}</a>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 赛事舆情卡片 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ $t('sentiment.matchSentiment') }}</span>
              <el-button type="primary" link @click="$router.push('/sentiment')">{{ $t('sentiment.viewFull') }}</el-button>
            </div>
          </template>
          <div v-loading="sentimentLoading">
            <el-row :gutter="16" v-if="matchSentiment">
              <el-col :span="6">
                <div class="mini-stat">
                  <div class="mini-value">{{ matchSentiment.sampleCount || 0 }}</div>
                  <div class="mini-label">{{ $t('sentiment.totalCount') }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="mini-stat">
                  <div class="mini-value" :style="{ color: getSentimentColor(matchSentiment.avgScore) }">
                    {{ Number(matchSentiment.avgScore || 0).toFixed(3) }}
                  </div>
                  <div class="mini-label">{{ $t('sentiment.sentimentScore') }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="mini-stat">
                  <div class="mini-value" style="color: #67c23a">{{ ((matchSentiment.positiveRatio || 0) * 100).toFixed(1) }}%</div>
                  <div class="mini-label">{{ $t('sentiment.positiveRatio') }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="mini-stat">
                  <div class="mini-value" style="color: #f56c6c">{{ ((matchSentiment.negativeRatio || 0) * 100).toFixed(1) }}%</div>
                  <div class="mini-label">{{ $t('sentiment.negativeRatio') }}</div>
                </div>
              </el-col>
            </el-row>
            <div ref="miniChartRef" style="height: 200px; margin-top: 12px"></div>
            <el-empty v-if="!matchSentiment && !sentimentLoading" :description="$t('sentiment.noData')" :image-size="60" />
          </div>
        </el-card>
      </el-col>

      <!-- 快捷操作 -->
      <el-col :span="8">
        <el-card>
          <template #header>{{ $t('match.quickActions') }}</template>
          <div class="quick-actions">
            <el-button type="primary" style="width: 100%; margin-bottom: 12px" @click="$router.push('/analysis')">
              {{ $t('match.analyzeMatch') }}
            </el-button>
            <el-button style="width: 100%; margin-bottom: 12px" @click="$router.push('/square')">
              {{ $t('match.viewRelatedAnalysis') }}
            </el-button>
            <el-button style="width: 100%" @click="$router.push('/ranking')">
              {{ $t('match.viewRanking') }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMatchStore } from '@/stores/match'
import { subscribeMatch } from '@/api/websocket'
import { http } from '@/api/request'
import * as echarts from 'echarts'

const route = useRoute()
const { t, locale: i18nLocale } = useI18n()
const matchStore = useMatchStore()
const loading = ref(false)
const match = ref<any>(null)
let unsubscribe: (() => void) | null = null

// 舆情相关
const matchSentiment = ref<any>(null)
const sentimentLoading = ref(false)
const miniChartRef = ref<HTMLElement>()
let miniChart: echarts.ECharts | null = null

// 8 因子字段映射（响应式）
const factorLabels = computed<Record<string, string>>(() => ({
  shots: t('match.shots'),
  shotsOnTarget: t('match.shotsOnTarget'),
  possession: t('match.possession'),
  corners: t('match.corners'),
  fouls: t('match.fouls'),
  offsides: t('match.offsides'),
  yellowCards: t('match.yellowCards'),
  redCards: t('match.redCards'),
  passes: t('match.passes'),
  passAccuracy: t('match.passAccuracy'),
  historicalRecord: t('match.historicalRecord'),
  teamStrength: t('match.teamStrength'),
  playerStatus: t('match.playerStatus'),
  realtimeDynamic: t('match.realtimeDynamic'),
  environment: t('match.environmentFactor'),
  tacticalCounter: t('match.tacticalCounter'),
  socialSentiment: t('match.socialSentiment'),
  hiddenFactors: t('match.hiddenFactors'),
}))

function factorLabel(key: string): string {
  return factorLabels.value[key] || key
}

function formatFactorValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString(i18nLocale.value)
}

// 舆情情绪分颜色映射
function getSentimentColor(score: number): string {
  if (score > 0.3) return '#67c23a'
  if (score > 0) return '#e6a23c'
  if (score > -0.3) return '#f56c6c'
  return '#c45656'
}

// 加载赛事舆情数据
async function loadMatchSentiment(matchId: string) {
  sentimentLoading.value = true
  try {
    const res = await http.get<any>(`/sentiment/match/${matchId}`)
    matchSentiment.value = res || null
    // 渲染迷你趋势图
    if (res && miniChartRef.value) {
      await nextTick()
      if (!miniChart) miniChart = echarts.init(miniChartRef.value)
      miniChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: [t('sentiment.sentimentScore'), t('sentiment.positiveRatio'), t('sentiment.negativeRatio'), t('sentiment.pressureIndex')] },
        yAxis: { type: 'value', min: 0, max: 1 },
        series: [{
          type: 'bar',
          data: [
            { value: Math.abs(Number(res.avgScore || 0)), itemStyle: { color: getSentimentColor(res.avgScore) } },
            { value: Number(res.positiveRatio || 0), itemStyle: { color: '#67c23a' } },
            { value: Number(res.negativeRatio || 0), itemStyle: { color: '#f56c6c' } },
            { value: Number(res.pressureIndex || 0), itemStyle: { color: '#e6a23c' } },
          ],
          barWidth: 40,
        }],
        grid: { left: 40, right: 20, bottom: 30, top: 20 },
      })
    }
  } catch {
    // 舆情接口未就绪
  } finally {
    sentimentLoading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const matchId = route.params.id as string
    match.value = await matchStore.fetchMatchDetail(matchId)

    // 订阅赛事 WebSocket 实时更新
    unsubscribe = subscribeMatch(matchId, (data: any) => {
      if (data.type === 'live_update' && match.value) {
        if (data.homeScore !== undefined) match.value.homeScore = data.homeScore
        if (data.awayScore !== undefined) match.value.awayScore = data.awayScore
      }
      if (data.type === 'match:update') {
        Object.assign(match.value, data)
      }
    })

    // 加载赛事舆情
    await loadMatchSentiment(matchId)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  unsubscribe?.()
  miniChart?.dispose()
})
</script>

<style scoped>
.scoreboard {
  margin-top: 16px;
  text-align: center;
}

.score-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
}

.team-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.team-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.team-rank {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-num {
  font-size: 36px;
  font-weight: 900;
  color: #1a1a2e;
}

.score-sep {
  font-size: 28px;
  color: #ccc;
}

.half-time {
  margin-top: 8px;
  font-size: 13px;
  color: #999;
}

.quick-actions {
  display: flex;
  flex-direction: column;
}

.mini-stat {
  text-align: center;
  padding: 8px 0;
}

.mini-value {
  font-size: 22px;
  font-weight: 800;
  color: #1a1a2e;
}

.mini-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
