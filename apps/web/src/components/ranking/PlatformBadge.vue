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
    <!-- 第 2 列：icon（与"高准确率用户"列的 flag 28px 圆形位置对齐） -->
    <span
      class="badge-icon"
      :title="platform?.nameEn || platform?.name"
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
    <!-- 第 3 列：name（与"高准确率用户"列的 nickname 1fr 位置对齐） -->
    <span v-if="showName" class="badge-name" :title="displayName">
      {{ displayName }}
    </span>
  </template>
  <div v-else class="platform-badge" :title="platform?.nameEn || platform?.name">
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
 * - 用于 RankingView、报告卡片、HomeView 等场景
 */
import { computed } from 'vue'
import type { AgentPlatform } from '@/utils/agentPlatform'

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

/** 中文环境显示中文，其它语言显示英文名（避免简单 i18n 复杂度） */
const displayName = computed(() => props.platform?.name || '—')
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

/* ============ 名称（split/inline 共用） ============ */
.badge-name {
  font-size: 13px;
  color: #1a1a2e;
  font-weight: 500;
  white-space: nowrap;
  /* 关键：让长名称在父容器中可截断，避免溢出遮挡其他元素 */
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
