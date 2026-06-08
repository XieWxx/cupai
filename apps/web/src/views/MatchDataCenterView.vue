<template>
  <div class="match-data-center-view">
    <!-- 页面标题区 -->
    <header class="page-header">
      <h1 class="page-title">{{ $t('matchCenter.title') }}</h1>
      <p class="page-subtitle">{{ $t('matchCenter.subtitle') }}</p>
    </header>

    <!-- Tab 切换：赛程 / 小组赛程 / 淘汰赛对阵图 -->
    <el-tabs v-model="activeTab" class="data-tabs">
      <!-- 小组积分榜（暂时隐藏，待数据完善后开放） -->

      <!-- 赛程（全部比赛，按日期分组） -->
      <el-tab-pane :label="t('matchCenter.schedule')" name="schedule">
        <el-card class="common-card" shadow="never">
          <MatchSchedule :matches="allMatches" :loading="loading.matches" />
        </el-card>
      </el-tab-pane>

      <!-- 小组赛程 -->
      <el-tab-pane :label="t('matchCenter.groupMatches')" name="groupMatches">
        <el-card class="common-card" shadow="never">
          <GroupMatchTable :matches="groupMatches" :loading="loading.matches" />
        </el-card>
      </el-tab-pane>

      <!-- 淘汰赛对阵图 -->
      <el-tab-pane :label="t('matchCenter.knockoutBracket')" name="knockout">
        <el-card class="common-card bracket-card" shadow="never">
          <KnockoutBracket :bracket-data="bracketStage" :loading="loading.matches" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMatchStore } from '@/stores/match'
import { http } from '@/api/request'
import KnockoutBracket from '@/components/bracket/KnockoutBracket.vue'
import GroupMatchTable from '@/components/bracket/GroupMatchTable.vue'
import MatchSchedule from '@/components/bracket/MatchSchedule.vue'
const { t } = useI18n()

const matchStore = useMatchStore()

// 当前激活的 Tab（默认展示赛程）
const activeTab = ref('schedule')

// 加载状态
const loading = reactive({
  matches: false,
  standings: false,
})

// 全部比赛列表（用于赛程 tab）
const allMatches = ref<any[]>([])
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
  } catch (err) {
    console.error('[loadStandings] failed:', err)
    standingsGroups.value = {}
  } finally {
    loading.standings = false
  }
}

/** 加载赛事数据（全部赛程 + 小组赛 + 淘汰赛） */
async function loadMatches() {
  loading.matches = true
  try {
    const allRes: any = await matchStore.fetchMatches({ pageSize: 200 })
    const allList = allRes?.list || []

    // 保存全部比赛（供赛程 tab 使用）
    allMatches.value = allList

    // 过滤小组赛（供小组赛 tab 使用）
    groupMatches.value = allList.filter((m: any) => {
      const gName = m.groupName || ''
      const stage = (m.stage || '').toLowerCase()
      return gName || stage.includes('group') || stage.includes('小组')
    })

    try {
      const bracketRes: any = await matchStore.fetchBracket()
      bracketStage.value = bracketRes?.bracketStage || null
    } catch (err) {
      console.error('[loadMatches.bracket] failed:', err)
      bracketStage.value = null
    }
  } catch (err) {
    console.error('[loadMatches] failed:', err)
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
  if ((tab === 'schedule' || tab === 'groupMatches' || tab === 'knockout') && !allMatches.value.length && !bracketStage.value) {
    loadMatches()
  }
})

onMounted(() => {
  loadStandings()
  loadMatches()
})
</script>

<style scoped>
.match-data-center-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-5);
}

.data-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--space-4);
}

.data-tabs :deep(.el-tabs__item) {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.data-tabs :deep(.el-tabs__item.is-active) {
  font-weight: var(--font-bold);
}

/* 对阵图卡片（适配 1/16 赛制 5 轮晋级图） */
.bracket-card {
  min-height: var(--space-10);
  overflow: visible;
}

.bracket-card :deep(.el-card__body) {
  padding: var(--space-6);
  overflow-x: auto;
  overflow-y: visible;
  background: var(--color-bg-elevated);
}

/* 响应式断点：中等屏幕 */
@media (max-width: 960px) {
  .bracket-card {
    min-height: auto;
  }
  .bracket-card :deep(.el-card__body) {
    padding: var(--space-4);
  }
}

/* 响应式断点：小屏幕 */
@media (max-width: 768px) {
  .bracket-card {
    min-height: auto;
  }
  .bracket-card :deep(.el-card__body) {
    padding: var(--space-3);
  }
  .page-header {
    margin-bottom: var(--space-3);
  }
}

/* 响应式断点：超小屏幕 */
@media (max-width: 480px) {
  .data-tabs :deep(.el-tabs__item) {
    font-size: var(--text-xs);
  }
  .bracket-card :deep(.el-card__body) {
    padding: var(--space-2);
  }
}
</style>
