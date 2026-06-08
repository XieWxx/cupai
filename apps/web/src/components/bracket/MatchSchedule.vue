<template>
  <div class="match-schedule">
    <!-- 加载态 -->
    <div v-if="loading" class="schedule-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t('common.loading') }}</span>
    </div>
    <!-- 空态 -->
    <div v-else-if="!hasData" class="schedule-empty">
      <el-empty :description="t('matchCenter.noScheduleData')" />
    </div>
    <!-- 赛程列表 -->
    <div v-else class="schedule-content">
      <!-- 筛选栏 -->
      <div class="schedule-filter">
        <el-radio-group v-model="statusFilter" size="small">
          <el-radio-button value="all">{{ t('matchCenter.allMatches') }}</el-radio-button>
          <el-radio-button value="upcoming">{{ t('matchCenter.upcoming') }}</el-radio-button>
          <el-radio-button value="live">{{ t('home.live') }}</el-radio-button>
          <el-radio-button value="finished">{{ t('matchCenter.finished') }}</el-radio-button>
        </el-radio-group>
      </div>
      <!-- 按日期分组的赛程 -->
      <div v-for="day in filteredDays" :key="day.date" class="day-block">
        <div class="day-header">
          <span class="day-date">{{ day.dateLabel }}</span>
          <span class="day-count">{{ day.matches.length }} {{ t('matchCenter.matchCount') }}</span>
        </div>
        <div class="day-matches">
          <div
            v-for="match in day.matches"
            :key="match.id"
            class="match-row"
            :class="match.status"
            @click="onMatchClick(match)"
          >
            <!-- 比赛信息行 -->
            <div class="match-info">
              <span class="match-time">{{ formatTime(match.startTime) }}</span>
              <span v-if="match.venue" class="match-venue">{{ match.venue }}</span>
              <span class="match-stage">{{ formatStage(match) }}</span>
            </div>
            <!-- 对阵行 -->
            <div class="match-versus">
              <div class="versus-team home" :class="{ 'is-winner': isHomeWinner(match) }">
                <span v-if="getFlagClass(match.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam.countryCode)} team-flag`"></span>
                <span class="team-name">{{ match.homeTeam?.name || t('bracket.tbd') }}</span>
              </div>
              <div class="versus-score">
                <span v-if="hasScore(match)" class="score-home" :class="{ 'is-winner': isHomeWinner(match) }">{{ match.homeScore }}</span>
                <span class="score-sep">:</span>
                <span v-if="hasScore(match)" class="score-away" :class="{ 'is-winner': isAwayWinner(match) }">{{ match.awayScore }}</span>
                <span v-else class="score-vs">VS</span>
              </div>
              <div class="versus-team away" :class="{ 'is-winner': isAwayWinner(match) }">
                <span class="team-name">{{ match.awayTeam?.name || t('bracket.tbd') }}</span>
                <span v-if="getFlagClass(match.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam.countryCode)} team-flag`"></span>
              </div>
            </div>
            <!-- 状态 -->
            <div class="match-status">
              <span v-if="match.status === 'live'" class="status-live">
                <span class="live-dot"></span>
                {{ match.currentMinute ? `${match.currentMinute}'` : t('home.live') }}
              </span>
              <span v-else-if="match.status === 'finished'" class="status-finished">{{ t('matchCenter.finished') }}</span>
              <span v-else class="status-upcoming">{{ t('matchCenter.upcoming') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getFlagClass } from '@/utils/flag'

const { t, locale } = useI18n()
const props = defineProps<{
  matches: any[]
  loading?: boolean
}>()

const router = useRouter()

/** 状态筛选 */
const statusFilter = ref('all')

const hasData = computed(() => Array.isArray(props.matches) && props.matches.length > 0)

/** 按日期分组的赛程数据 */
const filteredDays = computed(() => {
  let allMatches = props.matches || []

  // 按状态筛选
  if (statusFilter.value !== 'all') {
    allMatches = allMatches.filter((m: any) => m.status === statusFilter.value)
  }

  // 按开赛时间排序
  const sorted = [...allMatches].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // 按日期分组
  const dayMap = new Map<string, any[]>()
  for (const match of sorted) {
    const d = new Date(match.startTime)
    const dateKey = d.toLocaleDateString(locale.value, { year: 'numeric', month: '2-digit', day: '2-digit' })
    if (!dayMap.has(dateKey)) dayMap.set(dateKey, [])
    dayMap.get(dateKey)!.push(match)
  }

  return [...dayMap.entries()].map(([dateKey, matches]) => {
    const d = new Date(matches[0].startTime)
    return {
      date: dateKey,
      dateLabel: d.toLocaleDateString(locale.value, { month: 'long', day: 'numeric', weekday: 'short' }),
      matches,
    }
  })
})

/** 格式化比赛阶段 */
function formatStage(match: any): string {
  const stage = match.stage || ''
  const groupName = match.groupName || ''
  if (groupName) return groupName
  return stage
}

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

function formatTime(value: string | number | Date | undefined | null): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function onMatchClick(match: any) {
  if (match?.id) router.push(`/match/${match.id}`)
}
</script>

<style scoped>
.match-schedule {
  width: 100%;
}

.schedule-loading,
.schedule-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: #94a3b8;
  gap: 8px;
}

/* 筛选栏 */
.schedule-filter {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
}

/* 日期块 */
.day-block {
  margin-bottom: 16px;
}

.day-block:last-child {
  margin-bottom: 0;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--color-primary-bg);
  border-radius: 8px 8px 0 0;
  border: 1px solid var(--color-border-light);
  border-bottom: none;
}

.day-date {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
}

.day-count {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-text-tertiary);
}

/* 当日比赛列表 */
.day-matches {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: 0 0 8px 8px;
}

/* 比赛行 */
.match-row {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
}

.match-row:hover {
  background: var(--color-bg-muted);
  border-color: var(--color-primary);
}

.match-row.live {
  border-color: var(--color-danger);
  background: var(--color-danger-bg);
}

.match-row.finished {
  opacity: 0.85;
}

/* 比赛信息 */
.match-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.match-time {
  color: var(--color-text-primary);
  font-weight: 600;
}

.match-venue {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.match-stage {
  margin-left: auto;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--color-bg-muted);
  color: var(--color-text-tertiary);
  font-weight: 600;
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
  color: var(--color-text-primary);
  font-weight: 500;
}

.versus-team.away {
  justify-content: flex-end;
  text-align: right;
}

.versus-team.is-winner .team-name {
  color: var(--color-success);
  font-weight: 700;
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
  color: var(--color-text-secondary);
  min-width: 18px;
  text-align: center;
}

.score-home.is-winner,
.score-away.is-winner {
  color: var(--color-success);
}

.score-sep {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0 2px;
}

.score-vs {
  font-size: 12px;
  color: var(--color-text-secondary);
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
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-danger);
  animation: blink-dot 1.2s ease-in-out infinite;
}

@keyframes blink-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-finished {
  color: var(--color-text-tertiary);
  background: var(--color-bg-muted);
}

.status-upcoming {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

/* 响应式 */
@media (max-width: 768px) {
  .schedule-filter {
    overflow-x: auto;
  }
}
</style>
