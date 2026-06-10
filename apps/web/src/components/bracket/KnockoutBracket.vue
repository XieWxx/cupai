<template>
  <div class="knockout-bracket">
    <!-- 加载态 -->
    <div v-if="loading" class="bracket-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ $t('common.loading') }}</span>
    </div>
    <!-- 空态 -->
    <div v-else-if="!hasData" class="bracket-empty">
      <el-empty :description="$t('bracket.noData')" />
    </div>
    <!-- 对阵图主体 -->
    <div v-else class="bracket-tree">
      <!-- 左半区 -->
      <div class="bracket-half bracket-left">
        <div class="round-column" v-for="round in leftRounds" :key="round.key">
          <div class="round-label">{{ round.label }}</div>
          <div class="round-matches">
            <div
              v-for="(match, idx) in round.matches"
              :key="match?.id || idx"
              class="bracket-match"
              :class="matchStatusClass(match)"
              @click="onMatchClick(match)"
            >
              <!-- 直播状态条 -->
              <div class="match-status-bar" v-if="match?.status === 'live'">
                <span class="live-dot"></span>
                <span class="match-minute">{{ match.currentMinute ? `${match.currentMinute}'` : 'LIVE' }}</span>
              </div>
              <!-- 主队 -->
              <div class="match-team" :class="{ 'is-winner': isWinner(match, 'home') }">
                <img v-if="getTeamLogoUrl(getTeamInfo(match, 'home')?.bsTeamId)" :src="getTeamLogoUrl(getTeamInfo(match, 'home')?.bsTeamId, { bg: 'transparent' })" class="team-logo-xs" alt="" />
                <span v-if="getFlagClass(getTeamInfo(match, 'home')?.countryCode)" :class="`${getFlagClass(getTeamInfo(match, 'home').countryCode)} team-flag`"></span>
                <span class="team-name" :class="{ 'is-placeholder': isPlaceholderTeam(match, 'home'), 'is-pending': match?.homeTeamConfirmed === false }">{{ getTeamName(getTeamInfo(match, 'home')) || $t('bracket.tbd') }}</span>
                <span v-if="match?.homeTeamPlaceholder" class="team-placeholder">{{ match.homeTeamPlaceholder }}</span>
                <span v-if="match?.homeTeamConfirmed === false" class="team-pending">{{ $t('bracket.pending') }}</span>
                <span v-if="hasScore(match)" class="team-score">{{ match.homeScore }}</span>
              </div>
              <!-- 客队 -->
              <div class="match-team" :class="{ 'is-winner': isWinner(match, 'away') }">
                <img v-if="getTeamLogoUrl(getTeamInfo(match, 'away')?.bsTeamId)" :src="getTeamLogoUrl(getTeamInfo(match, 'away')?.bsTeamId, { bg: 'transparent' })" class="team-logo-xs" alt="" />
                <span v-if="getFlagClass(getTeamInfo(match, 'away')?.countryCode)" :class="`${getFlagClass(getTeamInfo(match, 'away').countryCode)} team-flag`"></span>
                <span class="team-name" :class="{ 'is-placeholder': isPlaceholderTeam(match, 'away'), 'is-pending': match?.awayTeamConfirmed === false }">{{ getTeamName(getTeamInfo(match, 'away')) || $t('bracket.tbd') }}</span>
                <span v-if="match?.awayTeamPlaceholder" class="team-placeholder">{{ match.awayTeamPlaceholder }}</span>
                <span v-if="match?.awayTeamConfirmed === false" class="team-pending">{{ $t('bracket.pending') }}</span>
                <span v-if="hasScore(match)" class="team-score">{{ match.awayScore }}</span>
              </div>
              <!-- 开赛时间 -->
              <div class="match-time" v-if="match?.startTime && match.status === 'upcoming'">
                {{ formatMatchTime(match.startTime) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 决赛 -->
      <div class="bracket-center">
        <div class="round-label final-label">{{ $t('bracket.final') }}</div>
        <div
          v-for="match in finalMatch"
          :key="match?.id || 'final'"
          class="bracket-match final-match"
          :class="matchStatusClass(match)"
          @click="onMatchClick(match)"
        >
          <!-- 直播状态条 -->
          <div class="match-status-bar" v-if="match?.status === 'live'">
            <span class="live-dot"></span>
            <span class="match-minute">{{ match.currentMinute ? `${match.currentMinute}'` : 'LIVE' }}</span>
          </div>
          <!-- 主队 -->
          <div class="match-team" :class="{ 'is-winner': isWinner(match, 'home') }">
            <img v-if="getTeamLogoUrl(match?.homeTeam?.bsTeamId)" :src="getTeamLogoUrl(match?.homeTeam?.bsTeamId, { bg: 'transparent' })" class="team-logo-xs" alt="" />
            <span v-if="getFlagClass(match?.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam.countryCode)} team-flag`"></span>
            <span class="team-name" :class="{ 'is-pending': match?.homeTeamConfirmed === false }">{{ getTeamName(match?.homeTeam) || $t('bracket.tbd') }}</span>
            <span v-if="match?.homeTeamConfirmed === false" class="team-pending">{{ $t('bracket.pending') }}</span>
            <span v-if="hasScore(match)" class="team-score">{{ match.homeScore }}</span>
          </div>
          <!-- 客队 -->
          <div class="match-team" :class="{ 'is-winner': isWinner(match, 'away') }">
            <img v-if="getTeamLogoUrl(match?.awayTeam?.bsTeamId)" :src="getTeamLogoUrl(match?.awayTeam?.bsTeamId, { bg: 'transparent' })" class="team-logo-xs" alt="" />
            <span v-if="getFlagClass(match?.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam.countryCode)} team-flag`"></span>
            <span class="team-name" :class="{ 'is-pending': match?.awayTeamConfirmed === false }">{{ getTeamName(match?.awayTeam) || $t('bracket.tbd') }}</span>
            <span v-if="match?.awayTeamConfirmed === false" class="team-pending">{{ $t('bracket.pending') }}</span>
            <span v-if="hasScore(match)" class="team-score">{{ match.awayScore }}</span>
          </div>
          <!-- 开赛时间 -->
          <div class="match-time" v-if="match?.startTime && match.status === 'upcoming'">
            {{ formatMatchTime(match.startTime) }}
          </div>
          <!-- 冠军标识 -->
          <div v-if="match?.status === 'finished'" class="champion-badge">
            <Icon icon="ri:trophy-fill" width="14" height="14" />
            <span>{{ $t('bracket.champion') }}</span>
          </div>
        </div>
      </div>

      <!-- 右半区 -->
      <div class="bracket-half bracket-right">
        <div class="round-column" v-for="round in rightRounds" :key="round.key">
          <div class="round-label">{{ round.label }}</div>
          <div class="round-matches">
            <div
              v-for="(match, idx) in round.matches"
              :key="match?.id || idx"
              class="bracket-match"
              :class="matchStatusClass(match)"
              @click="onMatchClick(match)"
            >
              <!-- 直播状态条 -->
              <div class="match-status-bar" v-if="match?.status === 'live'">
                <span class="live-dot"></span>
                <span class="match-minute">{{ match.currentMinute ? `${match.currentMinute}'` : 'LIVE' }}</span>
              </div>
              <!-- 主队 -->
              <div class="match-team" :class="{ 'is-winner': isWinner(match, 'home') }">
                <img v-if="getTeamLogoUrl(getTeamInfo(match, 'home')?.bsTeamId)" :src="getTeamLogoUrl(getTeamInfo(match, 'home')?.bsTeamId, { bg: 'transparent' })" class="team-logo-xs" alt="" />
                <span v-if="getFlagClass(getTeamInfo(match, 'home')?.countryCode)" :class="`${getFlagClass(getTeamInfo(match, 'home').countryCode)} team-flag`"></span>
                <span class="team-name" :class="{ 'is-placeholder': isPlaceholderTeam(match, 'home'), 'is-pending': match?.homeTeamConfirmed === false }">{{ getTeamName(getTeamInfo(match, 'home')) || $t('bracket.tbd') }}</span>
                <span v-if="match?.homeTeamPlaceholder" class="team-placeholder">{{ match.homeTeamPlaceholder }}</span>
                <span v-if="match?.homeTeamConfirmed === false" class="team-pending">{{ $t('bracket.pending') }}</span>
                <span v-if="hasScore(match)" class="team-score">{{ match.homeScore }}</span>
              </div>
              <!-- 客队 -->
              <div class="match-team" :class="{ 'is-winner': isWinner(match, 'away') }">
                <img v-if="getTeamLogoUrl(getTeamInfo(match, 'away')?.bsTeamId)" :src="getTeamLogoUrl(getTeamInfo(match, 'away')?.bsTeamId, { bg: 'transparent' })" class="team-logo-xs" alt="" />
                <span v-if="getFlagClass(getTeamInfo(match, 'away')?.countryCode)" :class="`${getFlagClass(getTeamInfo(match, 'away').countryCode)} team-flag`"></span>
                <span class="team-name" :class="{ 'is-placeholder': isPlaceholderTeam(match, 'away'), 'is-pending': match?.awayTeamConfirmed === false }">{{ getTeamName(getTeamInfo(match, 'away')) || $t('bracket.tbd') }}</span>
                <span v-if="match?.awayTeamPlaceholder" class="team-placeholder">{{ match.awayTeamPlaceholder }}</span>
                <span v-if="match?.awayTeamConfirmed === false" class="team-pending">{{ $t('bracket.pending') }}</span>
                <span v-if="hasScore(match)" class="team-score">{{ match.awayScore }}</span>
              </div>
              <!-- 开赛时间 -->
              <div class="match-time" v-if="match?.startTime && match.status === 'upcoming'">
                {{ formatMatchTime(match.startTime) }}
              </div>
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
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getFlagClass } from '@/utils/flag'
import { useTeamName } from '@/composables/useTeamName'
import { getTeamLogoUrl } from '@/utils/bsdImages'

const props = defineProps<{
  bracketData?: any
  loading?: boolean
}>()

const router = useRouter()
const { t, locale } = useI18n()
const { getTeamName } = useTeamName()

/** 是否有淘汰赛数据 */
const hasData = computed(() => {
  const stages = props.bracketData || {}
  return (stages.r32?.length || stages.r16?.length || stages.qf?.length || stages.sf?.length || stages.final?.length || 0) > 0
})

/** 淘汰赛各轮数据 */
const r32 = computed(() => props.bracketData?.r32 || [])
const r16 = computed(() => props.bracketData?.r16 || [])
const qf = computed(() => props.bracketData?.qf || [])
const sf = computed(() => props.bracketData?.sf || [])
const finalMatch = computed(() => props.bracketData?.final || [])

/**
 * 左半区轮次（从外到内）
 * 1/16 决赛前8场 → 1/8 决赛前4场 → 1/4 决赛前2场 → 半决赛第1场
 */
const leftRounds = computed(() => [
  { key: 'r32-left', label: t('bracket.r32'), matches: r32.value.slice(0, 8) },
  { key: 'r16-left', label: t('bracket.r16'), matches: r16.value.slice(0, 4) },
  { key: 'qf-left', label: t('bracket.qf'), matches: qf.value.slice(0, 2) },
  { key: 'sf-left', label: t('bracket.sf'), matches: sf.value.slice(0, 1) },
].filter(r => r.matches.length > 0))

/**
 * 右半区轮次（从外到内，与左半区镜像对称）
 * 1/16 决赛后8场 → 1/8 决赛后4场 → 1/4 决赛后2场 → 半决赛第2场
 * 视觉效果：R32 在页面最右边，SF 靠近中间决赛
 */
const rightRounds = computed(() => [
  { key: 'r32-right', label: t('bracket.r32'), matches: r32.value.slice(8, 16) },
  { key: 'r16-right', label: t('bracket.r16'), matches: r16.value.slice(4, 8) },
  { key: 'qf-right', label: t('bracket.qf'), matches: qf.value.slice(2, 4) },
  { key: 'sf-right', label: t('bracket.sf'), matches: sf.value.slice(1, 2) },
].filter(r => r.matches.length > 0))

/** 格式化比赛时间 */
function formatMatchTime(startTime: string | Date): string {
  const d = new Date(startTime)
  return d.toLocaleString(locale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** 判断胜方 */
function isWinner(match: any, side: 'home' | 'away'): boolean {
  if (!match || match.homeScore == null || match.awayScore == null) return false
  if (match.status !== 'finished') return false
  return side === 'home'
    ? Number(match.homeScore) > Number(match.awayScore)
    : Number(match.awayScore) > Number(match.homeScore)
}

/** 是否有比分 */
function hasScore(match: any): boolean {
  return match?.homeScore != null && match?.awayScore != null
}

/** 获取球队信息：如果是占位球队（countryCode=INT 且无 placeholder 标记），返回 null 让模板显示 TBD */
function getTeamInfo(match: any, side: 'home' | 'away'): any {
  const team = side === 'home' ? match?.homeTeam : match?.awayTeam
  // 如果有 placeholder 标记，说明已解析为实际球队
  const placeholderKey = side === 'home' ? 'homeTeamPlaceholder' : 'awayTeamPlaceholder'
  if (match?.[placeholderKey]) return team
  // 如果是占位球队（countryCode=INT），不显示
  if (team?.countryCode === 'INT') return null
  return team
}

/** 判断是否为未解析的占位球队 */
function isPlaceholderTeam(match: any, side: 'home' | 'away'): boolean {
  const team = side === 'home' ? match?.homeTeam : match?.awayTeam
  const placeholderKey = side === 'home' ? 'homeTeamPlaceholder' : 'awayTeamPlaceholder'
  // 已解析的占位球队不算
  if (match?.[placeholderKey]) return false
  // countryCode=INT 且无 placeholder 标记的是未解析占位球队
  return team?.countryCode === 'INT'
}

/** 比赛状态样式 */
function matchStatusClass(match: any): string {
  if (!match) return ''
  return match.status || 'upcoming'
}

/** 点击比赛跳转详情 */
function onMatchClick(match: any) {
  if (match?.id) router.push(`/match/${match.id}`)
}
</script>

<style scoped>
.knockout-bracket {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 0;
  background: var(--color-bg-muted);
  border-radius: 8px;
}

.bracket-loading,
.bracket-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--color-text-dark-muted);
  gap: 8px;
}

/* ============ 树形对阵图布局 ============ */
.bracket-tree {
  display: flex;
  align-items: stretch;
  min-width: 1100px;
  min-height: 640px;
  gap: 0;
}

/* 半区容器 */
.bracket-half {
  display: flex;
  align-items: stretch;
  gap: 0;
  flex: 1;
}

.bracket-left {
  flex-direction: row;
}

.bracket-right {
  flex-direction: row-reverse;
}

/* 轮次列 */
.round-column {
  display: flex;
  flex-direction: column;
  min-width: 160px;
  position: relative;
}

.round-label {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
  padding: 8px 0 10px;
  text-transform: uppercase;
  background: var(--color-bg-elevated);
  border-bottom: 2px solid var(--color-border);
  position: relative;
  z-index: 1;
}

.final-label {
  color: var(--color-warning);
  font-size: 12px;
}

/* 轮次内的比赛列表，垂直居中分布 */
.round-matches {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 6px;
  gap: 6px;
  position: relative;
}

/* ============ 比赛卡片 ============ */
.bracket-match {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: relative;
}

.bracket-match:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 进行中比赛 */
.bracket-match.live {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.15);
}

/* 已完成比赛 */
.bracket-match.finished {
  border-color: rgba(34, 197, 94, 0.2);
}

/* 待进行比赛 */
.bracket-match.upcoming {
  border-style: dashed;
  opacity: 0.85;
}

.bracket-match.upcoming:hover {
  opacity: 1;
  border-style: solid;
}

/* 决赛卡片特殊样式 */
.final-match {
  min-width: 200px;
  border-color: var(--color-warning);
  background: linear-gradient(145deg, var(--color-warning-bg), var(--color-warning-light));
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
}

/* ============ 直播状态条 ============ */
.match-status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 3px 0;
  background: rgba(239, 68, 68, 0.08);
  border-bottom: 1px solid rgba(239, 68, 68, 0.15);
  font-size: 11px;
  color: var(--color-danger);
  font-weight: 700;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-danger);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ============ 球队行 ============ */
.match-team {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
}

.match-team:last-child {
  border-bottom: none;
}

/* 晋级队伍高亮 */
.match-team.is-winner .team-name {
  color: var(--color-success);
  font-weight: 700;
}

.match-team.is-winner .team-score {
  color: var(--color-success);
  font-weight: 800;
}

/* 晋级箭头标识：左半区指向右侧（向决赛方向） */
.bracket-left .match-team.is-winner::after {
  content: '▶';
  font-size: 8px;
  color: var(--color-success);
  margin-left: auto;
  flex-shrink: 0;
}

/* 晋级箭头标识：右半区指向左侧（向决赛方向） */
.bracket-right .match-team.is-winner::before {
  content: '◀';
  font-size: 8px;
  color: var(--color-success);
  margin-right: auto;
  flex-shrink: 0;
}

.team-flag {
  width: 20px;
  height: 14px;
  border-radius: 2px;
  flex-shrink: 0;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.2);
}

.team-logo-xs {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}

.team-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* 占位来源标签（如 "1A"、"3B/3E/3F/3I/3J"） */
.team-placeholder {
  font-size: 9px;
  color: var(--color-text-tertiary);
  background: var(--color-bg-muted);
  padding: 1px 4px;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 未解析的占位球队名称淡化 */
.team-name.is-placeholder {
  color: var(--color-text-tertiary);
  font-style: italic;
  font-weight: 400;
}

/* 待确认状态（小组赛未结束，排名尚未确定） */
.team-name.is-pending {
  opacity: 0.7;
}

.team-pending {
  font-size: 9px;
  color: var(--color-warning);
  background: var(--color-warning-bg, rgba(251, 191, 36, 0.1));
  padding: 1px 4px;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

.team-score {
  font-weight: 700;
  font-size: 14px;
  min-width: 18px;
  text-align: center;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* 开赛时间 */
.match-time {
  text-align: center;
  padding: 3px 6px;
  font-size: 10px;
  color: var(--color-text-tertiary);
  background: var(--color-bg-muted);
  border-top: 1px solid var(--color-border-light);
}

/* 冠军标识 */
.champion-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 0;
  font-size: 12px;
  color: var(--color-warning);
  font-weight: 700;
  background: var(--color-warning-bg);
  border-top: 1px solid var(--color-border);
}

/* ============ 中间决赛区 ============ */
.bracket-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 220px;
  padding: 0 16px;
  position: relative;
}

/* ============ 响应式 ============ */
@media (max-width: 1200px) {
  .bracket-tree {
    min-width: 960px;
  }
  .round-column {
    min-width: 140px;
  }
  .bracket-match {
    min-width: 130px;
  }
  .match-team {
    padding: 5px 8px;
    font-size: 11px;
  }
  .team-score {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .bracket-tree {
    min-width: auto;
    flex-direction: column;
  }

  .bracket-half {
    flex-direction: column;
  }

  .round-column {
    min-width: auto;
  }

  .bracket-center {
    min-width: auto;
    width: 100%;
  }

  .bracket-match {
    min-width: auto;
  }

  .match-team {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
