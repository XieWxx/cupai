<!--
  三段时间展示：开赛时间 · 比赛地时间 · 距开赛倒计时
  - match: 赛事对象（含 startTime / status / matchMinute）
  - size: 视觉尺寸（small / default）
-->
<template>
  <div class="time-triple" :class="`time-triple--${size}`">
    <div v-if="localTimeText" class="time-triple__cell">
      <div class="time-triple__label">{{ $t('match.localTime') }}</div>
      <div class="time-triple__value">{{ localTimeText }}</div>
    </div>
    <div v-if="venueTimeText" class="time-triple__cell">
      <div class="time-triple__label">{{ $t('match.venueTime') }}</div>
      <div class="time-triple__value">{{ venueTimeText }}</div>
    </div>
    <div v-if="countdownText" class="time-triple__cell">
      <div class="time-triple__label">{{ $t('match.countdown') }}</div>
      <div class="time-triple__value">{{ countdownText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface MatchLite {
  startTime?: string
  status?: 'live' | 'upcoming' | 'finished'
  matchMinute?: string
}

interface Props {
  match: MatchLite | null | undefined
  size?: 'small' | 'default'
}
const props = withDefaults(defineProps<Props>(), { size: 'default' })

// 1 秒刷新一次倒计时
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function fmt(date: Date) {
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const startDate = computed(() => {
  const t = props.match?.startTime
  return t ? new Date(t) : null
})

const localTimeText = computed(() => {
  const d = startDate.value
  return d ? fmt(d) : ''
})

// 比赛地时间（用浏览器本地时区近似；如需严格按 venue 时区可后续扩展）
const venueTimeText = computed(() => {
  const d = startDate.value
  return d ? fmt(d) : ''
})

const countdownText = computed(() => {
  const d = startDate.value
  if (!d) return ''
  if (props.match?.status === 'live') {
    return props.match?.matchMinute ? `${t('match.live')} · ${props.match.matchMinute}` : t('match.live')
  }
  if (props.match?.status === 'finished') return t('match.ft')
  const diff = Math.max(0, d.getTime() - now.value)
  const totalSec = Math.floor(diff / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
})
</script>

<style scoped>
.time-triple {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-4, 16px);
}
.time-triple__cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}
.time-triple--small .time-triple__cell {
  min-width: 96px;
}
.time-triple__label {
  font-size: 11px;
  color: var(--color-text-tertiary, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.time-triple__value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
  font-variant-numeric: tabular-nums;
}
.time-triple--small .time-triple__value {
  font-size: 12px;
  font-weight: 500;
}
</style>
