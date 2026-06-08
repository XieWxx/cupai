<template>
  <div class="analysis-square-view">
    <header class="page-header">
      <h1 class="page-title">{{ $t('nav.analysisSquare') }}</h1>
    </header>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-select v-model="filters.source" :placeholder="$t('square.sourceFilter')" clearable @change="loadReports">
            <el-option :label="$t('square.all')" value="" />
            <el-option :label="$t('square.agentLabel')" value="agent" />
            <el-option :label="$t('square.userLabel')" value="manual" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 报告列表 -->
    <div v-loading="analysisStore.loading">
      <el-card v-for="report in analysisStore.publicReports" :key="report.id" class="common-card report-card" shadow="hover">
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
const analysisStore = useAnalysisStore()

const filters = reactive({
  source: '',
})
const interactionMap = ref<Record<string, { like: boolean; collect: boolean }>>({})
let ws: (() => void) | null = null

function renderMarkdown(content: string | undefined): string {
  if (!content) return ''
  return md.render(content)
}

function displayLanguageLabel(lang: string | undefined): string {
  if (!lang) return '-'
  const labels: Record<string, string> = {
    'zh-CN': t('profile.zhCN'), 'en-US': t('profile.enUS'), 'es-ES': t('profile.esES'),
    'fr-FR': t('profile.frFR'), 'pt-BR': t('profile.ptBR'), 'ar-SA': t('profile.arSA'),
    'ja-JP': t('profile.jaJP'), 'ko-KR': t('profile.koKR'),
  }
  return labels[lang] || lang
}

function formatWeights(snapshot: string): string {
  try {
    const w = JSON.parse(snapshot)
    return Object.entries(w).map(([k, v]) => `${k}: ${Math.round(Number(v) * 100)}%`).join(' | ')
  } catch {
    return snapshot
  }
}

async function loadReports() {
  try {
    await analysisStore.fetchPublicReports({
      source: filters.source || undefined,
    })
  } catch (err) {
    console.error('[loadReports] failed:', err)
  }
}

async function toggleLike(reportId: string) {
  const current = interactionMap.value[reportId]?.like
  try {
    await http.post('/analysis/interaction', { reportId, type: 'like' })
    interactionMap.value[reportId] = { ...(interactionMap.value[reportId] || {}), like: !current }
    const report = analysisStore.publicReports.find((r) => r.id === reportId)
    if (report) report.likeCount = (report.likeCount || 0) + (current ? -1 : 1)
  } catch {
    ElMessage.error(t('common.operationFail'))
  }
}

async function toggleCollect(reportId: string) {
  const current = interactionMap.value[reportId]?.collect
  try {
    await http.post('/analysis/interaction', { reportId, type: 'collect' })
    interactionMap.value[reportId] = { ...(interactionMap.value[reportId] || {}), collect: !current }
    const report = analysisStore.publicReports.find((r) => r.id === reportId)
    if (report) report.collectCount = (report.collectCount || 0) + (current ? -1 : 1)
  } catch {
    ElMessage.error(t('common.operationFail'))
  }
}

onMounted(() => {
  loadReports()
  // WebSocket 推送
  try {
    ws = subscribeSquare((data: any) => {
      if (data?.type === 'new_report') {
        analysisStore.publicReports.unshift(data.report)
      }
    })
  } catch {
    // WebSocket 不可用则忽略
  }
})

onUnmounted(() => {
  if (ws) ws()
})
</script>

<style scoped>
.analysis-square-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
}

.filter-bar {
  margin-bottom: var(--space-4);
}

.report-card {
  margin-bottom: var(--space-4);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.report-time {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.report-stats {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.report-content {
  line-height: var(--leading-relaxed);
  color: var(--color-text-regular);
  font-size: var(--text-sm);
}

.report-content.markdown-body :deep(h1),
.report-content.markdown-body :deep(h2),
.report-content.markdown-body :deep(h3) {
  margin: var(--space-2) 0 var(--space-1);
  font-weight: var(--font-bold);
}

.report-content.markdown-body :deep(ul),
.report-content.markdown-body :deep(ol) {
  padding-left: 20px;
}

.report-content.markdown-body :deep(p) {
  margin: var(--space-1) 0;
}

.report-source {
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-footer {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-light);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.report-actions {
  margin-left: auto;
  display: flex;
  gap: var(--space-1);
}
</style>
