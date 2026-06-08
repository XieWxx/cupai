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
            <span class="ov-suffix">{{ $t('ranking.times') }}</span>
          </template>
        </el-statistic>
      </el-card>
    </section>

    <!-- Tab：用户 / 大模型 / Agent 平台 -->
    <el-tabs v-model="activeTab" @tab-change="loadData">
      <!-- 用户排行 -->
      <el-tab-pane :label="$t('ranking.userRanking')" name="users">
        <el-table
          :data="userRankings"
          v-loading="loading"
          stripe
          row-class-name="ranking-row"
          class="ranking-table"
        >
          <!-- 排名（带金银铜 badge） -->
          <el-table-column :label="$t('ranking.rank')" width="64" align="center">
            <template #default="{ $index }">
              <span :class="['rank-badge', $index < 3 ? `rank-${$index + 1}` : '']">
                {{ $index + 1 }}
              </span>
            </template>
          </el-table-column>

          <!-- 用户：国旗 + 用户名 -->
          <el-table-column :label="$t('ranking.user')" min-width="120">
            <template #default="{ row }">
              <div class="user-cell">
                <span
                  :class="['flag-icon', 'fi', `fi-${flagClass(row.user?.region)}`]"
                  :title="row.user?.region || 'XX'"
                />
                <span class="user-nickname">{{ row.user?.nickname || $t('common.anonymous') }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- Agent 平台：icon + 名称 -->
          <el-table-column :label="$t('ranking.agentPlatform')" min-width="130">
            <template #default="{ row }">
              <PlatformBadge :platform="platformOf(row)" />
            </template>
          </el-table-column>

          <!-- 大模型：icon + 名称 -->
          <el-table-column :label="$t('ranking.model')" min-width="150">
            <template #default="{ row }">
              <PlatformBadge :platform="modelOf(row)" :show-name="true" />
            </template>
          </el-table-column>

          <!-- 预测次数 -->
          <el-table-column :label="$t('ranking.totalPredictions')" prop="totalPredictions" width="100" align="center" />

          <!-- 空数据提示 -->
          <template #empty>
            <el-empty :description="$t('common.noData')" :image-size="80" />
          </template>
        </el-table>
      </el-tab-pane>

      <!-- 大模型排行 -->
      <el-tab-pane :label="$t('ranking.modelRanking')" name="models">
        <el-table :data="modelRankings" stripe v-loading="loading" class="ranking-table">
          <el-table-column :label="$t('ranking.rank')" width="64" align="center">
            <template #default="{ $index }">
              <span :class="['rank-badge', $index < 3 ? `rank-${$index + 1}` : '']">
                {{ $index + 1 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.model')" min-width="260" :show-overflow-tooltip="true">
            <template #default="{ row }">
              <PlatformBadge :platform="detectModel(row.modelName || '')" :show-name="true" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('ranking.userCount')" prop="userCount" width="110" align="center" />
          <el-table-column :label="$t('ranking.totalPredictions')" prop="totalPredictions" width="120" align="center" />
          <!-- 空数据提示 -->
          <template #empty>
            <el-empty :description="$t('common.noData')" :image-size="80" />
          </template>
        </el-table>
      </el-tab-pane>

      <!-- Agent 平台排行 -->
      <el-tab-pane :label="$t('ranking.platformRanking')" name="platforms">
        <el-table :data="platformRankings" stripe v-loading="loading" class="ranking-table">
          <el-table-column :label="$t('ranking.rank')" width="64" align="center">
            <template #default="{ $index }">
              <span :class="['rank-badge', $index < 3 ? `rank-${$index + 1}` : '']">
                {{ $index + 1 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('ranking.platformLabel')" min-width="240" :show-overflow-tooltip="true">
            <template #default="{ row }">
              <PlatformBadge :platform="detectPlatform(row.platformKey || row.platform)" :show-name="true" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('ranking.userCount')" prop="userCount" width="110" align="center" />
          <el-table-column :label="$t('ranking.totalPredictions')" prop="totalPredictions" width="120" align="center" />
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
      <el-descriptions :column="3" border>
        <el-descriptions-item :label="$t('ranking.totalPredictions')">
          {{ myRanking.totalPredictions }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('ranking.agentPlatform')">
          <PlatformBadge :platform="myPlatform" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('ranking.model')">
          <PlatformBadge :platform="myModel" :show-name="true" />
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
 * - 顶部核心指标卡（参与人数 / 累计分析数）
 * - 用户排行 tab：排名 badge、国旗、Agent 平台 icon、大模型 icon、预测次数
 * - 大模型排行 tab：模型名称、Agent 平台、预测次数
 * - Agent 平台排行 tab：平台名称、用户数、预测次数
 * - 数据来源：/api/v1/ranking/users、/api/v1/ranking/models、/api/v1/ranking/platforms
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

interface UserRankingRow {
  id: string
  userId: string
  totalPredictions: number
  totalScore: number
  accuracyRate: number | string
  // Agent 回调时记录的最近模型和平台
  lastModel?: string
  lastPlatform?: string
  user: {
    id: string
    nickname: string
    avatar?: string
    region?: string
    defaultAiConfig?: { modelName?: string; apiEndpoint?: string } | null
  }
}

const activeTab = ref<'users' | 'models' | 'platforms'>('users')
const loading = ref(false)
const userRankings = ref<UserRankingRow[]>([])
const modelRankings = ref<any[]>([])
const platformRankings = ref<any[]>([])
const myRanking = ref<any>(null)

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
  // 优先使用 Agent 回调时记录的平台
  if (row.lastPlatform) return detectPlatform(row.lastPlatform)
  const cfg = row.user?.defaultAiConfig
  return detectPlatform(cfg?.apiEndpoint || '')
}

function modelOf(row: UserRankingRow): AgentPlatform {
  // 优先使用 Agent 回调时记录的模型
  if (row.lastModel) return detectModel(row.lastModel)
  const cfg = row.user?.defaultAiConfig
  return detectModel(cfg?.modelName || '')
}

/* ============ 个人排行：平台/模型元数据 ============ */
const myPlatform = computed(() => {
  if (!myRanking.value) return detectPlatform('')
  if (myRanking.value.lastPlatform) return detectPlatform(myRanking.value.lastPlatform)
  return detectPlatform(myRanking.value.user?.defaultAiConfig?.apiEndpoint || '')
})

const myModel = computed(() => {
  if (!myRanking.value) return detectModel('')
  if (myRanking.value.lastModel) return detectModel(myRanking.value.lastModel)
  return detectModel(myRanking.value.user?.defaultAiConfig?.modelName || '')
})

/* ============ 数据加载 ============ */
async function loadData() {
  loading.value = true
  try {
    if (activeTab.value === 'users') {
      const res = await http.get<{ list: UserRankingRow[] }>('/ranking/users')
      userRankings.value = res.list || []
    } else if (activeTab.value === 'models') {
      const res = await http.get<{ list: any[] }>('/ranking/models')
      modelRankings.value = res.list || []
    } else if (activeTab.value === 'platforms') {
      const res = await http.get<{ list: any[] }>('/ranking/platforms')
      platformRankings.value = res.list || []
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

/* ============== 个人卡片 ============== */
.my-ranking-card {
  margin-top: var(--space-6);
}

/* ============== 响应式 ============== */
@media (max-width: 480px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .user-cell {
    gap: var(--space-1);
  }

  .user-nickname {
    max-width: 80px;
  }
}
</style>
