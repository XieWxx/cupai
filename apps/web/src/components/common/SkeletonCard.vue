<!--
  通用骨架屏卡片
  - rows: 占位行数（默认 3 行）
  - showMedia: 是否在顶部显示图片骨架
  - marginTop / class 等其他属性透传到外层
-->
<template>
  <div class="skeleton-card" :class="$attrs.class" :style="containerStyle">
    <div v-if="showMedia" class="skeleton-card__media shimmer" />
    <div class="skeleton-card__body">
      <div
        v-for="i in rows"
        :key="i"
        class="skeleton-card__row shimmer"
        :style="rowWidthStyle(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

interface Props {
  rows?: number
  showMedia?: boolean
  // 可选外层样式覆盖（如 marginTop）
  marginTop?: string
}
const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  showMedia: false,
  marginTop: '',
})

defineOptions({ inheritAttrs: false })
const $attrs = useAttrs()

const containerStyle = computed(() => {
  if (props.marginTop) return { marginTop: props.marginTop }
  return undefined
})

// 末行短一些，模拟真实文本结尾
function rowWidthStyle(i: number) {
  const widths = ['92%', '88%', '78%', '70%', '60%']
  return { width: widths[(i - 1) % widths.length] }
}
</script>

<style scoped>
.skeleton-card {
  background: var(--color-bg-elevated, #fff);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-4, 16px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.skeleton-card__media {
  width: 100%;
  height: 140px;
  border-radius: var(--radius-sm, 6px);
  margin-bottom: var(--space-3, 12px);
}
.skeleton-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}
.skeleton-card__row {
  height: 14px;
  border-radius: 4px;
}
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 0%,
    rgba(0, 0, 0, 0.12) 50%,
    rgba(0, 0, 0, 0.06) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
