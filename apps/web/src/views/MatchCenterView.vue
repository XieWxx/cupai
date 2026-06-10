<template>
  <div class="match-center-view">
    <header class="page-header">
      <h1 class="page-title">{{ $t('nav.matchCenter') }}</h1>
    </header>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="8">
          <el-select v-model="filters.status" :placeholder="$t('match.matchStatus')" clearable @change="loadMatches">
            <el-option :label="$t('match.upcoming')" value="upcoming" />
            <el-option :label="$t('match.live')" value="live" />
            <el-option :label="$t('match.finished')" value="finished" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-select v-model="filters.stage" :placeholder="$t('match.stage')" clearable @change="loadMatches">
            <el-option :label="$t('match.groupStage')" value="group" />
            <el-option :label="$t('match.knockout')" value="knockout" />
            <el-option :label="$t('match.final')" value="final" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="filter-actions">
            <el-button type="primary" @click="loadMatches">{{ $t('common.search') }}</el-button>
            <el-button @click="filters.status = ''; filters.stage = ''; loadMatches()">{{ $t('common.reset') }}</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 赛事列表 -->
    <el-card class="common-card">
      <el-table :data="matchStore.matches" v-loading="matchStore.loading" stripe>
        <el-table-column :label="$t('match.homeTeam')" min-width="150">
          <template #default="{ row }">
            <div class="team-cell">
              <img v-if="getTeamLogoUrl(row.homeTeam?.bsTeamId)" :src="getTeamLogoUrl(row.homeTeam?.bsTeamId, { bg: 'transparent' })" class="team-logo-sm" alt="" />
              <span v-if="getFlagClass(row.homeTeam?.countryCode)" :class="getFlagClass(row.homeTeam?.countryCode)"></span>
              <span>{{ getTeamName(row.homeTeam) }}</span>
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
              <img v-if="getTeamLogoUrl(row.awayTeam?.bsTeamId)" :src="getTeamLogoUrl(row.awayTeam?.bsTeamId, { bg: 'transparent' })" class="team-logo-sm" alt="" />
              <span v-if="getFlagClass(row.awayTeam?.countryCode)" :class="getFlagClass(row.awayTeam?.countryCode)"></span>
              <span>{{ getTeamName(row.awayTeam) }}</span>
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMatchStore } from '@/stores/match'
import { getFlagClass } from '@/utils/flag'
import { useTeamName } from '@/composables/useTeamName'
import { getTeamLogoUrl } from '@/utils/bsdImages'

const { locale: i18nLocale } = useI18n()
const matchStore = useMatchStore()
const { getTeamName } = useTeamName()

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
.match-center-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* .page-header 使用全局定义 */
/* .filter-bar 使用全局定义（padding/background/border/radius 已在 index.css 中定义） */

.filter-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.team-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* 国旗图标对齐全局 .team-flag 样式 */
.team-cell span[class*="fi"] {
  width: 22px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
  display: inline-block;
}

.team-logo-sm {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}

.score {
  font-weight: var(--font-bold);
  font-size: var(--text-base);
  color: var(--color-danger);
}

.vs-text {
  color: var(--color-text-tertiary);
  font-weight: var(--font-semibold);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .filter-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .filter-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
