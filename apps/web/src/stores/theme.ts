import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 主题状态管理
 * 支持亮色/暗色主题切换
 */
export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 恢复主题偏好
  const isDark = ref<boolean>(localStorage.getItem('cupai_theme') === 'dark')

  /**
   * 切换主题
   */
  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
    localStorage.setItem('cupai_theme', isDark.value ? 'dark' : 'light')
  }

  /**
   * 应用主题到 DOM
   */
  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 初始化时应用主题
  applyTheme()

  return { isDark, toggleTheme }
})
