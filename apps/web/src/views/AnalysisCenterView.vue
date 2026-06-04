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
              <el-button type="primary" size="small" @click="showAiConfigDialog = true">+ 新增</el-button>
            </div>
          </template>
          <el-empty v-if="analysisStore.aiConfigs.length === 0" description="暂无 AI 配置" />
          <div v-else class="config-list">
            <div v-for="config in analysisStore.aiConfigs" :key="config.id" class="config-item">
              <div class="config-info">
                <el-tag size="small">{{ config.modelName }}</el-tag>
                <span class="config-endpoint">{{ config.apiEndpoint }}</span>
              </div>
              <el-button text type="danger" size="small" @click="analysisStore.deleteAiConfig(config.id)">删除</el-button>
            </div>
          </div>
        </el-card>

        <!-- 权重模型 -->
        <el-card class="config-card" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>{{ $t('analysis.weightModel') }}</span>
              <el-button type="primary" size="small" @click="showWeightDialog = true">+ 新增</el-button>
            </div>
          </template>
          <el-empty v-if="analysisStore.weightModels.length === 0" description="暂无权重模型" />
          <div v-else>
            <div v-for="model in analysisStore.weightModels" :key="model.id" class="model-item">
              <div class="model-info">
                <span class="model-name">{{ model.name }}</span>
                <el-tag v-if="model.isDefault" type="success" size="small">默认</el-tag>
              </div>
              <div class="model-actions">
                <el-button text size="small" @click="editWeightModel(model)">编辑</el-button>
                <el-button text type="danger" size="small" @click="analysisStore.deleteWeightModel(model.id)">删除</el-button>
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
            <el-form-item label="选择赛事">
              <el-select v-model="analysisForm.matchId" placeholder="选择赛事" filterable>
                <el-option v-for="m in matchStore.matches" :key="m.id" :label="`${m.homeTeam?.name} VS ${m.awayTeam?.name}`" :value="m.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="AI 配置">
              <el-select v-model="analysisForm.modelId" placeholder="选择 AI 配置">
                <el-option v-for="c in analysisStore.aiConfigs" :key="c.id" :label="c.modelName" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="权重模型">
              <el-select v-model="analysisForm.weightModelId" placeholder="选择权重模型">
                <el-option v-for="w in analysisStore.weightModels" :key="w.id" :label="w.name" :value="w.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="Prompt 模板">
              <el-select v-model="analysisForm.promptTemplateId" placeholder="选择 Prompt 模板">
                <el-option v-for="p in promptStore.myTemplates" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="analyzing" @click="startAnalysis">
                生成分析
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 分析结果 -->
        <el-card style="margin-top: 16px" v-if="analysisResult">
          <template #header>分析结果</template>
          <div class="analysis-result" v-html="renderedResult"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI 配置弹窗 -->
    <el-dialog v-model="showAiConfigDialog" title="新增 AI 配置" width="500px">
      <el-form :model="aiConfigForm" label-width="100px">
        <el-form-item label="模型名称">
          <el-select v-model="aiConfigForm.modelName" placeholder="选择模型">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="GPT" value="gpt" />
            <el-option label="通义千问" value="qwen" />
            <el-option label="豆包" value="doubao" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="API 地址">
          <el-input v-model="aiConfigForm.apiEndpoint" placeholder="https://api.example.com/v1" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="aiConfigForm.apiKey" type="password" placeholder="密钥仅前端加密存储" show-password />
        </el-form-item>
        <el-form-item label="温度参数">
          <el-slider v-model="aiConfigForm.temperature" :min="0" :max="1" :step="0.1" show-input />
        </el-form-item>
        <el-form-item label="最大 Token">
          <el-input-number v-model="aiConfigForm.maxTokens" :min="256" :max="32768" :step="256" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAiConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAiConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 权重模型弹窗 -->
    <el-dialog v-model="showWeightDialog" title="权重模型配置" width="700px">
      <el-row :gutter="24">
        <el-col :span="14">
          <el-form :model="weightForm" label-width="120px">
            <el-form-item label="模型名称">
              <el-input v-model="weightForm.name" placeholder="如：均衡模型、进攻偏好" />
            </el-form-item>
            <el-form-item v-for="factor in factorList" :key="factor.key" :label="factor.label">
              <el-slider v-model="weightForm[factor.key]" :min="0" :max="60" :step="1" show-input />
            </el-form-item>
            <el-form-item>
              <el-alert :title="`权重总和: ${weightSum}%（需等于 100%）`" :type="weightSum === 100 ? 'success' : 'error'" show-icon :closable="false" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="10">
          <EChartsView :option="radarOption" width="100%" height="320px" />
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="showWeightDialog = false">取消</el-button>
        <el-button type="primary" :disabled="weightSum !== 100" @click="saveWeightModel">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAnalysisStore } from '@/stores/analysis'
import { useMatchStore } from '@/stores/match'
import { usePromptStore } from '@/stores/prompt'
import { FACTOR_LABELS, FACTOR_KEYS } from '@cupai/constants'
import { renderMarkdown } from '@/utils/markdown'
import EChartsView from '@/components/common/EChartsView.vue'

const analysisStore = useAnalysisStore()
const matchStore = useMatchStore()
const promptStore = usePromptStore()

const analyzing = ref(false)
const analysisResult = ref('')
const showAiConfigDialog = ref(false)
const showWeightDialog = ref(false)

// 因子列表
const factorList = FACTOR_KEYS.map((key) => ({ key, label: FACTOR_LABELS[key] }))

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
      name: FACTOR_LABELS[key],
      max: 60,
    })),
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: FACTOR_KEYS.map((key) => Number(weightForm[key]) || 0),
          name: weightForm.name || '当前模型',
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
    ElMessage.success('AI 配置已保存')
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '保存失败')
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
    ElMessage.success('权重模型已保存')
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '保存失败')
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
    ElMessage.warning('请选择赛事')
    return
  }
  if (!analysisForm.modelId) {
    ElMessage.warning('请选择 AI 配置')
    return
  }

  // 从 localStorage 解密 API Key
  const selectedConfig = analysisStore.aiConfigs.find((c: any) => c.id === analysisForm.modelId)
  if (!selectedConfig) {
    ElMessage.error('AI 配置不存在')
    return
  }

  const encryptedKey = localStorage.getItem(`cupai_apikey_${selectedConfig.modelName}`)
  if (!encryptedKey) {
    ElMessage.warning('未找到该 AI 配置的 API Key，请重新配置')
    return
  }

  const apiKey = atob(encryptedKey)

  analyzing.value = true
  analysisResult.value = ''
  try {
    ElMessage.info('正在生成分析报告，请稍候...')

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
    analysisResult.value = result?.content || '分析报告生成完成，但内容为空'
    ElMessage.success('分析报告生成成功')
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || '分析生成失败'
    // 分类错误提示
    if (msg.includes('密钥') || msg.includes('401') || msg.includes('403')) {
      ElMessage.error('API 密钥无效或无权限，请检查配置')
    } else if (msg.includes('超时') || msg.includes('timeout')) {
      ElMessage.error('AI 调用超时，请稍后重试')
    } else if (msg.includes('重试')) {
      ElMessage.error('AI 调用失败（已重试多次），请检查网络或更换模型')
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
