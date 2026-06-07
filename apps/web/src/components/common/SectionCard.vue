<!--
  通用分节卡片
  - title: 节标题（必填）
  - extra: 标题右侧的操作区（通过 #extra 插槽）
  - 其他属性透传到外层（class/style）
-->
<template>
  <section class="section-card" :class="$attrs.class" :style="$attrs.style">
    <header v-if="title || $slots.extra" class="section-card__header">
      <h3 v-if="title" class="section-card__title">{{ title }}</h3>
      <div v-if="$slots.extra" class="section-card__extra">
        <slot name="extra" />
      </div>
    </header>
    <div class="section-card__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

interface Props {
  title?: string
}
defineProps<Props>()
</script>

<style scoped>
.section-card {
  background: var(--color-bg-elevated, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-4, 16px) var(--space-5, 20px);
  box-shadow: var(--shadow-card, 0 1px 2px rgba(0, 0, 0, 0.04));
  border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.04));
}
.section-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12px);
  margin-bottom: var(--space-3, 12px);
  padding-bottom: var(--space-2, 8px);
  border-bottom: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.06));
}
.section-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
}
.section-card__extra {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  flex-shrink: 0;
}
.section-card__body {
  color: var(--color-text-secondary, #4b5563);
}
</style>
