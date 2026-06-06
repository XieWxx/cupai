<template>
  <el-container class="main-layout">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
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
        <el-menu-item index="/analysis">{{ $t('nav.analysisCenter') }}</el-menu-item>
        <el-menu-item index="/prompt-market">{{ $t('nav.promptMarket') }}</el-menu-item>
        <el-menu-item index="/square">{{ $t('nav.analysisSquare') }}</el-menu-item>
        <el-menu-item index="/ranking">{{ $t('nav.ranking') }}</el-menu-item>
        <el-menu-item index="/standings">{{ $t('nav.standings') }}</el-menu-item>
        <el-menu-item index="/sentiment">{{ $t('nav.sentiment') }}</el-menu-item>
      </el-menu>
      <div class="header-right">
        <!-- 语言切换 -->
        <el-dropdown @command="switchLocale" class="locale-switch">
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
            <el-avatar :size="28" :src="userStore.user?.avatar">
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
    </el-header>
    <!-- 主内容区 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
    <!-- 底部合规声明 -->
    <el-footer class="main-footer" height="auto">
      <div class="footer-content">
        <p class="disclaimer">{{ $t('compliance.disclaimer') }}</p>
        <p class="copyright">© {{ new Date().getFullYear() }} {{ $t('common.appName') }} · Apache-2.0 License</p>
      </div>
    </el-footer>
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
const activeMenu = computed(() => route.path)

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
}

.main-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  background: linear-gradient(135deg, #1a1a2e, #e94560);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-nav {
  flex: 1;
  border-bottom: none;
  margin: 0 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.locale-switch {
  cursor: pointer;
}

.locale-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  color: #333;
}

.main-content {
  flex: 1;
  padding: 24px;
  background: #f5f7fa;
}

.main-footer {
  background: #1a1a2e;
  color: #999;
  padding: 20px 24px;
  text-align: center;
}

.disclaimer {
  font-size: 12px;
  color: #e94560;
  margin-bottom: 8px;
  line-height: 1.6;
}

.copyright {
  font-size: 12px;
  color: #666;
}
</style>
