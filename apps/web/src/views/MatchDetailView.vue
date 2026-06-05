<template>
  <div class="match-detail-view" v-loading="loading">
    <el-page-header @back="$router.back()" :title="$t('common.back')">
      <template #content>
        <span>{{ match?.homeTeam?.name }} VS {{ match?.awayTeam?.name }}</span>
        <el-tag v-if="match?.status === 'live'" type="danger" size="small" style="margin-left: 8px">LIVE</el-tag>
        <el-tag v-else-if="match?.status === 'finished'" type="success" size="small" style="margin-left: 8px">已结束</el-tag>
        <el-tag v-else type="info" size="small" style="margin-left: 8px">未开始</el-tag>
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
        半场 {{ match.halfTimeHome }} : {{ match.halfTimeAway }}
      </div>
    </el-card>

    <el-row :gutter="24" style="margin-top: 16px">
      <el-col :span="16">
        <!-- 赛事基础信息 -->
        <el-card>
          <template #header>赛事信息</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="赛事">{{ match?.leagueName }}</el-descriptions-item>
            <el-descriptions-item label="阶段">{{ match?.stage }}</el-descriptions-item>
            <el-descriptions-item label="开赛时间">{{ formatTime(match?.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="场馆">{{ match?.venue || '-' }}</el-descriptions-item>
            <el-descriptions-item label="裁判">{{ match?.refereeName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="裁判国籍">{{ match?.refereeNationality || '-' }}</el-descriptions-item>
            <el-descriptions-item label="裁判风格">{{ match?.refereeStyle || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 临场环境 -->
        <el-card style="margin-top: 16px" v-if="match?.temperature || match?.humidity">
          <template #header>临场环境</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="温度">{{ match?.temperature ?? '-' }}℃</el-descriptions-item>
            <el-descriptions-item label="湿度">{{ match?.humidity ?? '-' }}%</el-descriptions-item>
            <el-descriptions-item label="天气">{{ match?.weatherCondition || '-' }}</el-descriptions-item>
            <el-descriptions-item label="风速">{{ match?.windSpeed ?? '-' }} km/h</el-descriptions-item>
            <el-descriptions-item label="主队球迷">{{ match?.homeAttendance?.toLocaleString() || '-' }}</el-descriptions-item>
            <el-descriptions-item label="客队球迷">{{ match?.awayAttendance?.toLocaleString() || '-' }}</el-descriptions-item>
            <el-descriptions-item label="总观众">{{ match?.totalAttendance?.toLocaleString() || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 8 因子数据 -->
        <el-card style="margin-top: 16px" v-if="match?.matchData">
          <template #header>全维度因子数据</template>
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
          <template #header>数据来源</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="数据源">{{ match.dataSource }}</el-descriptions-item>
            <el-descriptions-item label="来源链接" v-if="match.dataSourceUrl">
              <a :href="match.dataSourceUrl" target="_blank" rel="noopener noreferrer">{{ match.dataSourceUrl }}</a>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 赛事舆情卡片 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>赛事舆情</span>
              <el-button type="primary" link @click="$router.push('/sentiment')">查看完整看板</el-button>
            </div>
          </template>
          <div v-loading="sentimentLoading">
            <el-row :gutter="16" v-if="matchSentiment">
              <el-col :span="6">
                <div class="mini-stat">
                  <div class="mini-value">{{ matchSentiment.sampleCount || 0 }}</div>
                  <div class="mini-label">舆情总量</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="mini-stat">
                  <div class="mini-value" :style="{ color: getSentimentColor(matchSentiment.avgScore) }">
                    {{ Number(matchSentiment.avgScore || 0).toFixed(3) }}
                  </div>
                  <div class="mini-label">情绪分</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="mini-stat">
                  <div class="mini-value" style="color: #67c23a">{{ ((matchSentiment.positiveRatio || 0) * 100).toFixed(1) }}%</div>
                  <div class="mini-label">正面比例</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="mini-stat">
                  <div class="mini-value" style="color: #f56c6c">{{ ((matchSentiment.negativeRatio || 0) * 100).toFixed(1) }}%</div>
                  <div class="mini-label">负面比例</div>
                </div>
              </el-col>
            </el-row>
            <div ref="miniChartRef" style="height: 200px; margin-top: 12px"></div>
            <el-empty v-if="!matchSentiment && !sentimentLoading" description="暂无舆情数据" :image-size="60" />
          </div>
        </el-card>
      </el-col>

      <!-- 快捷操作 -->
      <el-col :span="8">
        <el-card>
          <template #header>快捷操作</template>
          <div class="quick-actions">
            <el-button type="primary" style="width: 100%; margin-bottom: 12px" @click="$router.push('/analysis')">
              AI 分析此赛事
            </el-button>
            <el-button style="width: 100%; margin-bottom: 12px" @click="$router.push('/square')">
              查看相关分析
            </el-button>
            <el-button style="width: 100%" @click="$router.push('/ranking')">
              查看排行榜
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchStore } from '@/stores/match'
import { subscribeMatch } from '@/api/websocket'
import { http } from '@/api/request'
import * as echarts from 'echarts'

const route = useRoute()
const matchStore = useMatchStore()
const loading = ref(false)
const match = ref<any>(null)
let unsubscribe: (() => void) | null = null

// 舆情相关
const matchSentiment = ref<any>(null)
const sentimentLoading = ref(false)
const miniChartRef = ref<HTMLElement>()
let miniChart: echarts.ECharts | null = null

// 8 因子字段中文映射
const factorLabels: Record<string, string> = {
  shots: '射门次数',
  shotsOnTarget: '射正次数',
  possession: '控球率',
  corners: '角球',
  fouls: '犯规',
  offsides: '越位',
  yellowCards: '黄牌',
  redCards: '红牌',
  passes: '传球',
  passAccuracy: '传球成功率',
  historicalRecord: '历史战绩',
  teamStrength: '球队实力',
  playerStatus: '球员状态',
  realtimeDynamic: '实时动态',
  environment: '环境因素',
  tacticalCounter: '战术克制',
  socialSentiment: '舆情情绪',
  hiddenFactors: '隐藏因素',
}

function factorLabel(key: string): string {
  return factorLabels[key] || key
}

function formatFactorValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
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
        xAxis: { type: 'category', data: ['情绪分', '正面比', '负面比', '压力指数'] },
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
