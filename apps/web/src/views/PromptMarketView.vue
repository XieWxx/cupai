<template>
  <div class="prompt-market-view">
    <header class="page-header">
      <h1 class="page-title">{{ $t('nav.promptMarket') }}</h1>
    </header>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-select v-model="filters.scene" :placeholder="$t('prompt.scene')" clearable @change="loadMarket">
            <el-option :label="$t('prompt.scenePreview')" value="match_preview" />
            <el-option :label="$t('prompt.sceneCompare')" value="team_compare" />
            <el-option :label="$t('prompt.scenePlayer')" value="player_analysis" />
            <el-option :label="$t('prompt.sceneAdvance')" value="qualification_predict" />
            <el-option :label="$t('prompt.sceneSentiment')" value="sentiment_analysis" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filters.sortBy" :placeholder="$t('prompt.sortMethod')" @change="loadMarket">
            <el-option :label="$t('prompt.sortMostUsed')" value="useCount" />
            <el-option :label="$t('prompt.sortMostCollected')" value="collectCount" />
            <el-option :label="$t('prompt.sortLatest')" value="latest" />
            <el-option :label="$t('prompt.sortMostLiked')" value="likeCount" />
          </el-select>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button type="primary" @click="showCreateDialog = true">{{ $t('prompt.create') }}</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 模板列表 -->
    <el-row :gutter="16">
      <el-col v-for="template in promptStore.marketTemplates" :key="template.id" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card shadow="hover" class="common-card template-card">
          <template #header>
            <div class="template-header">
              <span class="template-name">{{ template.name }}</span>
              <el-tag size="small">{{ sceneLabels[template.scene] || template.scene }}</el-tag>
            </div>
          </template>
          <p class="template-content">{{ template.content?.substring(0, 100) }}...</p>
          <div class="template-meta">
            <span>👍 {{ template.likeCount }}</span>
            <span>⭐ {{ template.collectCount }}</span>
            <span>🔄 {{ template.useCount }}</span>
          </div>
          <div class="template-actions">
            <el-button text type="primary" @click="promptStore.collectTemplate(template.id)">{{ $t('prompt.collections') }}</el-button>
            <el-button text type="primary" @click="useTemplate(template)">{{ $t('prompt.use') }}</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="promptStore.marketTemplates.length === 0 && !promptStore.loading" :description="$t('prompt.noPublicTemplates')" />

    <!-- 创建模板弹窗 -->
    <el-dialog v-model="showCreateDialog" :title="$t('prompt.create')" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item :label="$t('prompt.templateName')">
          <el-input v-model="createForm.name" :placeholder="$t('prompt.templateNameHint')" />
        </el-form-item>
        <el-form-item :label="$t('prompt.scene')">
          <el-select v-model="createForm.scene" :placeholder="$t('prompt.selectScene')">
            <el-option :label="$t('prompt.scenePreview')" value="match_preview" />
            <el-option :label="$t('prompt.sceneCompare')" value="team_compare" />
            <el-option :label="$t('prompt.scenePlayer')" value="player_analysis" />
            <el-option :label="$t('prompt.sceneAdvance')" value="qualification_predict" />
            <el-option :label="$t('prompt.sceneSentiment')" value="sentiment_analysis" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('prompt.adaptModel')">
          <el-input v-model="createForm.adaptedModel" :placeholder="$t('prompt.adaptModelHint')" />
        </el-form-item>
        <el-form-item :label="$t('prompt.templateContent')">
          <el-input v-model="createForm.content" type="textarea" :rows="8" :placeholder="$t('prompt.templateContentHint')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="createTemplate">{{ $t('prompt.create') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { usePromptStore } from '@/stores/prompt'

const promptStore = usePromptStore()
const router = useRouter()
const { t } = useI18n()
const showCreateDialog = ref(false)

const filters = reactive({
  scene: '',
  sortBy: 'latest',
})

// 场景标签映射（响应式，支持国际化）
const sceneLabels = computed<Record<string, string>>(() => ({
  match_preview: t('prompt.scenePreview'),
  team_compare: t('prompt.sceneCompare'),
  player_analysis: t('prompt.scenePlayer'),
  qualification_predict: t('prompt.sceneAdvance'),
  sentiment_analysis: t('prompt.sceneSentiment'),
}))

const createForm = reactive({
  name: '',
  scene: 'match_preview',
  adaptedModel: '',
  content: '',
})

async function loadMarket() {
  try {
    await promptStore.fetchMarketTemplates({
      scene: filters.scene || undefined,
      sortBy: filters.sortBy,
    })
  } catch (err) {
    console.error('[loadMarket] failed:', err)
  }
}

async function createTemplate() {
  try {
    await promptStore.createTemplate(createForm)
    showCreateDialog.value = false
    ElMessage.success(t('prompt.createSuccess'))
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || t('prompt.createFail'))
  }
}

function useTemplate(template: any) {
  router.push({ path: '/analysis', query: { templateId: template.id } })
}

onMounted(() => {
  loadMarket()
})
</script>

<style scoped>
.prompt-market-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* .filter-bar 使用全局样式 */

.template-card {
  margin-bottom: var(--space-4);
  transition: transform var(--duration-normal) var(--ease-out);
}

.template-card:hover {
  transform: translateY(-2px);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-name {
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
}

.template-content {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-3);
}

.template-meta {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-3);
}

.template-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .filter-bar :deep(.el-col) {
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-bottom: var(--space-2);
  }
}

@media (max-width: 480px) {
  .filter-bar :deep(.el-col) {
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
}
</style>
