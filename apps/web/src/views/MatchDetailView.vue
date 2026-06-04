<template>
  <div class="match-detail-view" v-loading="loading">
    <el-page-header @back="$router.back()" :title="$t('common.back')">
      <template #content>
        <span>{{ match?.homeTeam?.name }} VS {{ match?.awayTeam?.name }}</span>
      </template>
    </el-page-header>

    <el-row :gutter="24" style="margin-top: 24px">
      <!-- 赛事信息 -->
      <el-col :span="16">
        <el-card>
          <template #header>赛事信息</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="赛事">{{ match?.leagueName }}</el-descriptions-item>
            <el-descriptions-item label="阶段">{{ match?.stage }}</el-descriptions-item>
            <el-descriptions-item label="主队">{{ match?.homeTeam?.name }}</el-descriptions-item>
            <el-descriptions-item label="客队">{{ match?.awayTeam?.name }}</el-descriptions-item>
            <el-descriptions-item label="比分" v-if="match?.status === 'finished'">
              {{ match?.homeScore }} : {{ match?.awayScore }}
            </el-descriptions-item>
            <el-descriptions-item label="开赛时间">{{ formatTime(match?.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="场馆">{{ match?.venue || '-' }}</el-descriptions-item>
            <el-descriptions-item label="裁判">{{ match?.refereeName || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 环境信息 -->
        <el-card style="margin-top: 16px" v-if="match?.temperature">
          <template #header>临场环境</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="温度">{{ match?.temperature }}℃</el-descriptions-item>
            <el-descriptions-item label="湿度">{{ match?.humidity }}%</el-descriptions-item>
            <el-descriptions-item label="天气">{{ match?.weatherCondition || '-' }}</el-descriptions-item>
            <el-descriptions-item label="风速">{{ match?.windSpeed || '-' }} km/h</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 快捷操作 -->
      <el-col :span="8">
        <el-card>
          <template #header>快捷操作</template>
          <div class="quick-actions">
            <el-button type="primary" style="width: 100%; margin-bottom: 12px" @click="$router.push('/analysis')">
              AI 分析此赛事
            </el-button>
            <el-button style="width: 100%" @click="$router.push('/square')">
              查看相关分析
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchStore } from '@/stores/match'

const route = useRoute()
const matchStore = useMatchStore()
const loading = ref(false)
const match = ref<any>(null)

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(async () => {
  loading.value = true
  try {
    match.value = await matchStore.fetchMatchDetail(route.params.id as string)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.quick-actions {
  display: flex;
  flex-direction: column;
}
</style>
