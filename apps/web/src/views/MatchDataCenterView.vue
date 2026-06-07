<template>
  <div class="match-data-center-view">
    <!-- 页面标题区 -->
    <header class="page-header">
      <h1 class="page-title">{{ $t('matchCenter.title') }}</h1>
      <p class="page-subtitle">{{ $t('matchCenter.subtitle') }}</p>
    </header>

    <!-- Tab 切换：小组积分榜 / 小组赛程 / 淘汰赛对阵图 -->
    <el-tabs v-model="activeTab" class="data-tabs">
      <!-- 小组积分榜 -->
      <el-tab-pane :label="t('matchCenter.groupStandings')" name="standings">
        <el-card class="common-card" shadow="never">
          <GroupStandings :groups="standingsGroups" :loading="loading.standings" />
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
import GroupStandings from '@/components/bracket/GroupStandings.vue'
import GroupMatchTable from '@/components/bracket/GroupMatchTable.vue'
const { t } = useI18n()

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
  } catch (err) {
    console.error('[loadStandings] failed:', err)
    standingsGroups.value = {}
  } finally {
    loading.standings = false
  }
}

/** 加载赛事数据（小组赛 + 淘汰赛） */
async function loadMatches() {
  loading.matches = true
  try {
    const allRes: any = await matchStore.fetchMatches({ pageSize: 200 })
    const allMatches = allRes?.list || []

    groupMatches.value = allMatches.filter((m: any) => {
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
  if ((tab === 'groupMatches' || tab === 'knockout') && !groupMatches.value.length && !bracketStage.value) {
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

/* 对阵图卡片 */
.bracket-card {
  min-height: var(--space-10);
}

.bracket-card :deep(.el-card__body) {
  padding: var(--space-6);
  overflow: auto;
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
