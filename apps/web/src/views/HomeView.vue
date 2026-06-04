<template>
  <div class="home-view">
    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">⚽ CupAI</h1>
        <p class="hero-subtitle">{{ $t('common.appSlogan') }}</p>
        <p class="hero-desc">
          {{ $t('home.heroDesc') || '纯数据驱动 + 用户私有AI，全维度赛事因子 + Prompt 模板市场' }}
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/analysis')">
            {{ $t('home.startAnalysis') || '开始分析' }}
          </el-button>
          <el-button size="large" @click="$router.push('/match')">
            {{ $t('home.viewMatches') || '浏览赛事' }}
          </el-button>
        </div>
      </div>
    </section>

    <!-- 热门赛事 -->
    <section class="section">
      <div class="section-header">
        <h2>{{ $t('home.hotMatches') }}</h2>
        <el-button text @click="$router.push('/match')">{{ $t('common.more') }} →</el-button>
      </div>
      <el-row :gutter="16">
        <el-col v-for="match in hotMatches" :key="match.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="match-card" @click="$router.push(`/match/${match.id}`)">
            <div class="match-teams">
              <div class="team-info">
                <span :class="`fi fi-${match.homeTeam?.countryCode?.toLowerCase()}`"></span>
                <span class="team-name">{{ match.homeTeam?.name }}</span>
              </div>
              <div class="match-vs">VS</div>
              <div class="team-info">
                <span :class="`fi fi-${match.awayTeam?.countryCode?.toLowerCase()}`"></span>
                <span class="team-name">{{ match.awayTeam?.name }}</span>
              </div>
            </div>
            <div class="match-meta">
              <el-tag :type="match.status === 'live' ? 'danger' : match.status === 'finished' ? 'info' : 'success'" size="small">
                {{ match.status === 'live' ? '进行中' : match.status === 'finished' ? '已完赛' : '未开赛' }}
              </el-tag>
              <span class="match-time">{{ formatTime(match.startTime) }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 数据速览看板 -->
    <section class="section">
      <h2>{{ $t('home.dataOverview') }}</h2>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <el-statistic title="覆盖球队" :value="stats.teams" suffix="+" />
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-statistic title="赛事数据" :value="stats.matches" suffix="+" />
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-statistic title="分析报告" :value="stats.reports" suffix="+" />
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-statistic title="Prompt 模板" :value="stats.prompts" suffix="+" />
        </el-col>
      </el-row>
    </section>

    <!-- Agent 智能分析入口 -->
    <section class="section agent-section">
      <el-card shadow="never" class="agent-card">
        <div class="agent-content">
          <h2>🤖 Agent {{ $t('home.agentEntry') }}</h2>
          <p>{{ $t('home.agentDesc') || '自动扫描赛事、批量生成分析报告，授权公开共享' }}</p>
          <el-button type="primary" @click="$router.push('/analysis')">
            {{ $t('home.startAgent') || '启动 Agent' }}
          </el-button>
        </div>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMatchStore } from '@/stores/match'

const matchStore = useMatchStore()

// 热门赛事数据
const hotMatches = ref<any[]>([])

// 统计数据
const stats = ref({
  teams: 32,
  matches: 64,
  reports: 1280,
  prompts: 560,
})

// 格式化时间
function formatTime(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  try {
    const res = await matchStore.fetchMatches({ pageSize: 4 })
    hotMatches.value = res?.list || []
  } catch {
    // 后端未启动时使用空数据
  }
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 12px;
  padding: 60px 40px;
  margin-bottom: 32px;
  color: #fff;
}

.hero-title {
  font-size: 48px;
  margin-bottom: 12px;
}

.hero-subtitle {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.hero-desc {
  font-size: 16px;
  color: #ccc;
  margin-bottom: 24px;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 20px;
  color: #1a1a2e;
}

.match-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.match-card:hover {
  transform: translateY(-2px);
}

.match-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.team-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.team-name {
  font-size: 14px;
  font-weight: 600;
}

.match-vs {
  font-size: 18px;
  font-weight: 700;
  color: #e94560;
}

.match-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-time {
  font-size: 12px;
  color: #999;
}

.agent-section {
  margin-top: 32px;
}

.agent-card {
  background: linear-gradient(135deg, #f5f7fa, #e8ecf1);
  border: none;
}

.agent-content h2 {
  font-size: 22px;
  margin-bottom: 8px;
}

.agent-content p {
  color: #666;
  margin-bottom: 16px;
}
</style>
