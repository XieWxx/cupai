<template>
  <div class="group-standings">
    <div v-if="loading" class="standings-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-else-if="!hasData" class="standings-empty">
      <el-empty description="暂无积分榜数据" />
    </div>
    <div v-else class="standings-grid">
      <div v-for="(teams, groupName) in groups" :key="groupName" class="group-card">
        <div class="group-title">
          <span class="group-badge">{{ groupName }}</span>
          <span class="group-label">组</span>
        </div>
        <table class="standings-table">
          <thead>
            <tr>
              <th class="col-rank">#</th>
              <th class="col-team">球队</th>
              <th class="col-stat">场</th>
              <th class="col-stat">胜</th>
              <th class="col-stat">平</th>
              <th class="col-stat">负</th>
              <th class="col-stat">进</th>
              <th class="col-stat">失</th>
              <th class="col-stat">净胜球</th>
              <th class="col-pts">积分</th>
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
                <span class="team-name">{{ team.team?.name || '未知' }}</span>
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
import { Loading } from '@element-plus/icons-vue'
import { getFlagClass } from '@/utils/flag'

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
  color: #94a3b8;
  gap: 8px;
}

/* 小组网格 */
.standings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

/* 小组卡片 */
.group-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(56, 189, 248, 0.06);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.group-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 13px;
  font-weight: 700;
}

.group-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
}

/* 积分表格 */
.standings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: #cbd5e1;
}

.standings-table thead th {
  padding: 8px 6px;
  text-align: center;
  font-weight: 600;
  color: #64748b;
  font-size: 11px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  white-space: nowrap;
}

.standings-table tbody td {
  padding: 7px 6px;
  text-align: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.04);
}

.standings-table tbody tr:hover {
  background: rgba(56, 189, 248, 0.04);
}

/* 出线区行高亮 */
.standings-table tbody tr.row-advance {
  background: rgba(34, 197, 94, 0.04);
}

.standings-table tbody tr.row-advance:hover {
  background: rgba(34, 197, 94, 0.08);
}

/* 列宽 */
.col-rank {
  width: 32px;
}

.col-team {
  text-align: left !important;
  min-width: 100px;
}

.col-stat {
  width: 36px;
}

.col-pts {
  width: 44px;
}

/* 排名 */
.rank-num {
  font-weight: 600;
  color: #64748b;
}

.rank-top {
  color: #4ade80;
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
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.team-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* 净胜球 */
.gd-positive {
  color: #4ade80;
  font-weight: 600;
}

.gd-negative {
  color: #f87171;
  font-weight: 600;
}

.gd-zero {
  color: #64748b;
}

/* 积分 */
.pts-value {
  font-weight: 700;
  font-size: 14px;
  color: #fbbf24;
}

/* 响应式 */
@media (max-width: 768px) {
  .standings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
