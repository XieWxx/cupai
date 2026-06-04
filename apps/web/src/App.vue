<template>
  <el-config-provider :locale="elementLocale" :theme="themeMode">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
// CupAI 根组件 - 主题 + 国际化配置
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const { locale } = useI18n()

// Element Plus 语言包映射
const elementLocale = computed(() => {
  return locale.value === 'zh-CN' ? zhCn : en
})

// 暗色主题（暂用默认亮色，后续通过 store 控制）
const themeMode = computed(() => undefined)
</script>

<style>
/* 全局暗色主题 CSS 变量 */
:root {
  --cupai-bg-primary: #ffffff;
  --cupai-bg-secondary: #f5f7fa;
  --cupai-bg-card: #ffffff;
  --cupai-text-primary: #303133;
  --cupai-text-secondary: #606266;
  --cupai-border-color: #dcdfe6;
  --cupai-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

html.dark {
  --cupai-bg-primary: #141414;
  --cupai-bg-secondary: #1d1e1f;
  --cupai-bg-card: #1d1e1f;
  --cupai-text-primary: #e5eaf3;
  --cupai-text-secondary: #a3a6ad;
  --cupai-border-color: #4c4d4f;
  --cupai-shadow: 0 2px 12px rgba(0, 0, 0, 0.36);
}

#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--cupai-bg-primary);
  color: var(--cupai-text-primary);
  transition: background-color 0.3s, color 0.3s;
}
</style>
