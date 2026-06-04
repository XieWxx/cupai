<template>
  <div class="analysis-square-view">
    <h1>{{ $t('nav.analysisSquare') }}</h1>

    <!-- 筛选栏 -->
    <el-row :gutter="16" class="filter-bar">
      <el-col :span="6">
        <el-select v-model="filters.source" placeholder="来源筛选" clearable @change="loadReports">
          <el-option label="全部" value="" />
          <el-option label="Agent 官方分析" value="agent" />
          <el-option label="用户分析" value="manual" />
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
                {{ report.source === 'agent' ? 'Agent 分析' : '用户分析' }}
              </el-tag>
              <span class="report-time">{{ new Date(report.createdAt).toLocaleString('zh-CN') }}</span>
            </div>
            <div class="report-stats">
              <span>👍 {{ report.likeCount }}</span>
              <span>⭐ {{ report.collectCount }}</span>
              <span>💬 {{ report.commentCount }}</span>
            </div>
          </div>
        </template>
        <div class="report-content">
          {{ report.content?.substring(0, 300) }}{{ report.content?.length > 300 ? '...' : '' }}
        </div>
        <div class="report-footer">
          <span class="report-model">模型: {{ report.llmType }}</span>
          <span class="report-lang">语言: {{ report.displayLanguage }}</span>
        </div>
      </el-card>
    </div>

    <el-empty v-if="analysisStore.publicReports.length === 0 && !analysisStore.loading" description="暂无公开分析报告" />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useAnalysisStore } from '@/stores/analysis'

const analysisStore = useAnalysisStore()

const filters = reactive({
  source: '',
})

async function loadReports() {
  await analysisStore.fetchPublicReports({
    source: filters.source || undefined,
  })
}

onMounted(() => {
  loadReports()
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

.report-footer {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}
</style>
