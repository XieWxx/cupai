<template>
  <div class="prompt-market-view">
    <h1>{{ $t('nav.promptMarket') }}</h1>

    <!-- 筛选栏 -->
    <el-row :gutter="16" class="filter-bar">
      <el-col :span="6">
        <el-select v-model="filters.scene" placeholder="适配场景" clearable @change="loadMarket">
          <el-option label="赛事前瞻" value="match_preview" />
          <el-option label="球队对比" value="team_compare" />
          <el-option label="球星分析" value="player_analysis" />
          <el-option label="出线推演" value="qualification_predict" />
          <el-option label="舆情研判" value="sentiment_analysis" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="filters.sortBy" placeholder="排序方式" @change="loadMarket">
          <el-option label="最多使用" value="useCount" />
          <el-option label="最多收藏" value="collectCount" />
          <el-option label="最新发布" value="latest" />
          <el-option label="最多点赞" value="likeCount" />
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
              <el-tag size="small">{{ template.scene }}</el-tag>
            </div>
          </template>
          <p class="template-content">{{ template.content?.substring(0, 100) }}...</p>
          <div class="template-meta">
            <span>👍 {{ template.likeCount }}</span>
            <span>⭐ {{ template.collectCount }}</span>
            <span>🔄 {{ template.useCount }}</span>
          </div>
          <div class="template-actions">
            <el-button text type="primary" @click="promptStore.collectTemplate(template.id)">收藏</el-button>
            <el-button text type="primary" @click="useTemplate(template)">使用</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="promptStore.marketTemplates.length === 0 && !promptStore.loading" description="暂无公开模板" />

    <!-- 创建模板弹窗 -->
    <el-dialog v-model="showCreateDialog" title="创建 Prompt 模板" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="createForm.name" placeholder="如：世界杯决赛前瞻分析" />
        </el-form-item>
        <el-form-item label="适配场景">
          <el-select v-model="createForm.scene" placeholder="选择场景">
            <el-option label="赛事前瞻" value="match_preview" />
            <el-option label="球队对比" value="team_compare" />
            <el-option label="球星分析" value="player_analysis" />
            <el-option label="出线推演" value="qualification_predict" />
            <el-option label="舆情研判" value="sentiment_analysis" />
          </el-select>
        </el-form-item>
        <el-form-item label="适配模型">
          <el-input v-model="createForm.adaptedModel" placeholder="如：DeepSeek、GPT-4（可选）" />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input v-model="createForm.content" type="textarea" :rows="8" placeholder="输入 Prompt 模板内容，支持变量占位符 {{match}}、{{team}}、{{player}} 等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTemplate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePromptStore } from '@/stores/prompt'

const promptStore = usePromptStore()
const router = useRouter()
const showCreateDialog = ref(false)

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
    ElMessage.success('模板创建成功')
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '创建失败')
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
