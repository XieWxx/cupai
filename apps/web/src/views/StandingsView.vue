<template>
  <div class="standings-view">
    <header class="page-header">
      <h1 class="page-title">{{ $t('standings.title') }}</h1>
    </header>

    <!-- 小组选择 -->
    <div class="filter-bar">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-select v-model="selectedGroup" :placeholder="$t('standings.selectGroup')" clearable @change="loadStandings">
            <el-option v-for="g in groups" :key="g" :label="g + $t('standings.group')" :value="g" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="loadAllStandings">{{ $t('standings.viewAllGroups') }}</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 积分表 -->
    <div v-for="(teams, group) in standings.groups" :key="group" class="group-section">
      <el-card class="common-card">
        <template #header>
          <div class="group-header">
            <span class="group-name">{{ group }}{{ $t('standings.group') }}</span>
            <el-button text type="primary" size="small" @click="loadAdvance(group as string)">{{ $t('standings.advanceAnalysis') }}</el-button>
          </div>
        </template>
        <el-table :data="teams" stripe border size="small">
          <el-table-column :label="$t('standings.rank')" width="60" align="center">
            <template #default="{ $index }">
              <span :class="{ 'rank-top': $index < 2 }">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('standings.team')" min-width="120">
            <template #default="{ row }">{{ row.team?.name || $t('standings.unknown') }}</template>
          </el-table-column>
          <el-table-column prop="played" :label="$t('standings.played')" width="50" align="center" />
          <el-table-column prop="wins" :label="$t('standings.won')" width="50" align="center" />
          <el-table-column prop="draws" :label="$t('standings.drawn')" width="50" align="center" />
          <el-table-column prop="losses" :label="$t('standings.lost')" width="50" align="center" />
          <el-table-column prop="goalsFor" :label="$t('standings.goalsFor')" width="50" align="center" />
          <el-table-column prop="goalsAgainst" :label="$t('standings.goalsAgainst')" width="50" align="center" />
          <el-table-column prop="goalDifference" :label="$t('standings.goalDifference')" width="60" align="center">
            <template #default="{ row }">
              <span :style="{ color: row.goalDifference > 0 ? 'var(--color-success)' : row.goalDifference < 0 ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }">
                {{ row.goalDifference > 0 ? '+' : '' }}{{ row.goalDifference }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="points" :label="$t('standings.points')" width="60" align="center">
            <template #default="{ row }">
              <strong>{{ row.points }}</strong>
            </template>
          </el-table-column>
          <el-table-column :label="$t('standings.advanceProbability')" width="100" align="center">
            <template #default="{ row }">
              <el-progress
                v-if="row.advanceProbability"
                :percentage="Number(row.advanceProbability) || 0"
                :stroke-width="8"
                :color="getProgressColor(Number(row.advanceProbability) || 0)"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 出线形势弹窗 -->
    <el-dialog v-model="showAdvanceDialog" :title="advanceData.groupName + $t('standings.group') + ' ' + $t('standings.advanceAnalysis')" width="600px">
      <div v-for="team in advanceData.teams" :key="team.teamId" class="advance-team">
        <div class="advance-rank">{{ team.rank }}</div>
        <div class="advance-info">
          <span class="advance-name">{{ team.teamName }}</span>
          <span class="advance-record">{{ team.wins }}{{ $t('standings.won') }} {{ team.draws }}{{ $t('standings.drawn') }} {{ team.losses }}{{ $t('standings.lost') }}</span>
        </div>
        <div class="advance-prob">
          <el-progress
            :percentage="team.advanceProbability"
            :stroke-width="12"
            :color="getProgressColor(team.advanceProbability)"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { http } from '@/api/request'

const selectedGroup = ref('')
const showAdvanceDialog = ref(false)
const groups = ref<string[]>([])
const standings = reactive({ groups: {} as Record<string, any[]> })
const advanceData = reactive({ groupName: '', teams: [] as any[] })

function getProgressColor(pct: number): string {
  if (pct >= 80) return 'var(--color-success)'
  if (pct >= 50) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

async function loadStandings() {
  try {
    const res: any = await http.get('/match/standings')
    if (selectedGroup.value) {
      standings.groups = { [selectedGroup.value]: res.groups?.[selectedGroup.value] || [] }
    } else {
      standings.groups = res.groups || {}
    }
  } catch (err) {
    console.error('[loadStandings] failed:', err)
    standings.groups = {}
  }
}

async function loadAllStandings() {
  selectedGroup.value = ''
  await loadStandings()
}

async function loadAdvance(group: string) {
  try {
    // 后端实际返回 { groupName, teams, analysis? }，非文档中的 scenarios/currentStandings
    const res: any = await http.get(`/match/advance/${group}`)
    advanceData.groupName = group
    advanceData.teams = res?.teams || []
    showAdvanceDialog.value = true
  } catch (err) {
    console.error('[loadAdvance] failed:', err)
  }
}

onMounted(async () => {
  try {
    const res: any = await http.get('/match/standings')
    groups.value = Object.keys(res.groups || {})
    standings.groups = res.groups || {}
  } catch (err) {
    console.error('[StandingsView.onMounted] failed:', err)
  }
})
</script>

<style scoped>
.standings-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* .page-header 使用全局样式，已删除重复属性 */
/* .filter-bar 使用全局样式，已删除重复属性 */

.group-section {
  margin-bottom: var(--space-6);
}

/* .group-header 使用全局 .card-header 样式，已删除重复属性 */

.group-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.rank-top {
  font-weight: var(--font-bold);
  color: var(--color-warning);
}

.advance-team {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.advance-team:last-child {
  border-bottom: none;
}

.advance-rank {
  width: var(--space-7);
  height: var(--space-7);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-muted);
  border-radius: 50%;
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.advance-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.advance-name {
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.advance-record {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.advance-prob {
  width: 120px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .standings-view {
    padding: 0 var(--space-3);
  }

  .advance-team {
    flex-wrap: wrap;
  }

  .advance-prob {
    width: 100%;
    margin-top: var(--space-2);
  }
}

@media (max-width: 480px) {
  .standings-view {
    padding: 0 var(--space-2);
  }

  .group-name {
    font-size: var(--text-sm);
  }

  .advance-prob {
    width: 100%;
  }
}
</style>
