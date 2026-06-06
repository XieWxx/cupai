<template>
  <div class="match-center-view">
    <h1>{{ $t('nav.matchCenter') }}</h1>

    <!-- 筛选栏 -->
    <el-row :gutter="16" class="filter-bar">
      <el-col :span="6">
        <el-select v-model="filters.status" :placeholder="$t('match.matchStatus')" clearable @change="loadMatches">
          <el-option :label="$t('match.upcoming')" value="upcoming" />
          <el-option :label="$t('match.live')" value="live" />
          <el-option :label="$t('match.finished')" value="finished" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="filters.stage" :placeholder="$t('match.stage')" clearable @change="loadMatches">
          <el-option :label="$t('match.groupStage')" value="group" />
          <el-option :label="$t('match.knockout')" value="knockout" />
          <el-option :label="$t('match.final')" value="final" />
        </el-select>
      </el-col>
    </el-row>

    <!-- 赛事列表 -->
    <el-table :data="matchStore.matches" v-loading="matchStore.loading" stripe>
      <el-table-column :label="$t('match.homeTeam')" min-width="150">
        <template #default="{ row }">
          <div class="team-cell">
            <span v-if="getFlagClass(row.homeTeam?.countryCode)" :class="getFlagClass(row.homeTeam?.countryCode)"></span>
            <span>{{ row.homeTeam?.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.vs')" width="80" align="center">
        <template #default="{ row }">
          <span v-if="row.status === 'finished'" class="score">{{ row.homeScore }} : {{ row.awayScore }}</span>
          <span v-else class="vs-text">{{ $t('common.vs') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('match.awayTeam')" min-width="150">
        <template #default="{ row }">
          <div class="team-cell">
            <span v-if="getFlagClass(row.awayTeam?.countryCode)" :class="getFlagClass(row.awayTeam?.countryCode)"></span>
            <span>{{ row.awayTeam?.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('match.matchStatus')" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'live' ? 'danger' : row.status === 'finished' ? 'info' : 'success'" size="small">
            {{ row.status === 'live' ? $t('match.live') : row.status === 'finished' ? $t('match.finished') : $t('match.upcoming') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('match.startTime')" width="180">
        <template #default="{ row }">
          {{ new Date(row.startTime).toLocaleString(i18nLocale) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" width="100" align="center">
        <template #default="{ row }">
          <el-button text type="primary" @click="$router.push(`/match/${row.id}`)">{{ $t('common.detail') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMatchStore } from '@/stores/match'
import { getFlagClass } from '@/utils/flag'

const { locale: i18nLocale } = useI18n()
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
