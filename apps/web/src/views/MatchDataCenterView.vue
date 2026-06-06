<template>
  <div class="match-data-center-view">
    <!-- 页面标题区 -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('matchCenter.title') }}</h1>
      <div class="page-subtitle">{{ $t('matchCenter.subtitle') }}</div>
    </div>

    <!-- Tab 切换：小组积分榜 / 小组赛程 / 淘汰赛对阵图 -->
    <el-tabs v-model="activeTab" class="data-tabs">
      <!-- 小组积分榜 -->
      <el-tab-pane label="小组积分榜" name="standings">
        <el-card class="dark-card" shadow="never">
          <GroupStandings :groups="standingsGroups" :loading="loading.standings" />
        </el-card>
      </el-tab-pane>

      <!-- 小组赛程 -->
      <el-tab-pane label="小组赛程" name="groupMatches">
        <el-card class="dark-card" shadow="never">
          <GroupMatchTable :matches="groupMatches" :loading="loading.matches" />
        </el-card>
      </el-tab-pane>

      <!-- 淘汰赛对阵图 -->
      <el-tab-pane label="淘汰赛对阵图" name="knockout">
        <el-card class="dark-card bracket-card" shadow="never">
          <KnockoutBracket :bracket-data="bracketStage" :loading="loading.matches" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { useMatchStore } from '@/stores/match'
import { http } from '@/api/request'
import KnockoutBracket from '@/components/bracket/KnockoutBracket.vue'
import GroupStandings from '@/components/bracket/GroupStandings.vue'
import GroupMatchTable from '@/components/bracket/GroupMatchTable.vue'

const matchStore = useMatchStore()

// 当前激活的 Tab
const activeTab = ref('standings')

// 加载状态
const loading = reactive({
  matches: false,
  standings: false,
})

// 小组赛比赛列表（用于赛程对战表）
const groupMatches = ref<any[]>([])
// 淘汰赛分组数据（用于对阵图）
const bracketStage = ref<any>(null)
// 小组积分榜数据
const standingsGroups = ref<Record<string, any[]>>({})

/** 加载小组积分榜 */
async function loadStandings() {
  loading.standings = true
  try {
    const res = await http.get<any>('/match/standings')
    if (res?.groups) {
      standingsGroups.value = res.groups
    }
  } catch {
    standingsGroups.value = {}
  } finally {
    loading.standings = false
  }
}

/** 加载赛事数据（小组赛 + 淘汰赛） */
async function loadMatches() {
  loading.matches = true
  try {
    // 加载全部赛事
    const allRes: any = await matchStore.fetchMatches({ pageSize: 200 })
    const allMatches = allRes?.list || []

    // 筛选小组赛比赛
    groupMatches.value = allMatches.filter((m: any) => {
      const gName = m.groupName || ''
      const stage = (m.stage || '').toLowerCase()
      return gName || stage.includes('group') || stage.includes('小组')
    })

    // 加载淘汰赛分组数据
    try {
      const bracketRes: any = await matchStore.fetchBracket()
      bracketStage.value = bracketRes?.bracketStage || null
    } catch {
      bracketStage.value = null
    }
  } catch {
    groupMatches.value = []
    bracketStage.value = null
  } finally {
    loading.matches = false
  }
}

/** Tab 切换时按需加载数据 */
watch(activeTab, (tab) => {
  if (tab === 'standings' && !Object.keys(standingsGroups.value).length) {
    loadStandings()
  }
  if ((tab === 'groupMatches' || tab === 'knockout') && !groupMatches.value.length && !bracketStage.value) {
    loadMatches()
  }
})

onMounted(() => {
  // 初始加载积分榜
  loadStandings()
  // 同时预加载赛事数据
  loadMatches()
})
</script>

<style scoped>
.match-data-center-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 16px 32px;
}

.page-header {
  padding: 16px 0 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
}

/* Tab 样式 */
.data-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.data-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 600;
}

.data-tabs :deep(.el-tabs__item.is-active) {
  font-weight: 700;
}

/* 深色卡片 */
.dark-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  border-color: rgba(148, 163, 184, 0.12);
  min-height: 400px;
}

.dark-card :deep(.el-card__body) {
  padding: 16px;
}

/* 对阵图卡片 */
.bracket-card {
  min-height: 520px;
}

.bracket-card :deep(.el-card__body) {
  padding: 0;
  overflow: auto;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  .bracket-card {
    min-height: auto;
  }
}
</style>
