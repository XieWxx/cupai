<template>
  <div class="group-match-table">
    <div v-if="loading" class="match-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-else-if="!hasData" class="match-empty">
      <el-empty description="暂无小组赛程数据" />
    </div>
    <div v-else class="groups-grid">
      <div v-for="group in groupSections" :key="group.name" class="group-block">
        <div class="group-title">
          <span class="group-badge">{{ group.name }}</span>
          <span class="group-label">组赛程</span>
          <span class="group-count">{{ group.matches.length }} 场</span>
        </div>
        <div class="match-list">
          <div
            v-for="match in group.matches"
            :key="match.id"
            class="match-row"
            :class="match.status"
            @click="onMatchClick(match)"
          >
            <!-- 比赛信息行 -->
            <div class="match-info">
              <span class="match-date">{{ formatDate(match.startTime) }}</span>
              <span class="match-time">{{ formatTime(match.startTime) }}</span>
              <span v-if="match.venue" class="match-venue">{{ match.venue }}</span>
            </div>
            <!-- 对阵行 -->
            <div class="match-versus">
              <div class="versus-team home" :class="{ 'is-winner': isHomeWinner(match) }">
                <span v-if="getFlagClass(match.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam.countryCode)} team-flag`"></span>
                <span class="team-name">{{ match.homeTeam?.name || 'TBD' }}</span>
              </div>
              <div class="versus-score">
                <span v-if="hasScore(match)" class="score-home" :class="{ 'is-winner': isHomeWinner(match) }">{{ match.homeScore }}</span>
                <span class="score-sep">:</span>
                <span v-if="hasScore(match)" class="score-away" :class="{ 'is-winner': isAwayWinner(match) }">{{ match.awayScore }}</span>
                <span v-else class="score-vs">VS</span>
              </div>
              <div class="versus-team away" :class="{ 'is-winner': isAwayWinner(match) }">
                <span class="team-name">{{ match.awayTeam?.name || 'TBD' }}</span>
                <span v-if="getFlagClass(match.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam.countryCode)} team-flag`"></span>
              </div>
            </div>
            <!-- 状态 -->
            <div class="match-status">
              <span v-if="match.status === 'live'" class="status-live">
                <span class="live-dot"></span> 进行中
              </span>
              <span v-else-if="match.status === 'finished'" class="status-finished">已结束</span>
              <span v-else class="status-upcoming">未开始</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getFlagClass } from '@/utils/flag'

const props = defineProps<{
  matches: any[]
  loading?: boolean
}>()

const router = useRouter()

const hasData = computed(() => Array.isArray(props.matches) && props.matches.length > 0)

/** 提取分组名 */
function extractGroupName(match: any): string {
  if (match.groupName) {
    const m = match.groupName.match(/(?:Group\s*)?([A-Za-z0-9]+)/i)
    return m ? m[1].toUpperCase() : match.groupName
  }
  if (match.stage) {
    const m = match.stage.match(/([A-Za-z])组$/)
    if (m) return m[1].toUpperCase()
  }
  return ''
}

/** 按小组分组 */
const groupSections = computed(() => {
  const allMatches = props.matches || []
  const groupMap = new Map<string, any[]>()
  for (const match of allMatches) {
    const gName = extractGroupName(match)
    if (!gName) continue
    if (!groupMap.has(gName)) groupMap.set(gName, [])
    groupMap.get(gName)!.push(match)
  }
  const sorted = [...groupMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  return sorted.map(([name, matches]) => ({
    name,
    matches: matches.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
  }))
})

function isHomeWinner(m: any): boolean {
  if (!m || m.homeScore == null || m.awayScore == null || m.status !== 'finished') return false
  return Number(m.homeScore) > Number(m.awayScore)
}

function isAwayWinner(m: any): boolean {
  if (!m || m.homeScore == null || m.awayScore == null || m.status !== 'finished') return false
  return Number(m.awayScore) > Number(m.homeScore)
}

function hasScore(m: any): boolean {
  return m?.homeScore != null && m?.awayScore != null
}

function formatDate(value: string | number | Date | undefined | null): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  } catch { return '' }
}

function formatTime(value: string | number | Date | undefined | null): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function onMatchClick(match: any) {
  if (match?.id) router.push(`/match/${match.id}`)
}
</script>

<style scoped>
.group-match-table {
  width: 100%;
}

.match-loading,
.match-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: #94a3b8;
  gap: 8px;
}

/* 小组网格 */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

/* 小组块 */
.group-block {
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

.group-count {
  margin-left: auto;
  font-size: 11px;
  color: #475569;
}

/* 比赛列表 */
.match-list {
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 比赛行 */
.match-row {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid transparent;
}

.match-row:hover {
  background: rgba(56, 189, 248, 0.04);
  border-color: rgba(56, 189, 248, 0.15);
}

.match-row.live {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.04);
}

.match-row.finished {
  opacity: 0.85;
}

/* 比赛信息 */
.match-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 11px;
  color: #64748b;
}

.match-time {
  color: #94a3b8;
  font-weight: 600;
}

.match-venue {
  margin-left: auto;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 对阵 */
.match-versus {
  display: flex;
  align-items: center;
  gap: 8px;
}

.versus-team {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
}

.versus-team.away {
  justify-content: flex-end;
  text-align: right;
}

.versus-team.is-winner .team-name {
  color: #4ade80;
  font-weight: 700;
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
}

/* 比分 */
.versus-score {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 52px;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}

.score-home,
.score-away {
  font-size: 16px;
  font-weight: 700;
  color: #94a3b8;
  min-width: 18px;
  text-align: center;
}

.score-home.is-winner,
.score-away.is-winner {
  color: #4ade80;
}

.score-sep {
  color: #475569;
  font-size: 14px;
  margin: 0 2px;
}

.score-vs {
  font-size: 12px;
  color: #475569;
  font-weight: 700;
  letter-spacing: 1px;
}

/* 状态 */
.match-status {
  margin-top: 4px;
  display: flex;
  align-items: center;
}

.status-live,
.status-finished,
.status-upcoming {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
}

.status-live {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ef4444;
  animation: blink-dot 1.2s ease-in-out infinite;
}

@keyframes blink-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-finished {
  color: #64748b;
  background: rgba(100, 116, 139, 0.1);
}

.status-upcoming {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
}

/* 响应式 */
@media (max-width: 768px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>
