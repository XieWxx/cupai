<template>
  <div class="knockout-bracket">
    <div v-if="loading" class="bracket-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ $t('common.loading') }}</span>
    </div>
    <div v-else-if="!hasData" class="bracket-empty">
      <el-empty :description="$t('bracket.noData')" />
    </div>
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
              <div class="match-team" :class="{ 'is-winner': isWinner(match, 'home') }">
                <span v-if="getFlagClass(match?.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam.countryCode)} team-flag`"></span>
                <span class="team-name">{{ match?.homeTeam?.name || $t('bracket.tbd') }}</span>
                <span v-if="hasScore(match)" class="team-score">{{ match.homeScore }}</span>
              </div>
              <div class="match-team" :class="{ 'is-winner': isWinner(match, 'away') }">
                <span v-if="getFlagClass(match?.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam.countryCode)} team-flag`"></span>
                <span class="team-name">{{ match?.awayTeam?.name || $t('bracket.tbd') }}</span>
                <span v-if="hasScore(match)" class="team-score">{{ match.awayScore }}</span>
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
          <div class="match-team" :class="{ 'is-winner': isWinner(match, 'home') }">
            <span v-if="getFlagClass(match?.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam.countryCode)} team-flag`"></span>
            <span class="team-name">{{ match?.homeTeam?.name || $t('bracket.tbd') }}</span>
            <span v-if="hasScore(match)" class="team-score">{{ match.homeScore }}</span>
          </div>
          <div class="match-team" :class="{ 'is-winner': isWinner(match, 'away') }">
            <span v-if="getFlagClass(match?.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam.countryCode)} team-flag`"></span>
            <span class="team-name">{{ match?.awayTeam?.name || $t('bracket.tbd') }}</span>
            <span v-if="hasScore(match)" class="team-score">{{ match.awayScore }}</span>
          </div>
          <!-- 冠军标识 -->
          <div v-if="match?.status === 'finished'" class="champion-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M2 4l4 2 6-2 6 2 4-2v14l-4 2-6-2-6 2-4-2V4z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/></svg>
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
              <div class="match-team" :class="{ 'is-winner': isWinner(match, 'home') }">
                <span v-if="getFlagClass(match?.homeTeam?.countryCode)" :class="`${getFlagClass(match.homeTeam.countryCode)} team-flag`"></span>
                <span class="team-name">{{ match?.homeTeam?.name || $t('bracket.tbd') }}</span>
                <span v-if="hasScore(match)" class="team-score">{{ match.homeScore }}</span>
              </div>
              <div class="match-team" :class="{ 'is-winner': isWinner(match, 'away') }">
                <span v-if="getFlagClass(match?.awayTeam?.countryCode)" :class="`${getFlagClass(match.awayTeam.countryCode)} team-flag`"></span>
                <span class="team-name">{{ match?.awayTeam?.name || $t('bracket.tbd') }}</span>
                <span v-if="hasScore(match)" class="team-score">{{ match.awayScore }}</span>
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getFlagClass } from '@/utils/flag'

const props = defineProps<{
  bracketData?: any
  loading?: boolean
}>()

const router = useRouter()
const { t } = useI18n()

/** 是否有淘汰赛数据 */
const hasData = computed(() => {
  const stages = props.bracketData || {}
  return (stages.r16?.length || stages.qf?.length || stages.sf?.length || stages.final?.length || 0) > 0
})

/** 淘汰赛各轮数据 */
const r16 = computed(() => props.bracketData?.r16 || [])
const qf = computed(() => props.bracketData?.qf || [])
const sf = computed(() => props.bracketData?.sf || [])
const finalMatch = computed(() => props.bracketData?.final || [])

/** 左半区轮次：R16前4场 → QF前2场 → SF第1场 */
const leftRounds = computed(() => [
  { key: 'r16-left', label: t('bracket.r16'), matches: r16.value.slice(0, 4) },
  { key: 'qf-left', label: t('bracket.qf'), matches: qf.value.slice(0, 2) },
  { key: 'sf-left', label: t('bracket.sf'), matches: sf.value.slice(0, 1) },
].filter(r => r.matches.length > 0))

/** 右半区轮次：R16后4场 → QF后2场 → SF第2场 */
const rightRounds = computed(() => [
  { key: 'sf-right', label: t('bracket.sf'), matches: sf.value.slice(1, 2) },
  { key: 'qf-right', label: t('bracket.qf'), matches: qf.value.slice(2, 4) },
  { key: 'r16-right', label: t('bracket.r16'), matches: r16.value.slice(4, 8) },
].filter(r => r.matches.length > 0))

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
  padding: 8px 0;
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
  min-width: 900px;
  min-height: 480px;
  gap: 0;
  background: var(--color-bg-muted);
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
  /* 左半区：从左到右，轮次递进 */
}

.bracket-right {
  flex-direction: row-reverse;
  /* 右半区：从右到左，轮次递进（视觉上从外到内） */
}

/* 轮次列 */
.round-column {
  display: flex;
  flex-direction: column;
  min-width: 170px;
  position: relative;
}

.round-label {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
  padding: 6px 0 12px;
  text-transform: uppercase;
}

.final-label {
  color: var(--color-warning);
  font-size: 13px;
}

/* 轮次内的比赛列表，垂直居中分布 */
.round-matches {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 0 8px;
  gap: 8px;
}

/* 比赛卡片 ============ */
.bracket-match {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
}

.bracket-match:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-1px);
}

.bracket-match.live {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.12);
}

.bracket-match.finished {
  border-color: rgba(34, 197, 94, 0.15);
}

/* 决赛卡片特殊样式 */
.final-match {
  min-width: 190px;
  border-color: var(--color-warning);
  background: linear-gradient(145deg, var(--color-warning-bg), var(--color-warning-light));
}

/* ============ 球队行 ============ */
.match-team {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
}

.match-team:last-child {
  border-bottom: none;
}

.match-team.is-winner .team-name {
  color: var(--color-success);
  font-weight: 700;
}

.match-team.is-winner .team-score {
  color: var(--color-success);
  text-shadow: 0 0 6px rgba(74, 222, 128, 0.3);
}

.team-flag {
  width: 20px;
  height: 15px;
  border-radius: 2px;
  flex-shrink: 0;
}

.team-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.team-score {
  font-weight: 700;
  font-size: 14px;
  min-width: 18px;
  text-align: center;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* 冠军标识 */
.champion-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 0;
  font-size: 11px;
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
  min-width: 200px;
  padding: 0 12px;
  position: relative;
}

/* ============ 连接线（用伪元素绘制） ============ */
.bracket-left .round-column:not(:first-child) .round-matches::before,
.bracket-right .round-column:not(:first-child) .round-matches::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 12px;
  /* 水平连接线由间距暗示，不画复杂 SVG */
}

/* ============ 响应式 ============ */
@media (max-width: 768px) {
  .bracket-tree {
    min-width: auto;
    flex-direction: column;
  }

  .bracket-half {
    flex-direction: column;
  }

  .bracket-right {
    flex-direction: column;
  }

  .round-column {
    min-width: auto;
  }

  .bracket-center {
    min-width: auto;
    width: 100%;
  }
}
</style>
