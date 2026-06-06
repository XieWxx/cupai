<!--
  通用空状态组件
  - title: 标题
  - description: 描述
  - variant: 风格变体（warning / info / document / default）
  - actions: 通过 #actions 插槽放置按钮
-->
<template>
  <div class="empty-state" :class="`empty-state--${variant}`">
    <div class="empty-state__icon">
      <el-icon :size="48">
        <component :is="iconComponent" />
      </el-icon>
    </div>
    <h3 v-if="title" class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.actions" class="empty-state__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Warning, Document, InfoFilled, Box } from '@element-plus/icons-vue'

interface Props {
  title?: string
  description?: string
  variant?: 'default' | 'warning' | 'info' | 'document'
}
const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  variant: 'default',
})

const iconComponent = computed(() => {
  switch (props.variant) {
    case 'warning':
      return Warning
    case 'info':
      return InfoFilled
    case 'document':
      return Document
    default:
      return Box
  }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8, 32px) var(--space-4, 16px);
  text-align: center;
  min-height: 200px;
}
.empty-state__icon {
  color: var(--color-text-tertiary, #9ca3af);
  margin-bottom: var(--space-3, 12px);
}
.empty-state--warning .empty-state__icon {
  color: #f59e0b;
}
.empty-state--info .empty-state__icon {
  color: #3b82f6;
}
.empty-state--document .empty-state__icon {
  color: #6b7280;
}
.empty-state__title {
  margin: 0 0 var(--space-2, 8px);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
}
.empty-state__description {
  margin: 0 0 var(--space-4, 16px);
  color: var(--color-text-secondary, #6b7280);
  max-width: 480px;
  line-height: 1.5;
}
.empty-state__actions {
  display: flex;
  gap: var(--space-2, 8px);
  flex-wrap: wrap;
  justify-content: center;
}
</style>
