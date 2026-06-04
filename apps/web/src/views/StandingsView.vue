<template>
  <div class="standings-view">
    <h1>积分榜</h1>

    <!-- 小组选择 -->
    <el-row :gutter="16" class="filter-bar">
      <el-col :span="6">
        <el-select v-model="selectedGroup" placeholder="选择小组" clearable @change="loadStandings">
          <el-option v-for="g in groups" :key="g" :label="g + '组'" :value="g" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="loadAllStandings">查看全部小组</el-button>
      </el-col>
    </el-row>

    <!-- 积分表 -->
    <div v-for="(teams, group) in standings.groups" :key="group" class="group-section">
      <el-card>
        <template #header>
          <div class="group-header">
            <span class="group-name">{{ group }}组</span>
            <el-button text type="primary" size="small" @click="loadAdvance(group as string)">出线形势</el-button>
          </div>
        </template>
        <el-table :data="teams" stripe border size="small">
          <el-table-column label="排名" width="60" align="center">
            <template #default="{ $index }">
              <span :class="{ 'rank-top': $index < 2 }">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="球队" min-width="120">
            <template #default="{ row }">{{ row.team?.name || '未知' }}</template>
          </el-table-column>
          <el-table-column prop="played" label="赛" width="50" align="center" />
          <el-table-column prop="wins" label="胜" width="50" align="center" />
          <el-table-column prop="draws" label="平" width="50" align="center" />
          <el-table-column prop="losses" label="负" width="50" align="center" />
          <el-table-column prop="goalsFor" label="进" width="50" align="center" />
          <el-table-column prop="goalsAgainst" label="失" width="50" align="center" />
          <el-table-column prop="goalDifference" label="净胜" width="60" align="center">
            <template #default="{ row }">
              <span :style="{ color: row.goalDifference > 0 ? '#67c23a' : row.goalDifference < 0 ? '#f56c6c' : '#999' }">
                {{ row.goalDifference > 0 ? '+' : '' }}{{ row.goalDifference }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="points" label="积分" width="60" align="center">
            <template #default="{ row }">
              <strong>{{ row.points }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="出线概率" width="100" align="center">
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
    <el-dialog v-model="showAdvanceDialog" :title="advanceData.groupName + '组 出线形势'" width="600px">
      <div v-for="team in advanceData.teams" :key="team.teamId" class="advance-team">
        <div class="advance-rank">{{ team.rank }}</div>
        <div class="advance-info">
          <span class="advance-name">{{ team.teamName }}</span>
          <span class="advance-record">{{ team.wins }}胜 {{ team.draws }}平 {{ team.losses }}负</span>
        </div>
        <div class="advance-prob">
          <el-progress
            :percentage="team.advanceProbability"
            :stroke-width="12"
            :color="getProgressColor(team.advanceProbability)"
          />
        </div>
        <el-tag :type="team.status === '出线区' ? 'success' : team.status === '有望出线' ? 'warning' : 'danger'" size="small">
          {{ team.status }}
        </el-tag>
      </div>
    </el-dialog>

    <el-empty v-if="Object.keys(standings.groups).length === 0 && !loading" description="暂无积分数据" />
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
