<template>
  <div class="match-center-view">
    <h1>{{ $t('nav.matchCenter') }}</h1>

    <!-- 筛选栏 -->
    <el-row :gutter="16" class="filter-bar">
      <el-col :span="6">
        <el-select v-model="filters.status" :placeholder="$t('match.matchStatus') || '赛事状态'" clearable @change="loadMatches">
          <el-option label="未开赛" value="upcoming" />
          <el-option label="进行中" value="live" />
          <el-option label="已完赛" value="finished" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="filters.stage" placeholder="赛事阶段" clearable @change="loadMatches">
          <el-option label="小组赛" value="group" />
          <el-option label="淘汰赛" value="knockout" />
          <el-option label="决赛" value="final" />
        </el-select>
      </el-col>
    </el-row>

    <!-- 赛事列表 -->
    <el-table :data="matchStore.matches" v-loading="matchStore.loading" stripe>
      <el-table-column :label="$t('match.homeTeam') || '主队'" min-width="150">
        <template #default="{ row }">
          <div class="team-cell">
            <span :class="`fi fi-${row.homeTeam?.countryCode?.toLowerCase()}`"></span>
            <span>{{ row.homeTeam?.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="VS" width="80" align="center">
        <template #default="{ row }">
          <span v-if="row.status === 'finished'" class="score">{{ row.homeScore }} : {{ row.awayScore }}</span>
          <span v-else class="vs-text">VS</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('match.awayTeam') || '客队'" min-width="150">
        <template #default="{ row }">
          <div class="team-cell">
            <span :class="`fi fi-${row.awayTeam?.countryCode?.toLowerCase()}`"></span>
            <span>{{ row.awayTeam?.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('match.matchStatus') || '状态'" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'live' ? 'danger' : row.status === 'finished' ? 'info' : 'success'" size="small">
            {{ row.status === 'live' ? '进行中' : row.status === 'finished' ? '已完赛' : '未开赛' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开赛时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.startTime).toLocaleString('zh-CN') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button text type="primary" @click="$router.push(`/match/${row.id}`)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useMatchStore } from '@/stores/match'

const matchStore = useMatchStore()

const filters = reactive({
  status: '',
  stage: '',
})

async function loadMatches() {
  await matchStore.fetchMatches({
    status: filters.status || undefined,
    stage: filters.stage || undefined,
  })
}

onMounted(() => {
  loadMatches()
})
</script>

<style scoped>
.match-center-view h1 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.filter-bar {
  margin-bottom: 20px;
}

.team-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score {
  font-weight: 700;
  font-size: 16px;
  color: #e94560;
}

.vs-text {
  color: #999;
  font-weight: 600;
}
</style>
