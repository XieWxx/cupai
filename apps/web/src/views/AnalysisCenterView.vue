<template>
  <div class="analysis-center-view">
    <header class="page-header">
      <h1 class="page-title">{{ $t('nav.analysisCenter') }}</h1>
    </header>

    <el-row :gutter="24">
      <!-- 左侧：配置面板 -->
      <el-col :span="8">
        <!-- AI 配置 -->
        <el-card class="common-card config-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('analysis.apiConfig') }}</span>
              <el-button type="primary" size="small" @click="showAiConfigDialog = true">{{ $t('common.addNew') }}</el-button>
            </div>
          </template>
          <el-empty v-if="analysisStore.aiConfigs.length === 0" :description="$t('analysis.noApiConfig')" />
          <div v-else class="config-list">
            <div v-for="config in analysisStore.aiConfigs" :key="config.id" class="config-item">
              <div class="config-info">
                <el-tag size="small">{{ config.modelName }}</el-tag>
                <span class="config-endpoint">{{ config.apiEndpoint }}</span>
              </div>
              <el-button text type="danger" size="small" @click="analysisStore.deleteAiConfig(config.id)">{{ $t('common.delete') }}</el-button>
            </div>
          </div>
        </el-card>

        <!-- 权重模型 -->
        <el-card class="common-card config-card" style="margin-top: var(--space-4)">
          <template #header>
            <div class="card-header">
              <span>{{ $t('analysis.weightModel') }}</span>
              <el-button type="primary" size="small" @click="showWeightDialog = true">{{ $t('common.addNew') }}</el-button>
            </div>
          </template>
          <el-empty v-if="analysisStore.weightModels.length === 0" :description="$t('analysis.noWeightModel')" />
          <div v-else>
            <div v-for="model in analysisStore.weightModels" :key="model.id" class="model-item">
              <div class="model-info">
                <span class="model-name">{{ model.name }}</span>
                <el-tag v-if="model.isDefault" type="success" size="small">{{ $t('common.default') }}</el-tag>
              </div>
              <div class="model-actions">
                <el-button text size="small" @click="editWeightModel(model)">{{ $t('common.edit') }}</el-button>
                <el-button text type="danger" size="small" @click="analysisStore.deleteWeightModel(model.id)">{{ $t('common.delete') }}</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：分析操作 -->
      <el-col :span="16">
        <el-card class="common-card">
          <template #header>{{ $t('analysis.manualAnalysis') }}</template>
          <el-form :model="analysisForm" label-width="100px">
            <el-form-item :label="$t('analysis.selectMatch')">
              <el-select v-model="analysisForm.matchId" :placeholder="$t('analysis.selectMatch')" filterable>
                <el-option v-for="m in matchStore.matches" :key="m.id" :label="`${m.homeTeam?.name} VS ${m.awayTeam?.name}`" :value="m.id" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('analysis.selectApiConfig')">
              <el-select v-model="analysisForm.modelId" :placeholder="$t('analysis.selectApiConfig')">
                <el-option v-for="c in analysisStore.aiConfigs" :key="c.id" :label="c.modelName" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('analysis.selectWeightModel')">
              <el-select v-model="analysisForm.weightModelId" :placeholder="$t('analysis.selectWeightModel')">
                <el-option v-for="w in analysisStore.weightModels" :key="w.id" :label="w.name" :value="w.id" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('analysis.selectPromptTemplate')">
              <el-select v-model="analysisForm.promptTemplateId" :placeholder="$t('analysis.selectPromptTemplate')">
                <el-option v-for="p in promptStore.myTemplates" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="analyzing" @click="startAnalysis">
                {{ $t('analysis.generateAnalysis') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 分析结果 -->
        <el-card class="common-card" style="margin-top: var(--space-4)">
          <template #header>{{ $t('analysis.result') }}</template>
          <div v-if="analysisResult" class="analysis-result" v-html="renderMarkdown(analysisResult)"></div>
          <el-empty v-else :description="$t('analysis.noResult')" />
        </el-card>
      </el-col>
    </el-row>

    <!-- AI 配置弹窗 -->
    <el-dialog v-model="showAiConfigDialog" :title="$t('common.addNew')" width="500px">
      <el-form :model="aiConfigForm" label-width="100px">
        <el-form-item :label="$t('common.model')">
          <el-input v-model="aiConfigForm.modelName" />
        </el-form-item>
        <el-form-item :label="$t('profile.apiAddress')">
          <el-input v-model="aiConfigForm.apiEndpoint" />
        </el-form-item>
        <el-form-item :label="$t('profile.temperature')">
          <el-input-number v-model="aiConfigForm.temperature" :min="0" :max="2" :step="0.1" />
        </el-form-item>
        <el-form-item :label="$t('profile.maxToken')">
          <el-input-number v-model="aiConfigForm.maxTokens" :min="100" :max="8192" :step="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAiConfigDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveAiConfig">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 权重模型弹窗 -->
    <el-dialog v-model="showWeightDialog" :title="$t('profile.myModels')" width="500px">
      <el-form :model="weightForm" label-width="120px">
        <el-form-item :label="$t('profile.templateName')">
          <el-input v-model="weightForm.name" />
        </el-form-item>
        <el-form-item :label="$t('profile.historyRecord')">
          <el-input-number v-model="weightForm.historicalRecord" :min="0" :max="100" :step="5" />
        </el-form-item>
        <el-form-item :label="$t('profile.teamStrength')">
          <el-input-number v-model="weightForm.teamStrength" :min="0" :max="100" :step="5" />
        </el-form-item>
        <el-form-item :label="$t('profile.playerStatus')">
          <el-input-number v-model="weightForm.playerStatus" :min="0" :max="100" :step="5" />
        </el-form-item>
        <el-form-item :label="$t('profile.isDefault')">
          <el-switch v-model="weightForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showWeightDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveWeightModel">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useAnalysisStore } from '@/stores/analysis'
import { useMatchStore } from '@/stores/match'
import { usePromptStore } from '@/stores/prompt'
import { http } from '@/api/request'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

const analysisStore = useAnalysisStore()
const matchStore = useMatchStore()
const promptStore = usePromptStore()
const { t } = useI18n()

const analyzing = ref(false)
const analysisResult = ref('')
const showAiConfigDialog = ref(false)
const showWeightDialog = ref(false)

// 分析表单
const analysisForm = reactive({
  matchId: '',
  modelId: '',
  weightModelId: '',
  promptTemplateId: '',
})

// AI 配置表单
const aiConfigForm = reactive({
  modelName: '',
  apiEndpoint: '',
  temperature: 0.7,
  maxTokens: 2048,
})

// 权重模型表单
const weightForm = reactive({
  id: '',
  name: '',
  historicalRecord: 33,
  teamStrength: 33,
  playerStatus: 34,
  isDefault: false,
})

function renderMarkdown(content: string): string {
  return md.render(content)
}

async function startAnalysis() {
  if (!analysisForm.matchId || !analysisForm.modelId || !analysisForm.weightModelId || !analysisForm.promptTemplateId) {
    ElMessage.warning(t('analysis.fillRequired'))
    return
  }
  analyzing.value = true
  try {
    const res: any = await http.post('/analysis/manual', {
      matchId: analysisForm.matchId,
      modelId: analysisForm.modelId,
      weightModelId: analysisForm.weightModelId,
      promptTemplateId: analysisForm.promptTemplateId,
    })
    analysisResult.value = res?.content || ''
    ElMessage.success(t('analysis.generateSuccess'))
  } catch (err: any) {
    const msg = err?.response?.data?.message || t('common.fail')
    ElMessage.error(msg)
  } finally {
    analyzing.value = false
  }
}

function editWeightModel(model: any) {
  weightForm.id = model.id
  weightForm.name = model.name
  weightForm.historicalRecord = model.historicalRecord || 33
  weightForm.teamStrength = model.teamStrength || 33
  weightForm.playerStatus = model.playerStatus || 34
  weightForm.isDefault = model.isDefault || false
  showWeightDialog.value = true
}

async function saveAiConfig() {
  try {
    await analysisStore.createAiConfig(aiConfigForm)
    showAiConfigDialog.value = false
    ElMessage.success(t('analysis.apiConfigSaved'))
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || t('analysis.saveFail'))
  }
}

async function saveWeightModel() {
  try {
    await analysisStore.createWeightModel(weightForm)
    showWeightDialog.value = false
    ElMessage.success(t('analysis.weightModelSaved'))
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || t('analysis.saveFail'))
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      analysisStore.fetchAiConfigs(),
      analysisStore.fetchWeightModels(),
      promptStore.fetchMyTemplates(),
      matchStore.fetchMatches(),
    ])
  } catch (err) {
    console.error('[AnalysisCenterView] initial load failed:', err)
  }
})
</script>

<style scoped>
.analysis-center-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* .page-header、.card-header 使用全局样式 */

.config-item,
.model-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.config-item:last-child,
.model-item:last-child {
  border-bottom: none;
}

.config-info,
.model-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.config-endpoint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-name {
  font-weight: var(--font-semibold);
}

.analysis-result {
  line-height: var(--leading-relaxed);
  color: var(--color-text-regular);
}

@media (max-width: 768px) {
  .analysis-center-view :deep(.el-col) {
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
}

@media (max-width: 480px) {
  .analysis-center-view :deep(.el-col) {
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
}
</style>
