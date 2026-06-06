<template>
  <div class="prompt-market-view">
    <h1>{{ $t('nav.promptMarket') }}</h1>

    <!-- 筛选栏 -->
    <el-row :gutter="16" class="filter-bar">
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

    <!-- 模板列表 -->
    <el-row :gutter="16">
      <el-col v-for="template in promptStore.marketTemplates" :key="template.id" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card shadow="hover" class="template-card">
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

// 场景标签映射（响应式，支持国际化）
const sceneLabels = computed<Record<string, string>>(() => ({
  match_preview: t('prompt.scenePreview'),
  team_compare: t('prompt.sceneCompare'),
  player_analysis: t('prompt.scenePlayer'),
  qualification_predict: t('prompt.sceneAdvance'),
  sentiment_analysis: t('prompt.sceneSentiment'),
}))

const filters = reactive({
  scene: '',
  sortBy: 'useCount',
})

const createForm = reactive({
  name: '',
  scene: '',
  adaptedModel: '',
  content: '',
})

async function loadMarket() {
  await promptStore.fetchMarketTemplates({
    scene: filters.scene || undefined,
    sortBy: filters.sortBy,
  })
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
  // 跳转到分析中心并携带模板ID
  router.push({ path: '/analysis', query: { templateId: template.id } })
}

onMounted(() => {
  loadMarket()
})
</script>

<style scoped>
.prompt-market-view h1 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.filter-bar {
  margin-bottom: 20px;
}

.template-card {
  margin-bottom: 16px;
  transition: transform 0.2s;
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
  font-weight: 600;
  font-size: 15px;
}

.template-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.template-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.template-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
