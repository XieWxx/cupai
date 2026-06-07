<template>
  <div class="profile-view">
    <header class="page-header">
      <h1 class="page-title">{{ $t('nav.profile') }}</h1>
    </header>

    <el-card class="common-card">
      <div class="profile-info">
        <el-descriptions :column="2" border size="large">
          <el-descriptions-item :label="$t('common.username')">{{ userStore.user?.username }}</el-descriptions-item>
          <el-descriptions-item :label="$t('common.nickname')">{{ userStore.user?.nickname }}</el-descriptions-item>
          <el-descriptions-item :label="$t('common.language')">{{ userStore.user?.language }}</el-descriptions-item>
          <el-descriptions-item :label="$t('common.timezone')">{{ userStore.user?.timezone }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- API Key 展示区域 -->
      <div class="api-key-section">
        <h3 class="api-key-title">
          <el-icon><Key /></el-icon>
          API Key
        </h3>
        <div class="api-key-display">
          <span class="api-key-value">{{ userStore.user?.apiKey || '-' }}</span>
          <el-button text type="primary" @click="copyApiKey" size="small">
            <el-icon><CopyDocument /></el-icon>
            {{ $t('profile.copyKey') }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Key, CopyDocument } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

// 复制 API Key 到剪贴板
async function copyApiKey() {
  const key = userStore.user?.apiKey
  if (!key) {
    ElMessage.warning(t('profile.noApiKey'))
    return
  }
  try {
    await navigator.clipboard.writeText(key)
    ElMessage.success(t('profile.copySuccess'))
  } catch {
    ElMessage.error(t('common.fail'))
  }
}

onMounted(async () => {
  try {
    await userStore.fetchProfile()
  } catch (err) {
    console.error('[ProfileView] fetchProfile failed:', err)
  }
})
</script>

<style scoped>
.profile-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

.profile-info {
  margin-bottom: var(--space-6);
}

.api-key-section {
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border-light);
}

.api-key-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3);
}

.api-key-display {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-muted);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.api-key-value {
  flex: 1;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  word-break: break-all;
  user-select: text;
  -webkit-user-select: text;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 0 var(--space-3);
  }
  .api-key-display {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .profile-view {
    padding: 0 var(--space-2);
  }
  :deep(.el-descriptions) {
    --el-descriptions-item-bordered-label-background: var(--color-bg-muted);
  }
}
</style>
