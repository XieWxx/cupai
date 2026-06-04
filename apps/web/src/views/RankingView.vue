<template>
  <div class="ranking-view">
    <h1>排行榜</h1>

    <el-tabs v-model="activeTab" @tab-change="loadData">
      <!-- 用户排行 -->
      <el-tab-pane label="用户排行" name="users">
        <el-table :data="userRankings" stripe v-loading="loading">
          <el-table-column label="排名" width="80">
            <template #default="{ $index }">
              <span :class="['rank-badge', $index < 3 ? `rank-${$index + 1}` : '']">
                {{ $index + 1 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="用户" prop="user.nickname" />
          <el-table-column label="总预测" prop="totalPredictions" width="90" />
          <el-table-column label="精准匹配" prop="exactMatches" width="100" />
          <el-table-column label="基本匹配" prop="basicMatches" width="100" />
          <el-table-column label="总积分" prop="totalScore" width="90" />
          <el-table-column label="准确率" width="100">
            <template #default="{ row }">
              {{ Number(row.accuracyRate).toFixed(1) }}%
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 大模型排行 -->
      <el-tab-pane label="大模型排行" name="models">
        <el-table :data="modelRankings" stripe v-loading="loading">
          <el-table-column label="排名" width="80">
            <template #default="{ $index }">
              <span :class="['rank-badge', $index < 3 ? `rank-${$index + 1}` : '']">
                {{ $index + 1 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="模型" prop="modelName" />
          <el-table-column label="总预测" prop="totalPredictions" width="90" />
          <el-table-column label="精准匹配" prop="exactMatches" width="100" />
          <el-table-column label="基本匹配" prop="basicMatches" width="100" />
          <el-table-column label="总积分" prop="totalScore" width="90" />
          <el-table-column label="准确率" width="100">
            <template #default="{ row }">
              {{ Number(row.accuracyRate).toFixed(1) }}%
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 个人排行卡片 -->
    <el-card v-if="myRanking" class="my-ranking-card" shadow="hover">
      <template #header>我的排行</template>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="总预测">{{ myRanking.totalPredictions }}</el-descriptions-item>
        <el-descriptions-item label="精准匹配">{{ myRanking.exactMatches }}</el-descriptions-item>
        <el-descriptions-item label="基本匹配">{{ myRanking.basicMatches }}</el-descriptions-item>
        <el-descriptions-item label="总积分">{{ myRanking.totalScore }}</el-descriptions-item>
        <el-descriptions-item label="准确率">{{ Number(myRanking.accuracyRate).toFixed(1) }}%</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { http } from '@/api/request'

const activeTab = ref('users')
const loading = ref(false)
const userRankings = ref<any[]>([])
const modelRankings = ref<any[]>([])
const myRanking = ref<any>(null)

async function loadData() {
  loading.value = true
  try {
    if (activeTab.value === 'users') {
      const res = await http.get<{ list: any[] }>('/ranking/users')
      userRankings.value = res.list || []
    } else {
      const res = await http.get<{ list: any[] }>('/ranking/models')
      modelRankings.value = res.list || []
    }
  } catch {
    // 后端未启动时忽略
  } finally {
    loading.value = false
  }
}

async function loadMyRanking() {
  try {
    const token = localStorage.getItem('cupai_token')
    if (!token) return
    myRanking.value = await http.get<any>('/ranking/my')
  } catch {
    // 未登录忽略
  }
}

onMounted(() => {
  loadData()
  loadMyRanking()
})
</script>

<style scoped>
.ranking-view h1 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.my-ranking-card {
  margin-top: 24px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
  background: #f0f0f0;
  color: #666;
}

.rank-1 {
  background: #ffd700;
  color: #fff;
}

.rank-2 {
  background: #c0c0c0;
  color: #fff;
}

.rank-3 {
  background: #cd7f32;
  color: #fff;
}
</style>
