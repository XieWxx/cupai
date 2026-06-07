<template>
  <div class="ranking-view">
    <!-- 顶部背景渐变条（深蓝 → 亮红 → 金色，呼应 2026 主题） -->
    <div class="hero-bar" />

    <!-- 标题区 -->
    <header class="page-header">
      <h1 class="page-title">{{ $t('ranking.title') }}</h1>
      <p class="page-subtitle">{{ $t('ranking.pageSubtitle') }}</p>
    </header>

    <!-- 顶部统计指标（仅保留：参与人数、累计分析数） -->
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
          <el-table-column :label="$t('ranking.rank')" width="70" align="center">
            <template #default="{ $index }">
              <span :class="['rank-badge', $index < 3 ? `rank-${$index + 1}` : '']">
                {{ $index + 1 }}
              </span>
            </template>
          </el-table-column>

          <!-- 用户：国旗 + 用户名（不显示头像，min-width 撑满剩余空间） -->
          <el-table-column :label="$t('ranking.user')" min-width="140">
            <template #default="{ row }">
              <div class="user-cell">
                <span
                  :class="['flag-icon', 'fi', `fi-${flagClass(row.user?.region)}`]"
                  :title="row.user?.region || 'XX'"
                />
                <span class="user-nickname">{{ row.user?.nickname || 'Anonymous' }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- Agent 平台：icon + 名称 -->
          <el-table-column :label="$t('ranking.agentPlatform')" width="140">
            <template #default="{ row }">
              <PlatformBadge :platform="platformOf(row)" />
            </template>
          </el-table-column>

          <!-- 大模型：icon + 名称 -->
          <el-table-column :label="$t('ranking.model')" width="170">
            <template #default="{ row }">
              <PlatformBadge :platform="modelOf(row)" :show-name="true" />
            </template>
          </el-table-column>

          <!-- 总预测准确率（带百分比 Icon，PRD 3.3.2 字段） -->
          <el-table-column width="110">
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
          <el-table-column width="110">
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
          <el-table-column width="110">
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
          <el-table-column :label="$t('ranking.totalPredictions')" prop="totalPredictions" width="120" align="center" />

          <!-- 空数据提示 -->
          <template #empty>
            <el-empty :description="$t('common.noData')" :image-size="80" />
          </template>
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
          <el-table-column :label="$t('common.model')" prop="modelName" min-width="150" />
          <el-table-column :label="$t('ranking.agentPlatform')" min-width="150">
            <template #default="{ row }">
              <PlatformBadge :platform="row.platformName || row.platform || '-'" :show-name="true" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('ranking.totalPredictions')" prop="totalPredictions" width="100" align="center" />
          <el-table-column :label="$t('ranking.exactMatches')" prop="exactMatches" width="100" align="center" />
          <el-table-column :label="$t('ranking.basicMatches')" prop="basicMatches" width="100" align="center" />
          <el-table-column :label="$t('ranking.accuracyRate')" width="100" align="center">
            <template #default="{ row }">
              {{ Number(row.accuracyRate).toFixed(1) }}%
            </template>
          </el-table-column>
          <!-- 空数据提示 -->
          <template #empty>
            <el-empty :description="$t('common.noData')" :image-size="80" />
          </template>
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

/* ============ 顶部指标计算 ============ */
const overview = computed(() => {
  const list = userRankings.value || []
  const participants = list.length
  const totalAnalyses = list.reduce((s, r) => s + (r.totalPredictions || 0), 0)
  return { participants, totalAnalyses }
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
  } catch (err) {
    console.error(`[loadData] tab=${activeTab.value} failed:`, err)
  } finally {
    loading.value = false
  }
}

async function loadMyRanking() {
  try {
    const token = localStorage.getItem('cupai_token')
    if (!token) return
    myRanking.value = await http.get<any>('/ranking/my')
  } catch (err) {
    console.error('[loadMyRanking] failed:', err)
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
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-5);
  background: var(--gradient-wc);
  box-shadow: var(--shadow-sm);
}

/* ============== 标题区 ============== */
.page-header {
  margin-bottom: var(--space-5);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-2);
  color: var(--color-text-primary);
}

.page-subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* ============== 顶部指标卡（使用 common-card 样式） ============== */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.overview-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.overview-card:hover {
  box-shadow: var(--shadow-card-hover);
}

.overview-card :deep(.el-statistic__head) {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.overview-card :deep(.el-statistic__content) {
  font-size: var(--text-2xl);
  font-weight: var(--font-extrabold);
  color: var(--color-text-primary);
}

.ov-suffix {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-left: var(--space-1);
  font-weight: var(--font-medium);
}

/* ============== 排序选择器（PRD 3.3.3） ============== */
.sort-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.sort-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-semibold);
}

.sort-btn-label {
  margin-left: var(--space-1);
}

/* ============== 列头带 Icon（PRD 3.3.2 字段配套 Icon） ============== */
.col-header-with-icon {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.col-header--trophy :deep(.el-icon) {
  color: var(--color-warning);
}

.col-header--star :deep(.el-icon) {
  color: var(--color-wc-red);
}

/* ============== 表格 ============== */
.ranking-table :deep(.ranking-row:hover > td) {
  background-color: var(--color-bg-muted) !important;
}

.ranking-table :deep(.el-table__row) {
  transition: background-color var(--duration-fast) var(--ease-out);
}

/* ============== 用户列：国旗 + 头像 + 昵称 ============== */
.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.flag-icon {
  width: 22px;
  height: 16px;
  border: 0 !important;
  border-radius: 0;
  box-shadow: none !important;
  outline: none !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
  display: inline-block;
}

.user-nickname {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
  display: inline-block;
  vertical-align: middle;
}

/* ============== 准确率 ============== */
.accuracy-cell {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

.accuracy-num {
  font-size: var(--text-xs);
  color: var(--color-text-primary);
  font-weight: var(--font-semibold);
  font-variant-numeric: tabular-nums;
}

/* ============== 个人卡片 ============== */
.my-ranking-card {
  margin-top: var(--space-6);
}

/* ============== 响应式 ============== */
@media (max-width: 480px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .sort-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-cell {
    gap: var(--space-1);
  }

  .user-nickname {
    max-width: 80px;
  }
}
</style>
