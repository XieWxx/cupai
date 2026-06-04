<template>
  <div class="profile-view">
    <h1>{{ $t('nav.profile') }}</h1>

    <el-tabs v-model="activeTab">
      <!-- 个人信息 -->
      <el-tab-pane label="个人信息" name="info">
        <el-card>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ userStore.user?.username }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ userStore.user?.nickname }}</el-descriptions-item>
            <el-descriptions-item label="语言">{{ userStore.user?.language }}</el-descriptions-item>
            <el-descriptions-item label="时区">{{ userStore.user?.timezone }}</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" style="margin-top: 16px" @click="showEditDialog = true">编辑信息</el-button>
        </el-card>
      </el-tab-pane>

      <!-- AI 配置 -->
      <el-tab-pane :label="$t('profile.myApi')" name="ai">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ $t('profile.myApi') }}</span>
              <el-button type="primary" size="small" @click="$router.push('/analysis')">管理配置</el-button>
            </div>
          </template>
          <el-table :data="analysisStore.aiConfigs" stripe>
            <el-table-column prop="modelName" label="模型" />
            <el-table-column prop="apiEndpoint" label="API 地址" show-overflow-tooltip />
            <el-table-column prop="temperature" label="温度" width="80" />
            <el-table-column prop="maxTokens" label="最大Token" width="100" />
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 权重模型 -->
      <el-tab-pane :label="$t('profile.myModels')" name="models">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ $t('profile.myModels') }}</span>
              <el-button type="primary" size="small" @click="$router.push('/analysis')">管理模型</el-button>
            </div>
          </template>
          <el-table :data="analysisStore.weightModels" stripe>
            <el-table-column prop="name" label="模型名称" />
            <el-table-column label="历史战绩" width="90" align="center">
              <template #default="{ row }">{{ row.historicalRecord }}%</template>
            </el-table-column>
            <el-table-column label="球队实力" width="90" align="center">
              <template #default="{ row }">{{ row.teamStrength }}%</template>
            </el-table-column>
            <el-table-column label="球星状态" width="90" align="center">
              <template #default="{ row }">{{ row.playerStatus }}%</template>
            </el-table-column>
            <el-table-column label="默认" width="70" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.isDefault" type="success" size="small">是</el-tag>
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
              <el-button type="primary" size="small" @click="$router.push('/prompt-market')">管理模板</el-button>
            </div>
          </template>
          <el-table :data="promptStore.myTemplates" stripe>
            <el-table-column prop="name" label="模板名称" />
            <el-table-column prop="scene" label="场景" width="120" />
            <el-table-column label="公开" width="70" align="center">
              <template #default="{ row }">
                <el-switch :model-value="row.isPublic" @change="promptStore.toggleVisibility(row.id, !row.isPublic)" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="useCount" label="使用量" width="80" align="center" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button text type="danger" size="small" @click="promptStore.deleteTemplate(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 分析记录 -->
      <el-tab-pane :label="$t('profile.myAnalysis')" name="reports">
        <el-card>
          <el-table :data="analysisStore.reports" stripe>
            <el-table-column label="赛事" min-width="150">
              <template #default="{ row }">{{ row.matchId }}</template>
            </el-table-column>
            <el-table-column prop="llmType" label="模型" width="100" />
            <el-table-column label="来源" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.source === 'agent' ? 'warning' : 'primary'" size="small">
                  {{ row.source === 'agent' ? 'Agent' : '手动' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="公开" width="70" align="center">
              <template #default="{ row }">
                <el-switch
                  :model-value="row.isPublic"
                  :disabled="row.source === 'agent'"
                  @change="analysisStore.toggleReportVisibility(row.id, !row.isPublic)"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="时间" width="180">
              <template #default="{ row }">{{ new Date(row.createdAt).toLocaleString('zh-CN') }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button text type="danger" size="small" @click="analysisStore.deleteReport(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑信息弹窗 -->
    <el-dialog v-model="showEditDialog" title="编辑个人信息" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="语言">
          <el-select v-model="editForm.language">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>
        <el-form-item label="时区">
          <el-select v-model="editForm.timezone">
            <el-option label="Asia/Shanghai" value="Asia/Shanghai" />
            <el-option label="America/New_York" value="America/New_York" />
            <el-option label="Europe/London" value="Europe/London" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAnalysisStore } from '@/stores/analysis'
import { usePromptStore } from '@/stores/prompt'

const userStore = useUserStore()
const analysisStore = useAnalysisStore()
const promptStore = usePromptStore()

const activeTab = ref('info')
const showEditDialog = ref(false)

const editForm = reactive({
  nickname: '',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
})

async function saveProfile() {
  try {
    await userStore.updateProfile(editForm)
    showEditDialog.value = false
    ElMessage.success('信息已更新')
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '更新失败')
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
