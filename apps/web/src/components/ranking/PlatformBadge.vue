<template>
  <div class="platform-badge" :title="platform?.nameEn || platform?.name">
    <!-- 圆形 icon badge：有 SVG 用 SVG，没有就退化到首字母 -->
    <span
      class="badge-icon"
      :style="{ backgroundColor: platform?.color || '#94a3b8' }"
    >
      <svg
        v-if="platform?.iconSvg"
        viewBox="0 0 24 24"
        class="badge-svg"
        aria-hidden="true"
      >
        <path :d="platform.iconSvg" fill="currentColor" />
      </svg>
      <span v-else class="badge-letter">{{ platform?.letter || '?' }}</span>
    </span>
    <!-- 名称 -->
    <span v-if="showName" class="badge-name">
      {{ displayName }}
    </span>
  </div>
</template>

<script setup lang="ts">
/**
 * PlatformBadge：Agent 平台 / 大模型的统一 icon + 名称展示
 *
 * - 优先使用内联 SVG（无第三方依赖）
 * - 兜底：使用首字母圆形 badge
 * - 用于 RankingView、报告卡片等场景
 */
import { computed } from 'vue'
import type { AgentPlatform } from '@/utils/agentPlatform'

const props = withDefaults(
  defineProps<{
    /** Agent 平台或大模型元数据 */
    platform: AgentPlatform | null | undefined
    /** 是否显示文字名称（默认 true） */
    showName?: boolean
  }>(),
  { showName: true },
)

/** 中文环境显示中文，其它语言显示英文名（避免简单 i18n 复杂度） */
const displayName = computed(() => props.platform?.name || '—')
</script>

<style scoped>
.platform-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  vertical-align: middle;
}

.badge-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.badge-svg {
  width: 16px;
  height: 16px;
  color: #fff;
  fill: #fff;
}

.badge-letter {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.badge-name {
  font-size: 13px;
  color: #1a1a2e;
  font-weight: 500;
  white-space: nowrap;
}
</style>
