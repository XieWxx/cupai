<template>
  <div class="profile-view">
    <h1>{{ $t('nav.profile') }}</h1>

    <el-tabs v-model="activeTab">
      <!-- 个人信息 -->
      <el-tab-pane :label="$t('profile.personalInfo')" name="info">
        <el-card>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('common.username')">{{ userStore.user?.username }}</el-descriptions-item>
            <el-descriptions-item :label="$t('common.nickname')">{{ userStore.user?.nickname }}</el-descriptions-item>
            <el-descriptions-item :label="$t('common.language')">{{ userStore.user?.language }}</el-descriptions-item>
            <el-descriptions-item :label="$t('common.timezone')">{{ userStore.user?.timezone }}</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" style="margin-top: 16px" @click="showEditDialog = true">{{ $t('profile.editInfo') }}</el-button>
        </el-card>
      </el-tab-pane>

      <!-- AI 配置 -->
      <el-tab-pane :label="$t('profile.myApi')" name="ai">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ $t('profile.myApi') }}</span>
              <el-button type="primary" size="small" @click="$router.push('/analysis')">{{ $t('profile.manageConfig') }}</el-button>
            </div>
          </template>
          <el-table :data="analysisStore.aiConfigs" stripe>
            <el-table-column prop="modelName" :label="$t('common.model')" />
            <el-table-column prop="apiEndpoint" :label="$t('profile.apiAddress')" show-overflow-tooltip />
            <el-table-column prop="temperature" :label="$t('profile.temperature')" width="80" />
            <el-table-column prop="maxTokens" :label="$t('profile.maxToken')" width="100" />
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 权重模型 -->
      <el-tab-pane :label="$t('profile.myModels')" name="models">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ $t('profile.myModels') }}</span>
              <el-button type="primary" size="small" @click="$router.push('/analysis')">{{ $t('profile.manageModel') }}</el-button>
            </div>
          </template>
          <el-table :data="analysisStore.weightModels" stripe>
            <el-table-column prop="name" :label="$t('profile.templateName')" />
            <el-table-column :label="$t('profile.historyRecord')" width="90" align="center">
              <template #default="{ row }">{{ row.historicalRecord }}%</template>
            </el-table-column>
            <el-table-column :label="$t('profile.teamStrength')" width="90" align="center">
              <template #default="{ row }">{{ row.teamStrength }}%</template>
            </el-table-column>
            <el-table-column :label="$t('profile.playerStatus')" width="90" align="center">
              <template #default="{ row }">{{ row.playerStatus }}%</template>
            </el-table-column>
            <el-table-column :label="$t('profile.isDefault')" width="70" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.isDefault" type="success" size="small">{{ $t('common.yes') }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- Prompt 模板 -->
      <el-tab-pane :label="$t('profile.myTemplates')" name="templates">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ $t('profile.myTemplates') }}</span>
              <el-button type="primary" size="small" @click="$router.push('/prompt-market')">{{ $t('profile.manageTemplate') }}</el-button>
            </div>
          </template>
          <el-table :data="promptStore.myTemplates" stripe>
            <el-table-column prop="name" :label="$t('profile.templateName')" />
            <el-table-column prop="scene" :label="$t('profile.scene')" width="120" />
            <el-table-column :label="$t('profile.isPublic')" width="70" align="center">
              <template #default="{ row }">
                <el-switch :model-value="row.isPublic" @change="promptStore.toggleVisibility(row.id, !row.isPublic)" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="useCount" :label="$t('profile.usage')" width="80" align="center" />
            <el-table-column :label="$t('common.operation')" width="120" align="center">
              <template #default="{ row }">
                <el-button text type="danger" size="small" @click="promptStore.deleteTemplate(row.id)">{{ $t('common.delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 分析记录 -->
      <el-tab-pane :label="$t('profile.myAnalysis')" name="reports">
        <el-card>
          <el-table :data="analysisStore.reports" stripe>
            <el-table-column :label="$t('profile.match')" min-width="150">
              <template #default="{ row }">{{ row.matchId }}</template>
            </el-table-column>
            <el-table-column prop="llmType" :label="$t('common.model')" width="100" />
            <el-table-column :label="$t('common.source')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.source === 'agent' ? 'warning' : 'primary'" size="small">
                  {{ sourceLabel(row.source) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('profile.isPublic')" width="70" align="center">
              <template #default="{ row }">
                <el-switch
                  :model-value="row.isPublic"
                  :disabled="row.source === 'agent'"
                  @change="analysisStore.toggleReportVisibility(row.id, !row.isPublic)"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.time')" width="180">
              <template #default="{ row }">{{ new Date(row.createdAt).toLocaleString(i18nLocale) }}</template>
            </el-table-column>
            <el-table-column :label="$t('common.operation')" width="80" align="center">
              <template #default="{ row }">
                <el-button text type="danger" size="small" @click="analysisStore.deleteReport(row.id)">{{ $t('common.delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 我的收藏 -->
      <el-tab-pane :label="$t('profile.myCollections')" name="collections">
        <el-card>
          <el-table :data="collections" stripe>
            <el-table-column :label="$t('profile.reportContent')" min-width="200">
              <template #default="{ row }">{{ row.content?.substring(0, 100) }}...</template>
            </el-table-column>
            <el-table-column prop="llmType" :label="$t('common.model')" width="100" />
            <el-table-column :label="$t('common.source')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.source === 'agent' ? 'warning' : 'primary'" size="small">
                  {{ sourceLabel(row.source) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('profile.collectTime')" width="180">
              <template #default="{ row }">{{ new Date(row.collectedAt).toLocaleString(i18nLocale) }}</template>
            </el-table-column>
            <el-table-column :label="$t('common.operation')" width="80" align="center">
              <template #default="{ row }">
                <el-button text type="warning" size="small" @click="uncollect(row.id)">{{ $t('profile.uncollect') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="collections.length === 0" :description="$t('profile.noCollections')" />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑信息弹窗 -->
    <el-dialog v-model="showEditDialog" :title="$t('profile.editProfile')" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item :label="$t('common.nickname')">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item :label="$t('common.language')">
          <el-select v-model="editForm.language">
            <el-option v-for="(label, code) in localeLabels" :key="code" :label="label" :value="code" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.timezone')">
          <el-select v-model="editForm.timezone">
            <el-option label="Asia/Shanghai" value="Asia/Shanghai" />
            <el-option label="America/New_York" value="America/New_York" />
            <el-option label="Europe/London" value="Europe/London" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveProfile">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAnalysisStore } from '@/stores/analysis'
import { usePromptStore } from '@/stores/prompt'
import { http } from '@/api/request'

const { t, locale: i18nLocale } = useI18n()
const userStore = useUserStore()
const analysisStore = useAnalysisStore()
const promptStore = usePromptStore()

const activeTab = ref('info')
const showEditDialog = ref(false)
const collections = ref<any[]>([])

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

// 报告来源标签映射（响应式）
const sourceLabels = computed<Record<string, string>>(() => ({
  agent: t('match.sourceAgent'),
  manual: t('match.sourceManual'),
}))

function sourceLabel(source: string | undefined): string {
  if (!source) return '-'
  return sourceLabels.value[source] || source
}

const editForm = reactive({
  nickname: '',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
})

async function saveProfile() {
  try {
    await userStore.updateProfile(editForm)
    showEditDialog.value = false
    // 同步更新 i18n 语言
    if (editForm.language && editForm.language !== i18nLocale.value) {
      i18nLocale.value = editForm.language
      localStorage.setItem('locale', editForm.language)
    }
    ElMessage.success(t('profile.infoUpdated'))
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || t('profile.updateFail'))
  }
}

// 加载我的收藏
async function loadCollections() {
  try {
    const res = await http.get<any[]>('/analysis/interactions/collections')
    collections.value = res || []
  } catch {
    // 未登录或查询失败
  }
}

// 取消收藏
async function uncollect(reportId: string) {
  try {
    await http.post('/analysis/interaction', { reportId, type: 'collect' })
    collections.value = collections.value.filter((c: any) => c.id !== reportId)
    ElMessage.success(t('profile.uncollected'))
  } catch {
    ElMessage.error(t('common.fail'))
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      userStore.fetchProfile(),
      analysisStore.fetchAiConfigs(),
      analysisStore.fetchWeightModels(),
      analysisStore.fetchMyReports(),
      promptStore.fetchMyTemplates(),
      loadCollections(),
    ])
    // 填充编辑表单
    editForm.nickname = userStore.user?.nickname || ''
    editForm.language = userStore.user?.language || 'zh-CN'
    editForm.timezone = userStore.user?.timezone || 'Asia/Shanghai'
  } catch {
    // 后端未启动时忽略
  }
})
</script>

<style scoped>
.profile-view h1 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #1a1a2e;
}
</style>
