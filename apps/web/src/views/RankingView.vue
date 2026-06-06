<template>
  <div class="ranking-view">
    <!-- 顶部背景渐变条（深蓝 → 亮红 → 金色，呼应 2026 主题） -->
    <div class="hero-bar" />

    <!-- 标题区 -->
    <header class="page-header">
      <h1 class="page-title">{{ $t('ranking.title') }}</h1>
      <p class="page-subtitle">{{ $t('ranking.pageSubtitle') }}</p>
    </header>

    <!-- 顶部统计指标 -->
    <section class="overview-grid">
      <el-card shadow="hover" class="overview-card">
        <el-statistic
          :value="overview.participants"
          :title="$t('ranking.overview.participants')"
        >
          <template #suffix>
            <span class="ov-suffix">{{ $t('common.name') }}</span>
          </template>
        </el-statistic>
      </el-card>
      <el-card shadow="hover" class="overview-card">
        <el-statistic
          :value="overview.topScore"
          :title="$t('ranking.overview.topScore')"
        >
          <template #suffix>
            <span class="ov-suffix">pts</span>
          </template>
        </el-statistic>
      </el-card>
      <el-card shadow="hover" class="overview-card">
        <el-statistic
          :value="overview.avgScore"
          :title="$t('ranking.overview.avgScore')"
          :precision="1"
        >
          <template #suffix>
            <span class="ov-suffix">pts</span>
          </template>
        </el-statistic>
      </el-card>
      <el-card shadow="hover" class="overview-card">
        <el-statistic
          :value="overview.totalAnalyses"
          :title="$t('ranking.overview.totalAnalyses')"
        >
          <template #suffix>
            <span class="ov-suffix">次</span>
          </template>
        </el-statistic>
      </el-card>
    </section>

    <!-- Tab：用户 / 大模型 -->
    <el-tabs v-model="activeTab" @tab-change="loadData">
      <!-- 用户排行 -->
      <el-tab-pane :label="$t('ranking.userRanking')" name="users">
        <!-- 排序选择器（PRD 3.3.3）：默认按总预测准确率，可切换精准比分命中率 / 趣味数据命中率 -->
        <div class="sort-bar">
          <span class="sort-label">
            <el-icon><Sort /></el-icon>
            {{ $t('ranking.sortBy') }}
          </span>
          <el-radio-group v-model="sortBy" size="small" @change="onSortChange">
            <el-radio-button value="total">
              <el-icon><DataLine /></el-icon>
              <span class="sort-btn-label">{{ $t('ranking.totalAccuracy') }}</span>
            </el-radio-button>
            <el-radio-button value="exact">
              <el-icon><Trophy /></el-icon>
              <span class="sort-btn-label">{{ $t('ranking.exactScoreRate') }}</span>
            </el-radio-button>
            <el-radio-button value="funny">
              <el-icon><StarFilled /></el-icon>
              <span class="sort-btn-label">{{ $t('ranking.funnyDataRate') }}</span>
            </el-radio-button>
          </el-radio-group>
        </div>
        <el-table
          :data="userRankings"
          v-loading="loading"
          stripe
          row-class-name="ranking-row"
          class="ranking-table"
        >
          <!-- 排名（带金银铜 badge） -->
          <el-table-column :label="$t('ranking.rank')" width="80" align="center">
            <template #default="{ $index }">
              <span :class="['rank-badge', $index < 3 ? `rank-${$index + 1}` : '']">
                {{ $index + 1 }}
              </span>
            </template>
          </el-table-column>

          <!-- 用户：国旗 + 头像 + 用户名 -->
          <el-table-column :label="$t('ranking.user')" min-width="220">
            <template #default="{ row }">
              <div class="user-cell">
                <span
                  :class="['flag-icon', 'fi', `fi-${flagClass(row.user?.region)}`]"
                  :title="row.user?.region || 'XX'"
                />
                <el-avatar
                  :size="32"
                  :src="row.user?.avatar || defaultAvatar"
                  class="user-avatar"
                >
                  {{ (row.user?.nickname || '?').charAt(0).toUpperCase() }}
                </el-avatar>
                <span class="user-nickname">{{ row.user?.nickname || 'Anonymous' }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- Agent 平台：icon + 名称 -->
          <el-table-column :label="$t('ranking.agentPlatform')" min-width="180">
            <template #default="{ row }">
              <PlatformBadge :platform="platformOf(row)" />
            </template>
          </el-table-column>

          <!-- 大模型：icon + 名称 -->
          <el-table-column :label="$t('ranking.model')" min-width="180">
            <template #default="{ row }">
              <PlatformBadge :platform="modelOf(row)" :show-name="true" />
            </template>
          </el-table-column>

          <!-- 总积分（突出） -->
          <el-table-column :label="$t('ranking.totalScore')" width="120" align="center">
            <template #default="{ row }">
              <span class="total-score">{{ row.totalScore }}</span>
            </template>
          </el-table-column>

          <!-- 总预测准确率（带百分比 Icon，PRD 3.3.2 字段） -->
          <el-table-column width="180">
            <template #header>
              <span class="col-header-with-icon">
                <el-icon><DataLine /></el-icon>
                {{ $t('ranking.totalAccuracy') }}
              </span>
            </template>
            <template #default="{ row }">
              <div class="accuracy-cell">
                <span class="accuracy-num">{{ Number(row.accuracyRate || 0).toFixed(1) }}%</span>
                <el-progress
                  :percentage="Number(row.accuracyRate || 0)"
                  :stroke-width="6"
                  :show-text="false"
                  :color="accuracyColor"
                />
              </div>
            </template>
          </el-table-column>

          <!-- 精准比分命中率（奖杯 Icon · PRD 3.3.2 高难度奖项） -->
          <el-table-column width="170">
            <template #header>
              <span class="col-header-with-icon col-header--trophy">
                <el-icon><Trophy /></el-icon>
                {{ $t('ranking.exactScoreRate') }}
              </span>
            </template>
            <template #default="{ row }">
              <div class="accuracy-cell">
                <span class="accuracy-num">{{ Number(row.exactScoreRate ?? row.exactScoreAccuracyRate ?? 0).toFixed(1) }}%</span>
                <el-progress
                  :percentage="Number(row.exactScoreRate ?? row.exactScoreAccuracyRate ?? 0)"
                  :stroke-width="6"
                  :show-text="false"
                  :color="accuracyColor"
                />
              </div>
            </template>
          </el-table-column>

          <!-- 趣味数据命中率（星星 Icon · PRD 3.3.2 边角数据） -->
          <el-table-column width="170">
            <template #header>
              <span class="col-header-with-icon col-header--star">
                <el-icon><StarFilled /></el-icon>
                {{ $t('ranking.funnyDataRate') }}
              </span>
            </template>
            <template #default="{ row }">
              <div class="accuracy-cell">
                <span class="accuracy-num">{{ Number(row.funnyDataRate ?? row.funDataAccuracyRate ?? 0).toFixed(1) }}%</span>
                <el-progress
                  :percentage="Number(row.funnyDataRate ?? row.funDataAccuracyRate ?? 0)"
                  :stroke-width="6"
                  :show-text="false"
                  :color="accuracyColor"
                />
              </div>
            </template>
          </el-table-column>

          <!-- 预测次数 -->
          <el-table-column :label="$t('ranking.totalPredictions')" prop="totalPredictions" width="100" align="center" />
        </el-table>
      </el-tab-pane>

      <!-- 大模型排行 -->
      <el-tab-pane :label="$t('ranking.modelRanking')" name="models">
        <el-table :data="modelRankings" stripe v-loading="loading" class="ranking-table">
          <el-table-column :label="$t('ranking.rank')" width="80">
            <template #default="{ $index }">
              <span :class="['rank-badge', $index < 3 ? `rank-${$index + 1}` : '']">
                {{ $index + 1 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.model')" prop="modelName" />
          <el-table-column :label="$t('ranking.totalPredictions')" prop="totalPredictions" width="90" />
          <el-table-column :label="$t('ranking.exactMatches')" prop="exactMatches" width="100" />
          <el-table-column :label="$t('ranking.basicMatches')" prop="basicMatches" width="100" />
          <el-table-column :label="$t('ranking.totalScore')" prop="totalScore" width="90" />
          <el-table-column :label="$t('ranking.accuracyRate')" width="100">
            <template #default="{ row }">
              {{ Number(row.accuracyRate).toFixed(1) }}%
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 个人排行卡片 -->
    <el-card v-if="myRanking" class="my-ranking-card" shadow="hover">
      <template #header>{{ $t('ranking.myRanking') }}</template>
      <el-descriptions :column="4" border>
        <el-descriptions-item :label="$t('ranking.totalPredictions')">
          {{ myRanking.totalPredictions }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('ranking.exactMatches')">
          {{ myRanking.exactMatches }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('ranking.basicMatches')">
          {{ myRanking.basicMatches }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('ranking.totalScore')">
          {{ myRanking.totalScore }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('ranking.accuracyRate')">
          {{ Number(myRanking.accuracyRate).toFixed(1) }}%
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 排行榜页面
 *
 * 关键能力：
 * - 顶部 4 个核心指标卡（参与人数 / 最高积分 / 平均积分 / 累计分析数）
 * - 用户排行 tab：包含排名 badge、国旗 + 头像、Agent 平台 icon、大模型 icon、积分、准确率进度条
 * - 大模型排行 tab：保留原有聚合视图
 * - 数据来源：/api/v1/ranking/users 与 /api/v1/ranking/models
 */
import { ref, computed, onMounted } from 'vue'
import { http } from '@/api/request'
import {
  detectPlatform,
  detectModel,
  regionToFlagClass,
  type AgentPlatform,
} from '@/utils/agentPlatform'
import PlatformBadge from '@/components/ranking/PlatformBadge.vue'
import { Sort, DataLine, Trophy, StarFilled } from '@element-plus/icons-vue'

interface UserRankingRow {
  id: string
  userId: string
  totalPredictions: number
  exactMatches: number
  basicMatches: number
  totalScore: number
  accuracyRate: number | string
  // PRD 3.3.2 新增字段：精准比分命中率 / 趣味数据命中率
  exactScoreRate?: number
  exactScoreAccuracyRate?: number
  funnyDataRate?: number
  funDataAccuracyRate?: number
  user: {
    id: string
    nickname: string
    avatar?: string
    region?: string
    defaultAiConfig?: { modelName?: string; apiEndpoint?: string } | null
  }
}

const activeTab = ref<'users' | 'models'>('users')
/** 排序方式：PRD 3.3.3，默认 total（总预测准确率），可切换 exact / funny */
const sortBy = ref<'total' | 'exact' | 'funny'>('total')
const loading = ref(false)
const userRankings = ref<UserRankingRow[]>([])
const modelRankings = ref<any[]>([])
const myRanking = ref<any>(null)

/** 排序变化：重新请求后端 */
function onSortChange() {
  loadData()
}

/** 默认头像（首字母 placeholder） */
const defaultAvatar = ''

/* ============ 顶部指标计算 ============ */
const overview = computed(() => {
  const list = userRankings.value || []
  const participants = list.length
  const topScore = list.reduce((m, r) => Math.max(m, r.totalScore || 0), 0)
  const avgScore = participants
    ? list.reduce((s, r) => s + (r.totalScore || 0), 0) / participants
    : 0
  const totalAnalyses = list.reduce((s, r) => s + (r.totalPredictions || 0), 0)
  return { participants, topScore, avgScore, totalAnalyses }
})

/* ============ 工具：根据行得到平台/模型元数据 ============ */
function flagClass(region?: string | null): string {
  return regionToFlagClass(region)
}

function platformOf(row: UserRankingRow): AgentPlatform {
  const cfg = row.user?.defaultAiConfig
  return detectPlatform(cfg?.apiEndpoint || '')
}

function modelOf(row: UserRankingRow): AgentPlatform {
  const cfg = row.user?.defaultAiConfig
  return detectModel(cfg?.modelName || '')
}

/* ============ 准确率进度条渐变色 ============ */
const accuracyColor = [
  { color: '#f56c6c', percentage: 33 },
  { color: '#e6a23c', percentage: 66 },
  { color: '#67c23a', percentage: 100 },
]

/* ============ 数据加载 ============ */
async function loadData() {
  loading.value = true
  try {
    if (activeTab.value === 'users') {
      // PRD 3.3.3：用户排行支持按 total / exact / funny 排序
      const res = await http.get<{ list: UserRankingRow[] }>('/ranking/users', {
        params: { sort: sortBy.value },
      })
      userRankings.value = res.list || []
    } else {
      const res = await http.get<{ list: any[] }>('/ranking/models')
      modelRankings.value = res.list || []
    }
  } catch {
    // 后端未启动时忽略
  } finally {
    loading.value = false
  }
}

async function loadMyRanking() {
  try {
    const token = localStorage.getItem('cupai_token')
    if (!token) return
    myRanking.value = await http.get<any>('/ranking/my')
  } catch {
    // 未登录忽略
  }
}

onMounted(() => {
  loadData()
  loadMyRanking()
})
</script>

<style scoped>
/* ============== 顶部背景渐变条 ============== */
.hero-bar {
  height: 6px;
  border-radius: 3px;
  margin-bottom: 18px;
  background: linear-gradient(90deg, #0b2a5b 0%, #e63946 55%, #f4c430 100%);
  box-shadow: 0 2px 8px rgba(11, 42, 91, 0.15);
}

/* ============== 标题区 ============== */
.page-header {
  margin-bottom: 18px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #1a1a2e;
}

.page-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

/* ============== 顶部指标卡 ============== */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.overview-card {
  border-radius: 10px;
}

.overview-card :deep(.el-statistic__head) {
  font-size: 13px;
  color: #64748b;
}

.overview-card :deep(.el-statistic__content) {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a2e;
}

.ov-suffix {
  font-size: 12px;
  color: #94a3b8;
  margin-left: 4px;
  font-weight: 500;
}

/* ============== 排序选择器（PRD 3.3.3） ============== */
.sort-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.sort-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #475569;
  font-weight: 600;
}
.sort-btn-label { margin-left: 4px; }

/* ============== 列头带 Icon（PRD 3.3.2 字段配套 Icon） ============== */
.col-header-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #1a1a2e;
}
.col-header--trophy :deep(.el-icon) { color: #f59e0b; }
.col-header--star :deep(.el-icon) { color: #e94560; }

/* ============== 表格 ============== */
.ranking-table :deep(.ranking-row:hover > td) {
  background-color: #f8fafc !important;
}

.ranking-table :deep(.el-table__row) {
  transition: background-color 0.15s ease;
}

/* ============== 排名 badge（金银铜） ============== */
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 13px;
  background: #f0f0f0;
  color: #666;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #f4c430);
  color: #fff;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.45);
}

.rank-2 {
  background: linear-gradient(135deg, #e8e8e8, #b8b8b8);
  color: #fff;
  box-shadow: 0 2px 6px rgba(192, 192, 192, 0.45);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #a05a1f);
  color: #fff;
  box-shadow: 0 2px 6px rgba(205, 127, 50, 0.45);
}

/* ============== 用户列：国旗 + 头像 + 昵称 ============== */
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flag-icon {
  width: 22px;
  height: 16px;
  border-radius: 2px;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.2);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  display: inline-block;
}

.user-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #615ced, #4285f4);
  color: #fff;
  font-weight: 600;
}

.user-nickname {
  font-weight: 500;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============== 总积分 ============== */
.total-score {
  font-size: 20px;
  font-weight: 800;
  color: #d97706;
  font-variant-numeric: tabular-nums;
}

/* ============== 准确率 ============== */
.accuracy-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.accuracy-num {
  font-size: 12px;
  color: #1a1a2e;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ============== 个人卡片 ============== */
.my-ranking-card {
  margin-top: 24px;
}

/* ============== 响应式 ============== */
@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
