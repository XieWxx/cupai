<template>
  <el-container class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="main-header">
      <div class="header-inner">
        <div class="header-left">
          <h1 class="logo" @click="router.push('/')">
            <span class="logo-icon">⚽</span>
            <span class="logo-text">CupAI</span>
          </h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          class="header-nav"
          router
        >
          <el-menu-item index="/">{{ $t('nav.home') }}</el-menu-item>
          <el-menu-item index="/match">{{ $t('nav.matchCenter') }}</el-menu-item>
          <el-menu-item index="/ranking">{{ $t('nav.ranking') }}</el-menu-item>
          <el-menu-item index="/sponsor">{{ $t('nav.sponsor') }}</el-menu-item>
        </el-menu>
        <div class="header-right">
          <!-- 语言切换 -->
          <el-dropdown :value="currentLocale" @command="switchLocale" class="locale-switch">
            <span class="locale-label">
              {{ localeLabels[currentLocale] }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(label, code) in localeLabels" :key="code" :command="code">{{ label }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <!-- 用户入口 -->
          <el-button v-if="!userStore.isLoggedIn" type="primary" @click="router.push('/login')">
            {{ $t('common.login') }}
          </el-button>
          <el-dropdown v-else @command="handleUserCommand">
            <span class="user-info">
              <el-avatar :size="30" :src="userStore.user?.avatar" class="user-avatar">
                {{ userStore.user?.nickname?.[0] }}
              </el-avatar>
              <span class="user-name">{{ userStore.user?.nickname }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">{{ $t('nav.profile') }}</el-dropdown-item>
                <el-dropdown-item command="logout" divided>{{ $t('common.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    <!-- 主内容区 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
    <!-- 底部 -->
    <footer class="main-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-logo">⚽ CupAI</span>
          <span class="footer-tagline">AI-Powered World Cup Analytics</span>
        </div>
        <div class="footer-legal">
          <p class="disclaimer">{{ $t('compliance.disclaimer') }}</p>
          <p class="copyright">© {{ new Date().getFullYear() }} {{ $t('common.appName') }} · Apache-2.0 License</p>
        </div>
      </div>
    </footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const userStore = useUserStore()

// 当前激活的菜单项
const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/match')) return '/match'
  if (path.startsWith('/ranking')) return '/ranking'
  if (path.startsWith('/sponsor')) return '/sponsor'
  return path
})

// 当前语言
const currentLocale = computed(() => locale.value)

// 语言标签映射（响应式）
const localeLabels = computed<Record<string, string>>(() => ({
  'zh-CN': '简体中文',
  'en-US': 'English',
  'es-ES': 'Español',
  'fr-FR': 'Français',
  'pt-BR': 'Português',
  'ar-SA': 'العربية',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
}))

// 切换语言
function switchLocale(lang: string) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

// 用户操作
function handleUserCommand(command: string) {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
    router.push('/')
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-page);
}

/* ============ 导航栏 ============ */
.main-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-inner {
  display: flex;
  align-items: center;
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: var(--header-height);
}

.header-left {
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  transition: opacity var(--duration-fast) var(--ease-out);
}

.logo:hover {
  opacity: 0.85;
}

.logo-icon {
  font-size: 26px;
}

.logo-text {
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.header-nav {
  flex: 1;
  border-bottom: none;
  margin: 0 var(--space-6);
  background: transparent;
}

.header-nav :deep(.el-menu-item) {
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  height: var(--header-height);
  line-height: var(--header-height);
}

.header-nav :deep(.el-menu-item.is-active) {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: var(--font-semibold);
}

.header-nav :deep(.el-menu-item:hover) {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-shrink: 0;
}

.locale-switch {
  cursor: pointer;
}

.locale-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: background var(--duration-fast) var(--ease-out);
}

.locale-label:hover {
  background: var(--color-bg-muted);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: background var(--duration-fast) var(--ease-out);
}

.user-info:hover {
  background: var(--color-bg-muted);
}

.user-avatar {
  background: var(--gradient-brand);
  color: #fff;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.user-name {
  font-size: var(--text-sm);
  color: var(--color-text-regular);
  font-weight: var(--font-medium);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============ 主内容区 ============ */
.main-content {
  flex: 1;
  padding: var(--space-6);
  background: var(--color-bg-page);
}

.main-content :deep(.page-wrapper),
.main-content :deep(.home-view),
.main-content :deep(.match-center-view),
.main-content :deep(.match-data-center-view),
.main-content :deep(.ranking-view),
.main-content :deep(.analysis-center-view),
.main-content :deep(.sentiment-view),
.main-content :deep(.prompt-market-view),
.main-content :deep(.profile-view),
.main-content :deep(.standings-view) {
  max-width: var(--page-max-width);
  margin-left: auto;
  margin-right: auto;
}

/* ============ 页脚 ============ */
.main-footer {
  background: var(--color-bg-dark);
  padding: var(--space-8) var(--space-6);
}

.footer-inner {
  max-width: var(--page-max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.footer-logo {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--color-text-dark);
}

.footer-tagline {
  font-size: var(--text-xs);
  color: var(--color-text-dark-muted);
  padding-left: var(--space-3);
  border-left: 1px solid rgba(148, 163, 184, 0.2);
}

.footer-legal {
  text-align: right;
}

.disclaimer {
  font-size: var(--text-xs);
  color: var(--color-wc-red);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-relaxed);
}

.copyright {
  font-size: var(--text-xs);
  color: rgba(148, 163, 184, 0.6);
  margin: 0;
}

/* ============ 响应式 ============ */
@media (max-width: 768px) {
  .header-inner {
    padding: 0 var(--space-4);
  }

  .header-nav {
    margin: 0 var(--space-3);
  }

  .header-nav :deep(.el-menu-item) {
    font-size: var(--text-xs);
    padding: 0 var(--space-2);
  }

  .user-name {
    display: none;
  }

  .main-content {
    padding: var(--space-4);
  }

  .footer-inner {
    flex-direction: column;
    text-align: center;
    gap: var(--space-3);
  }

  .footer-brand {
    flex-direction: column;
    gap: var(--space-1);
  }

  .footer-tagline {
    border-left: none;
    padding-left: 0;
  }

  .footer-legal {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .locale-label span:first-child {
    display: none;
  }
}
</style>
