<template>
  <div class="analysis-center-view">
    <h1>{{ $t('nav.analysisCenter') }}</h1>

    <el-row :gutter="24">
      <!-- 左侧：配置面板 -->
      <el-col :span="8">
        <!-- AI 配置 -->
        <el-card class="config-card">
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
        <el-card class="config-card" style="margin-top: 16px">
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
        <el-card>
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
        <el-card style="margin-top: 16px" v-if="analysisResult">
          <template #header>{{ $t('analysis.analysisResult') }}</template>
          <div class="analysis-result" v-html="renderedResult"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI 配置弹窗 -->
    <el-dialog v-model="showAiConfigDialog" :title="$t('analysis.addApiConfig')" width="500px">
      <el-form :model="aiConfigForm" label-width="100px">
        <el-form-item :label="$t('analysis.modelName')">
          <el-select v-model="aiConfigForm.modelName" :placeholder="$t('analysis.selectModel')">
            <el-option :label="$t('analysis.modelDeepseek')" value="deepseek" />
            <el-option :label="$t('analysis.modelGPT')" value="gpt" />
            <el-option :label="$t('analysis.modelQwen')" value="qwen" />
            <el-option :label="$t('analysis.modelDoubao')" value="doubao" />
            <el-option :label="$t('analysis.modelCustom')" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('analysis.apiAddress')">
          <el-input v-model="aiConfigForm.apiEndpoint" placeholder="https://api.example.com/v1" />
        </el-form-item>
        <el-form-item :label="$t('analysis.apiKey')">
          <el-input v-model="aiConfigForm.apiKey" type="password" :placeholder="$t('analysis.apiKeyHint')" show-password />
        </el-form-item>
        <el-form-item :label="$t('analysis.temperatureParam')">
          <el-slider v-model="aiConfigForm.temperature" :min="0" :max="1" :step="0.1" show-input />
        </el-form-item>
        <el-form-item :label="$t('analysis.maxToken')">
          <el-input-number v-model="aiConfigForm.maxTokens" :min="256" :max="32768" :step="256" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAiConfigDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveAiConfig">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 权重模型弹窗 -->
    <el-dialog v-model="showWeightDialog" :title="$t('analysis.weightModelConfig')" width="700px">
      <el-row :gutter="24">
        <el-col :span="14">
          <el-form :model="weightForm" label-width="120px">
            <el-form-item :label="$t('analysis.modelName')">
              <el-input v-model="weightForm.name" :placeholder="$t('analysis.weightModelNameHint')" />
            </el-form-item>
            <el-form-item v-for="factor in factorList" :key="factor.key" :label="factor.label">
              <el-slider v-model="weightForm[factor.key]" :min="0" :max="60" :step="1" show-input />
            </el-form-item>
            <el-form-item>
              <el-alert :title="`${$t('analysis.weightSum')}: ${weightSum}%（${$t('analysis.weightMust100')}）`" :type="weightSum === 100 ? 'success' : 'error'" show-icon :closable="false" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="10">
          <EChartsView :option="radarOption" width="100%" height="320px" />
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="showWeightDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :disabled="weightSum !== 100" @click="saveWeightModel">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useAnalysisStore } from '@/stores/analysis'
import { useMatchStore } from '@/stores/match'
import { usePromptStore } from '@/stores/prompt'
import { FACTOR_KEYS } from '@cupai/constants'
import { renderMarkdown } from '@/utils/markdown'
import EChartsView from '@/components/common/EChartsView.vue'

const { t } = useI18n()
const analysisStore = useAnalysisStore()
const matchStore = useMatchStore()
const promptStore = usePromptStore()

const analyzing = ref(false)
const analysisResult = ref('')
const showAiConfigDialog = ref(false)
const showWeightDialog = ref(false)

// 因子标签映射（响应式，支持国际化）
const factorLabels = computed<Record<string, string>>(() => ({
  historicalRecord: t('factor.historicalRecord'),
  teamStrength: t('factor.teamStrength'),
  playerStatus: t('factor.playerStatus'),
  realtimeDynamic: t('factor.realtimeDynamic'),
  environment: t('factor.environment'),
  tacticalCounter: t('factor.tacticalCounter'),
  socialSentiment: t('factor.socialSentiment'),
  hiddenFactors: t('factor.hiddenFactors'),
}))

// 因子列表（使用 i18n 标签）
const factorList = computed(() => FACTOR_KEYS.map((key) => ({ key, label: factorLabels.value[key] })))

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
  apiKey: '',
  temperature: 0.7,
  maxTokens: 4096,
})

// 权重表单
const weightForm = reactive<Record<string, number>>({
  name: 0 as unknown as number,
  historicalRecord: 18,
  teamStrength: 18,
  playerStatus: 14,
  realtimeDynamic: 12,
  environment: 10,
  tacticalCounter: 5,
  socialSentiment: 8,
  hiddenFactors: 15,
})

// 权重总和
const weightSum = computed(() => {
  return FACTOR_KEYS.reduce((sum, key) => sum + (Number(weightForm[key]) || 0), 0)
})

// 渲染 Markdown 结果
const renderedResult = computed(() => {
  return renderMarkdown(analysisResult.value)
})

// 权重雷达图配置
const radarOption = computed(() => ({
  tooltip: { trigger: 'item' },
  radar: {
    indicator: FACTOR_KEYS.map((key) => ({
      name: factorLabels.value[key],
      max: 60,
    })),
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: FACTOR_KEYS.map((key) => Number(weightForm[key]) || 0),
          name: weightForm.name || t('analysis.currentModel'),
          areaStyle: { opacity: 0.3 },
        },
      ],
    },
  ],
}))

// 保存 AI 配置
async function saveAiConfig() {
  try {
    await analysisStore.createAiConfig({
      modelName: aiConfigForm.modelName,
      apiEndpoint: aiConfigForm.apiEndpoint,
      temperature: aiConfigForm.temperature,
      maxTokens: aiConfigForm.maxTokens,
    })
    // API Key 仅前端加密存储，不传后端
    if (aiConfigForm.apiKey) {
      localStorage.setItem(`cupai_apikey_${aiConfigForm.modelName}`, btoa(aiConfigForm.apiKey))
    }
    showAiConfigDialog.value = false
    ElMessage.success(t('analysis.apiConfigSaved'))
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || t('analysis.saveFail'))
  }
}

// 保存权重模型
async function saveWeightModel() {
  try {
    const data: any = { name: weightForm.name }
    FACTOR_KEYS.forEach((key) => {
      data[key] = Number(weightForm[key])
    })
    await analysisStore.createWeightModel(data)
    showWeightDialog.value = false
    ElMessage.success(t('analysis.weightModelSaved'))
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || t('analysis.saveFail'))
  }
}

// 编辑权重模型
function editWeightModel(model: any) {
  weightForm.name = model.name
  FACTOR_KEYS.forEach((key) => {
    weightForm[key] = Number(model[key])
  })
  showWeightDialog.value = true
}

// 开始分析（完整闭环：选赛事→选配置→选权重→选Prompt→调AI→生成报告）
async function startAnalysis() {
  // 表单校验
  if (!analysisForm.matchId) {
    ElMessage.warning(t('analysis.selectMatchFirst'))
    return
  }
  if (!analysisForm.modelId) {
    ElMessage.warning(t('analysis.selectApiConfigFirst'))
    return
  }

  // 从 localStorage 解密 API Key
  const selectedConfig = analysisStore.aiConfigs.find((c: any) => c.id === analysisForm.modelId)
  if (!selectedConfig) {
    ElMessage.error(t('analysis.apiConfigNotFound'))
    return
  }

  const encryptedKey = localStorage.getItem(`cupai_apikey_${selectedConfig.modelName}`)
  if (!encryptedKey) {
    ElMessage.warning(t('analysis.apiKeyNotFound'))
    return
  }

  const apiKey = atob(encryptedKey)

  analyzing.value = true
  analysisResult.value = ''
  try {
    ElMessage.info(t('analysis.generatingAnalysis'))

    const result = await analysisStore.generateAnalysis({
      matchId: analysisForm.matchId,
      aiConfigId: analysisForm.modelId,
      weightModelId: analysisForm.weightModelId || undefined,
      promptTemplateId: analysisForm.promptTemplateId || undefined,
      apiKey,
      isPublic: false,
      displayLanguage: navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US',
    })

    // 展示 AI 生成的分析结果
    analysisResult.value = result?.content || t('analysis.analysisEmpty')
    ElMessage.success(t('analysis.generateSuccess'))
  } catch (err: any) {
    const status = err?.response?.status
    const msg = err?.response?.data?.message || err?.message || t('analysis.generateFail')
    // 根据 HTTP 状态码分类错误提示（避免依赖中文关键词匹配）
    if (status === 401 || status === 403) {
      ElMessage.error(t('analysis.apiKeyInvalid'))
    } else if (status === 408 || status === 504) {
      ElMessage.error(t('analysis.aiTimeout'))
    } else {
      ElMessage.error(msg)
    }
  } finally {
    analyzing.value = false
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
  } catch {
    // 后端未启动时忽略
  }
})
</script>

<style scoped>
.analysis-center-view h1 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.config-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-endpoint {
  font-size: 12px;
  color: #999;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.model-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-name {
  font-weight: 600;
}

.analysis-result {
  line-height: 1.8;
  color: #333;
}
</style>
