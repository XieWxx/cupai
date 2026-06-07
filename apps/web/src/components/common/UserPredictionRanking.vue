<!--
  用户预测排行列表
  - list: 排行数据（UserRankingItem[]）
  - loading: 是否处于加载态
-->
<template>
  <div class="user-prediction-ranking">
    <div v-if="loading" class="user-prediction-ranking__skeleton">
      <div v-for="i in 5" :key="i" class="row-skeleton shimmer" />
    </div>
    <ul v-else-if="list && list.length" class="user-prediction-ranking__list">
      <li v-for="(item, idx) in list" :key="item.userId" class="ranking-row">
        <div class="ranking-row__rank" :class="rankClass(idx)">{{ idx + 1 }}</div>
        <div class="ranking-row__avatar">
          <span :class="['fi', `fi-${item.countryCode || 'xx'}`]" />
        </div>
        <div class="ranking-row__main">
          <div class="ranking-row__name">{{ item.username || item.userId }}</div>
          <div class="ranking-row__meta">
            <span class="ranking-row__platform">{{ platformLabel(item.platform) }}</span>
            <span class="ranking-row__llm">· {{ item.llmType || '-' }}</span>
          </div>
        </div>
        <div class="ranking-row__stat">
          <div class="ranking-row__stat-value">{{ displayValue(item) }}</div>
          <div class="ranking-row__stat-label">{{ $t(mode === 'predictions' ? 'matchCenter.predictions' : 'matchCenter.accuracy') }}</div>
        </div>
      </li>
    </ul>
    <el-empty v-else :description="$t('common.noData')" :image-size="80" />
  </div>
</template>

<script setup lang="ts">
export interface UserRankingItem {
  userId: string
  username?: string
  countryCode?: string
  platform?: string
  llmType?: string
  accuracy: number
}

interface Props {
  list: UserRankingItem[]
  loading?: boolean
  /** 展示模式：predictions=预测次数（赛事维度），accuracy=准确率（全局排行） */
  mode?: 'predictions' | 'accuracy'
}
const props = withDefaults(defineProps<Props>(), { loading: false, mode: 'predictions' })

function displayValue(item: UserRankingItem): string {
  if (props.mode === 'accuracy') {
    // accuracy 模式：item.accuracy 是 0-1 的小数
    return `${(item.accuracy * 100).toFixed(1)}%`
  }
  // predictions 模式：item.accuracy 存的是预测次数
  return `${Math.round(item.accuracy)}`
}

function rankClass(idx: number) {
  if (idx === 0) return 'gold'
  if (idx === 1) return 'silver'
  if (idx === 2) return 'bronze'
  return ''
}

function platformLabel(p?: string) {
  const map: Record<string, string> = {
    chatgpt: 'ChatGPT',
    gpt: 'GPT',
    claude: 'Claude',
    deepseek: 'DeepSeek',
    qwen: 'Qwen',
    gemini: 'Gemini',
    cursor: 'Cursor',
    doubao: 'Doubao',
  }
  return map[p || ''] || p || '-'
}
</script>

<style scoped>
.user-prediction-ranking__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}
.ranking-row {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-2, 8px) var(--space-3, 12px);
  border-radius: var(--radius-sm, 6px);
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.02));
}
.ranking-row:hover {
  background: var(--color-bg-elevated, rgba(0, 0, 0, 0.04));
}
.ranking-row__rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: var(--color-bg-elevated, #e5e7eb);
  color: var(--color-text-secondary, #6b7280);
  flex-shrink: 0;
}
.ranking-row__rank.gold { background: #fef3c7; color: #b45309; }
.ranking-row__rank.silver { background: #f3f4f6; color: #4b5563; }
.ranking-row__rank.bronze { background: #fde6d3; color: #9a3412; }
.ranking-row__avatar {
  width: 28px;
  height: 20px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.ranking-row__avatar .fi {
  width: 28px;
  height: 20px;
  border: 0 !important;
  border-radius: 0;
  box-shadow: none !important;
  outline: none !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: inline-block;
}
.ranking-row__main {
  flex: 1;
  min-width: 0;
}
.ranking-row__name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ranking-row__meta {
  font-size: 11px;
  color: var(--color-text-tertiary, #9ca3af);
  margin-top: 2px;
}
.ranking-row__stat {
  text-align: right;
  flex-shrink: 0;
}
.ranking-row__stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #5b8ff9;
  font-variant-numeric: tabular-nums;
}
.ranking-row__stat-label {
  font-size: 10px;
  color: var(--color-text-tertiary, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.row-skeleton {
  height: 44px;
  border-radius: 6px;
  margin-bottom: 8px;
}
.shimmer {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.10) 50%, rgba(0, 0, 0, 0.04) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
