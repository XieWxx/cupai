<template>
  <div class="group-standings">
    <div v-if="loading" class="standings-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t('common.loading') }}</span>
    </div>
    <div v-else-if="!hasData" class="standings-empty">
      <el-empty :description="t('matchCenter.noGroupStandings')" />
    </div>
    <div v-else class="standings-grid">
      <div v-for="(teams, groupName) in groups" :key="groupName" class="group-card">
        <div class="group-title">
          <span class="group-badge">{{ groupName }}</span>
          <span class="group-label">{{ t('matchCenter.groupLabel') }}</span>
        </div>
        <table class="standings-table">
          <thead>
            <tr>
              <th class="col-rank">#</th>
              <th class="col-team">{{ t('matchCenter.team') }}</th>
              <th class="col-stat">{{ t('matchCenter.played') }}</th>
              <th class="col-stat">{{ t('matchCenter.wins') }}</th>
              <th class="col-stat">{{ t('matchCenter.draws') }}</th>
              <th class="col-stat">{{ t('matchCenter.losses') }}</th>
              <th class="col-stat">{{ t('matchCenter.goalsFor') }}</th>
              <th class="col-stat">{{ t('matchCenter.goalsAgainst') }}</th>
              <th class="col-stat">{{ t('matchCenter.goalDifference') }}</th>
              <th class="col-pts">{{ t('matchCenter.points') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(team, idx) in teams"
              :key="team.id || idx"
              :class="{ 'row-advance': idx < 2 }"
            >
              <td class="col-rank">
                <span class="rank-num" :class="{ 'rank-top': idx < 2 }">{{ idx + 1 }}</span>
              </td>
              <td class="col-team">
                <span v-if="getFlagClass(team.team?.countryCode)" :class="`${getFlagClass(team.team.countryCode)} team-flag`"></span>
                <span class="team-name">{{ getTeamName(team.team) || t('matchCenter.unknown') }}</span>
              </td>
              <td class="col-stat">{{ team.played || 0 }}</td>
              <td class="col-stat">{{ team.wins || 0 }}</td>
              <td class="col-stat">{{ team.draws || 0 }}</td>
              <td class="col-stat">{{ team.losses || 0 }}</td>
              <td class="col-stat">{{ team.goalsFor || 0 }}</td>
              <td class="col-stat">{{ team.goalsAgainst || 0 }}</td>
              <td class="col-stat">
                <span :class="gdClass(team.goalDifference)">
                  {{ team.goalDifference > 0 ? '+' : '' }}{{ team.goalDifference || 0 }}
                </span>
              </td>
              <td class="col-pts">
                <span class="pts-value">{{ team.points || 0 }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading } from '@element-plus/icons-vue'
import { getFlagClass } from '@/utils/flag'
import { useTeamName } from '@/composables/useTeamName'

const { t } = useI18n()
const { getTeamName } = useTeamName()
const props = defineProps<{
  groups: Record<string, any[]>
  loading?: boolean
}>()

const hasData = computed(() => props.groups && Object.keys(props.groups).length > 0)

/** 净胜球样式 */
function gdClass(gd: number): string {
  if (gd > 0) return 'gd-positive'
  if (gd < 0) return 'gd-negative'
  return 'gd-zero'
}
</script>

<style scoped>
.group-standings {
  width: 100%;
}

.standings-loading,
.standings-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: var(--color-text-tertiary);
  gap: 8px;
}

/* 小组网格：铺满容器 */
.standings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 480px), 1fr));
  gap: 16px;
}

/* 小组卡片 */
.group-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--color-primary-bg);
  border-bottom: 1px solid var(--color-border-light);
}

.group-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: var(--color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.group-label {
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 600;
}

/* 积分表格：铺满卡片宽度 */
.standings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--color-text-primary);
  table-layout: auto;
}

.standings-table thead th {
  padding: 8px 6px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 11px;
  border-bottom: 1px solid var(--color-border-light);
  white-space: nowrap;
}

.standings-table tbody td {
  padding: 7px 6px;
  text-align: center;
  border-bottom: 1px solid var(--color-border-lighter);
}

.standings-table tbody tr:hover {
  background: var(--color-bg-muted);
}

/* 出线区行高亮 */
.standings-table tbody tr.row-advance {
  background: rgba(34, 197, 94, 0.06);
}

.standings-table tbody tr.row-advance:hover {
  background: rgba(34, 197, 94, 0.1);
}

/* 列宽 */
.col-rank {
  width: 36px;
  white-space: nowrap;
}

.col-team {
  text-align: left !important;
  /* 球队名列自适应宽度，不设固定宽度 */
}

.col-stat {
  width: 42px;
  white-space: nowrap;
}

.col-pts {
  width: 50px;
  white-space: nowrap;
}

/* 排名 */
.rank-num {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.rank-top {
  color: var(--color-success);
  font-weight: 700;
}

/* 球队名 */
.col-team {
  display: flex;
  align-items: center;
  gap: 6px;
}

.team-flag {
  width: 18px;
  height: 13px;
  border-radius: 2px;
  flex-shrink: 0;
}

.team-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: var(--color-text-primary);
  max-width: 200px;
}

/* 净胜球 */
.gd-positive {
  color: var(--color-success);
  font-weight: 600;
}

.gd-negative {
  color: var(--color-danger);
  font-weight: 600;
}

.gd-zero {
  color: var(--color-text-tertiary);
}

/* 积分 */
.pts-value {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-warning);
}

/* 响应式 */
@media (max-width: 768px) {
  .standings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
