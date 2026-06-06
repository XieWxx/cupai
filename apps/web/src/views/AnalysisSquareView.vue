<template>
  <div class="analysis-square-view">
    <h1>{{ $t('nav.analysisSquare') }}</h1>

    <!-- 筛选栏 -->
    <el-row :gutter="16" class="filter-bar">
      <el-col :span="6">
        <el-select v-model="filters.source" :placeholder="$t('square.sourceFilter')" clearable @change="loadReports">
          <el-option :label="$t('square.all')" value="" />
          <el-option :label="$t('square.agentLabel')" value="agent" />
          <el-option :label="$t('square.userLabel')" value="manual" />
        </el-select>
      </el-col>
    </el-row>

    <!-- 报告列表 -->
    <div v-loading="analysisStore.loading">
      <el-card v-for="report in analysisStore.publicReports" :key="report.id" class="report-card" shadow="hover">
        <template #header>
          <div class="report-header">
            <div class="report-meta">
              <el-tag :type="report.source === 'agent' ? 'warning' : 'primary'" size="small">
                {{ report.source === 'agent' ? $t('square.agentLabel') : $t('square.userLabel') }}
              </el-tag>
              <span class="report-time">{{ new Date(report.createdAt).toLocaleString(i18nLocale) }}</span>
            </div>
            <div class="report-stats">
              <span>👍 {{ report.likeCount }}</span>
              <span>⭐ {{ report.collectCount }}</span>
            </div>
          </div>
        </template>
        <div class="report-content markdown-body" v-html="renderMarkdown(report.content?.substring(0, 600))"></div>
        <div class="report-footer">
          <span class="report-model">{{ $t('square.modelLabel') }} {{ report.llmType }}</span>
          <span class="report-lang">{{ $t('square.languageLabel') }} {{ displayLanguageLabel(report.displayLanguage) }}</span>
          <span class="report-source" v-if="report.weightSnapshot">{{ $t('square.weightSnapshot') }} {{ formatWeights(report.weightSnapshot) }}</span>
          <!-- 点赞/收藏按钮 -->
          <div class="report-actions">
            <el-button
              :type="interactionMap[report.id]?.like ? 'primary' : 'default'"
              size="small"
              text
              @click="toggleLike(report.id)"
            >
              {{ interactionMap[report.id]?.like ? $t('analysis.liked') : $t('analysis.like') }}
            </el-button>
            <el-button
              :type="interactionMap[report.id]?.collect ? 'warning' : 'default'"
              size="small"
              text
              @click="toggleCollect(report.id)"
            >
              {{ interactionMap[report.id]?.collect ? $t('analysis.collected') : $t('analysis.collect') }}
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty v-if="analysisStore.publicReports.length === 0 && !analysisStore.loading" :description="$t('square.noPublicAnalysis')" />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useAnalysisStore } from '@/stores/analysis'
import { http } from '@/api/request'
import { subscribeSquare } from '@/api/websocket'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const { t, locale: i18nLocale } = useI18n()

// 渲染 Markdown 内容
function renderMarkdown(content: string | undefined): string {
  if (!content) return ''
  return md.render(content)
}

// 格式化权重快照
function formatWeights(weights: Record<string, number>): string {
  if (!weights) return ''
  return Object.entries(weights)
    .map(([k, v]) => `${k}: ${v}%`)
    .join(', ')
}

const analysisStore = useAnalysisStore()

// 用户互动状态映射 { reportId: { like, collect } }
const interactionMap = reactive<Record<string, { like: boolean; collect: boolean }>>({})

const filters = reactive({
  source: '',
})

async function loadReports() {
  await analysisStore.fetchPublicReports({
    source: filters.source || undefined,
  })
  // 加载完成后查询用户互动状态
  await loadInteractions()
}

// 批量查询用户对报告的互动状态
async function loadInteractions() {
  const reportIds = analysisStore.publicReports.map((r: any) => r.id)
  if (reportIds.length === 0) return

  try {
    const token = localStorage.getItem('cupai_token')
    if (!token) return // 未登录不查询

    const res = await http.post<Record<string, { like: boolean; collect: boolean }>>(
      '/analysis/interactions/check',
      { reportIds },
    )
    Object.assign(interactionMap, res)
  } catch {
    // 未登录或查询失败，忽略
  }
}

// 点赞（toggle）
async function toggleLike(reportId: string) {
  try {
    const res = await http.post<{ action: string; type: string }>('/analysis/interaction', {
      reportId,
      type: 'like',
    })
    // 更新本地状态
    if (!interactionMap[reportId]) interactionMap[reportId] = { like: false, collect: false }
    interactionMap[reportId].like = res.action === 'added'
    // 更新列表中的计数
    const report = analysisStore.publicReports.find((r: any) => r.id === reportId)
    if (report) {
      report.likeCount = (report.likeCount || 0) + (res.action === 'added' ? 1 : -1)
    }
  } catch {
    ElMessage.error(t('common.loginRequired'))
  }
}

// 收藏（toggle）
async function toggleCollect(reportId: string) {
  try {
    const res = await http.post<{ action: string; type: string }>('/analysis/interaction', {
      reportId,
      type: 'collect',
    })
    if (!interactionMap[reportId]) interactionMap[reportId] = { like: false, collect: false }
    interactionMap[reportId].collect = res.action === 'added'
    const report = analysisStore.publicReports.find((r: any) => r.id === reportId)
    if (report) {
      report.collectCount = (report.collectCount || 0) + (res.action === 'added' ? 1 : -1)
    }
  } catch {
    ElMessage.error(t('common.loginRequired'))
  }
}

let unsubscribeSquare: (() => void) | null = null

onMounted(() => {
  loadReports()
  // 订阅广场 WebSocket 新报告推送
  unsubscribeSquare = subscribeSquare((data: any) => {
    if (data.type === 'new_report') {
      ElMessage.info(t('square.newAnalysisNotice'))
    }
  })
})

onUnmounted(() => {
  unsubscribeSquare?.()
})
</script>

<style scoped>
.analysis-square-view h1 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.filter-bar {
  margin-bottom: 20px;
}

.report-card {
  margin-bottom: 16px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-time {
  font-size: 13px;
  color: #999;
}

.report-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.report-content {
  line-height: 1.8;
  color: #333;
  font-size: 14px;
}

.report-content.markdown-body :deep(h1),
.report-content.markdown-body :deep(h2),
.report-content.markdown-body :deep(h3) {
  margin: 8px 0 4px;
  font-weight: 700;
}

.report-content.markdown-body :deep(ul),
.report-content.markdown-body :deep(ol) {
  padding-left: 20px;
}

.report-content.markdown-body :deep(p) {
  margin: 4px 0;
}

.report-source {
  color: #999;
  font-size: 11px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}

.report-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}
</style>
