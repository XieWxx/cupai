<template>
  <div class="standings-view">
    <h1>{{ $t('standings.title') }}</h1>

    <!-- 小组选择 -->
    <el-row :gutter="16" class="filter-bar">
      <el-col :span="6">
        <el-select v-model="selectedGroup" :placeholder="$t('standings.selectGroup')" clearable @change="loadStandings">
          <el-option v-for="g in groups" :key="g" :label="g + $t('standings.group')" :value="g" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="loadAllStandings">{{ $t('standings.viewAllGroups') }}</el-button>
      </el-col>
    </el-row>

    <!-- 积分表 -->
    <div v-for="(teams, group) in standings.groups" :key="group" class="group-section">
      <el-card>
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
              <span :style="{ color: row.goalDifference > 0 ? '#67c23a' : row.goalDifference < 0 ? '#f56c6c' : '#999' }">
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
        <el-tag :type="getAdvanceTagType(team.advanceProbability)" size="small">
          {{ team.status }}
        </el-tag>
      </div>
    </el-dialog>

    <el-empty v-if="Object.keys(standings.groups).length === 0 && !loading" :description="$t('standings.noData')" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { http } from '@/api/request'

const loading = ref(false)
const selectedGroup = ref('')
const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const standings = reactive<{ groups: Record<string, any[]> }>({ groups: {} })
const showAdvanceDialog = ref(false)
const advanceData = reactive<{ groupName: string; teams: any[] }>({ groupName: '', teams: [] })

async function loadStandings(group: string) {
  if (!group) return loadAllStandings()
  loading.value = true
  try {
    const res = await http.get<any>(`/match/standings/${group}`)
    if (res?.groups) {
      standings.groups = res.groups
    }
  } catch {
    // 后端未启动
  } finally {
    loading.value = false
  }
}

async function loadAllStandings() {
  loading.value = true
  try {
    const res = await http.get<any>('/match/standings')
    if (res?.groups) {
      standings.groups = res.groups
    }
  } catch {
    // 后端未启动
  } finally {
    loading.value = false
  }
}

async function loadAdvance(group: string) {
  try {
    const res = await http.get<any>(`/match/advance/${group}`)
    if (res) {
      advanceData.groupName = res.groupName || group
      advanceData.teams = res.teams || []
      showAdvanceDialog.value = true
    }
  } catch {
    // 后端未启动
  }
}

function getProgressColor(percentage: number): string {
  if (percentage >= 70) return '#67c23a'
  if (percentage >= 40) return '#e6a23c'
  return '#f56c6c'
}

// 根据出线概率确定标签类型（避免依赖翻译文本比较）
function getAdvanceTagType(probability: number): 'success' | 'warning' | 'danger' {
  if (probability >= 70) return 'success'
  if (probability >= 30) return 'warning'
  return 'danger'
}

onMounted(() => {
  loadAllStandings()
})
</script>

<style scoped>
.standings-view h1 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.filter-bar {
  margin-bottom: 20px;
}

.group-section {
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-name {
  font-size: 16px;
  font-weight: 700;
}

.rank-top {
  color: #67c23a;
  font-weight: 700;
}

.advance-team {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.advance-team:last-child {
  border-bottom: none;
}

.advance-rank {
  width: 24px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
}

.advance-info {
  min-width: 120px;
}

.advance-name {
  display: block;
  font-weight: 600;
}

.advance-record {
  font-size: 12px;
  color: #999;
}

.advance-prob {
  flex: 1;
}
</style>
