<template>
  <!--
    两种渲染模式：
    - split=true（默认 false）：fragment 模式，渲染为两个独立根节点（icon + name）
      用途：在 grid/flex 等需要子节点独立占位的容器中（如 HomeView panel-item），
           让 icon 和 name 分别落到不同的 grid 列，与"高准确率用户"列布局一致
    - split=false：单一根 <div class="platform-badge">，inline-flex 包含 icon + name
      用途：RankingView el-table 等无 grid 约束的场景
  -->
  <template v-if="split">
    <!-- 第 2 列：icon -->
    <span
      class="badge-icon"
      :title="platform?.nameEn || displayName"
      :style="{ backgroundColor: platform?.color || '#94a3b8' }"
    >
      <!-- 优先使用本地 SVG（@lobehub/icons-static-svg，通过 Vite ?url import） -->
      <img
        v-if="platform?.iconUrl"
        :src="platform.iconUrl"
        :alt="platform?.nameEn || ''"
        class="badge-local-img"
      />
      <!-- 降级：首字母 badge -->
      <span v-else class="badge-letter">{{ platform?.letter || '?' }}</span>
    </span>
    <!-- 第 3 列：name -->
    <span v-if="showName" class="badge-name" :title="displayName">
      {{ displayName }}
    </span>
  </template>
  <div v-else class="platform-badge" :title="platform?.nameEn || displayName">
    <span
      class="badge-icon"
      :style="{ backgroundColor: platform?.color || '#94a3b8' }"
    >
      <!-- 优先使用本地 SVG（@lobehub/icons-static-svg，通过 Vite ?url import） -->
      <img
        v-if="platform?.iconUrl"
        :src="platform.iconUrl"
        :alt="platform?.nameEn || ''"
        class="badge-local-img"
      />
      <!-- 降级：首字母 badge -->
      <span v-else class="badge-letter">{{ platform?.letter || '?' }}</span>
    </span>
    <span v-if="showName" class="badge-name">
      {{ displayName }}
    </span>
  </div>
</template>

<script setup lang="ts">
/**
 * PlatformBadge：Agent 平台 / 大模型的统一 icon + 名称展示
 *
 * 两级降级渲染策略：
 * 1. 本地 SVG（iconUrl → @lobehub/icons-static-svg，通过 Vite ?url import）
 * 2. 首字母圆形 badge（最终兜底）
 *
 * 用于 RankingView、报告卡片、HomeView 等场景
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AgentPlatform } from '@/utils/agentPlatform'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    /** Agent 平台或大模型元数据 */
    platform: AgentPlatform | null | undefined
    /** 是否显示文字名称（默认 true） */
    showName?: boolean
    /**
     * 是否拆分为两个独立根节点（icon + name）
     * - false：单一根 <div class="platform-badge">（inline-flex）
     * - true：fragment 模式，渲染 badge-icon + badge-name 两个独立 span
     *   用于需要子节点分别落到不同 grid 列的场景（如 HomeView panel-item）
     * 默认 false
     */
    split?: boolean
  }>(),
  { showName: true, split: false },
)

/** 解析平台名称：name 为 i18n key 时通过 t() 解析，否则直接展示 */
const displayName = computed(() => {
  if (!props.platform) return '—'
  const name = props.platform.name
  // name 以 'platform.' 开头时视为 i18n key，通过 t() 解析
  if (name.startsWith('platform.')) {
    const resolved = t(name)
    // 如果 t() 未找到翻译，会返回 key 本身，此时回退到 nameEn
    return resolved === name ? (props.platform.nameEn || name) : resolved
  }
  // 兜底：直接展示原始值（动态输入等场景）
  return name
})
</script>

<style scoped>
/* ============ inline 模式容器 ============ */
.platform-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  vertical-align: middle;
  /* 关键：让 flex 子项可以正确收缩，避免名字撑破父容器 */
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

/* ============ icon 圆形徽章（split/inline 共用） ============ */
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
  overflow: hidden;
}

/* 本地 SVG icon 图片（@lobehub/icons-static-svg，单色） */
.badge-local-img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  /* 本地 SVG 是单色版本，在深色背景上反色显示 */
  filter: brightness(0) invert(1);
}

.badge-letter {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

/* ============ 名称（split/inline 共用） ============ */
.badge-name {
  font-size: 13px;
  color: var(--color-text-primary, #1a1a2e);
  font-weight: 500;
  white-space: nowrap;
  /* 关键：让长名称在父容器中可截断，避免溢出遮挡其他元素 */
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
