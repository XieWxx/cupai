<template>
  <div class="match-detail-view">
    <!-- 错误态 -->
    <EmptyState
      v-if="errorState === 'not_found'"
      :title="$t('match.notFound')"
      :description="$t('match.notFoundDesc')"
      variant="warning"
    >
      <template #actions>
        <el-button type="primary" @click="$router.push('/match')">
          {{ $t('match.backToList') }}
        </el-button>
      </template>
    </EmptyState>
    <EmptyState
      v-else-if="errorState === 'network'"
      :title="$t('common.networkError')"
      :description="$t('common.networkErrorDesc')"
      variant="warning"
    >
      <template #actions>
        <el-button type="primary" @click="loadDetail">{{ $t('common.retry') }}</el-button>
      </template>
    </EmptyState>

    <template v-else>
      <el-page-header @back="goBack" :title="$t('common.back')">
        <template #content>
          <span class="page-header-title">
            {{ getTeamName(match?.homeTeam) }} {{ $t('common.vs') }} {{ getTeamName(match?.awayTeam) }}
            <el-tag v-if="match?.status === 'live'" type="danger" size="small" effect="dark" round>
              <span class="match-card__status-dot match-card__status-dot--live" />
              {{ match?.currentMinute ? `${match.currentMinute}'` : $t('match.live') }}
            </el-tag>
            <el-tag v-else-if="match?.status === 'finished'" type="info" size="small" effect="plain" round>
              {{ $t('match.finished') }}
            </el-tag>
            <el-tag v-else type="success" size="small" effect="plain" round>
              {{ $t('match.upcoming') }}
            </el-tag>
          </span>
        </template>
      </el-page-header>

      <!-- 加载骨架屏 -->
      <div v-if="loading" class="detail-skeleton">
        <SkeletonCard :rows="2" show-media style="margin-top: var(--space-4)" />
        <SkeletonCard :rows="6" style="margin-top: var(--space-4)" />
        <SkeletonCard :rows="4" style="margin-top: var(--space-4)" />
      </div>

      <template v-else>
        <!-- 比分板 -->
        <div v-if="match?.homeScore !== null && match?.homeScore !== undefined" class="scoreboard">
          <div class="score-row">
            <div class="team-info team-info--home">
              <img v-if="getTeamLogoUrl(match?.homeTeam?.bsTeamId)" :src="getTeamLogoUrl(match?.homeTeam?.bsTeamId, { bg: 'transparent' })" class="team-logo" alt="" />
              <span v-if="getFlagClass(match?.homeTeam?.countryCode)" :class="`team-flag ${getFlagClass(match?.homeTeam?.countryCode)}`" />
              <div class="team-info__text">
                <span class="team-name">{{ getTeamName(match?.homeTeam) }}</span>
                <div class="team-meta">
                  <el-tag size="small" effect="dark" type="primary" class="team-side-tag">{{ $t('match.homeTeam') }}</el-tag>
                  <span class="team-rank" v-if="match?.homeTeam?.fifaRank">FIFA #{{ match.homeTeam.fifaRank }}</span>
                </div>
              </div>
            </div>
            <div class="score-display">
              <span class="score-num">{{ match?.homeScore }}</span>
              <span class="score-sep">:</span>
              <span class="score-num">{{ match?.awayScore }}</span>
            </div>
            <div class="team-info team-info--away">
              <div class="team-info__text">
                <span class="team-name">{{ getTeamName(match?.awayTeam) }}</span>
                <div class="team-meta">
                  <el-tag size="small" effect="dark" type="warning" class="team-side-tag">{{ $t('match.awayTeam') }}</el-tag>
                  <span class="team-rank" v-if="match?.awayTeam?.fifaRank">FIFA #{{ match.awayTeam.fifaRank }}</span>
                </div>
              </div>
              <span v-if="getFlagClass(match?.awayTeam?.countryCode)" :class="`team-flag ${getFlagClass(match?.awayTeam?.countryCode)}`" />
              <img v-if="getTeamLogoUrl(match?.awayTeam?.bsTeamId)" :src="getTeamLogoUrl(match?.awayTeam?.bsTeamId, { bg: 'transparent' })" class="team-logo" alt="" />
            </div>
          </div>
          <div v-if="match?.halfTimeHome !== null" class="half-time">
            {{ $t('match.halfTime') }} {{ match.halfTimeHome }} : {{ match.halfTimeAway }}
          </div>
          <!-- 进行时间 -->
          <div v-if="match?.status === 'live' && match?.currentMinute" class="match-progress-time">
            <span class="live-dot"></span>
            <span>{{ match.currentMinute }}'</span>
            <span v-if="match?.period" class="match-period">· {{ match.period }}</span>
          </div>
        </div>

        <!-- ========== 比分板（开赛前展示，标注主客队） ========== -->
        <div v-else class="scoreboard scoreboard--upcoming">
          <div class="score-row">
            <div class="team-info team-info--home">
              <img v-if="getTeamLogoUrl(match?.homeTeam?.bsTeamId)" :src="getTeamLogoUrl(match?.homeTeam?.bsTeamId, { bg: 'transparent' })" class="team-logo" alt="" />
              <span v-if="getFlagClass(match?.homeTeam?.countryCode)" :class="`team-flag ${getFlagClass(match?.homeTeam?.countryCode)}`" />
              <div class="team-info__text">
                <span class="team-name">{{ getTeamName(match?.homeTeam) }}</span>
                <div class="team-meta">
                  <el-tag size="small" effect="dark" type="primary" class="team-side-tag">{{ $t('match.homeTeam') }}</el-tag>
                  <span class="team-rank" v-if="match?.homeTeam?.fifaRank">FIFA #{{ match.homeTeam.fifaRank }}</span>
                </div>
              </div>
            </div>
            <div class="score-display score-display--vs">
              <span class="vs-text">{{ $t('common.vs') }}</span>
            </div>
            <div class="team-info team-info--away">
              <div class="team-info__text">
                <span class="team-name">{{ getTeamName(match?.awayTeam) }}</span>
                <div class="team-meta">
                  <el-tag size="small" effect="dark" type="warning" class="team-side-tag">{{ $t('match.awayTeam') }}</el-tag>
                  <span class="team-rank" v-if="match?.awayTeam?.fifaRank">FIFA #{{ match.awayTeam.fifaRank }}</span>
                </div>
              </div>
              <span v-if="getFlagClass(match?.awayTeam?.countryCode)" :class="`team-flag ${getFlagClass(match?.awayTeam?.countryCode)}`" />
              <img v-if="getTeamLogoUrl(match?.awayTeam?.bsTeamId)" :src="getTeamLogoUrl(match?.awayTeam?.bsTeamId, { bg: 'transparent' })" class="team-logo" alt="" />
            </div>
          </div>
        </div>

        <!-- 球衣颜色展示（从 metadata.jerseys 解析） -->
        <div v-if="jerseyColors" class="jersey-bar" style="margin-top: var(--space-2)">
          <div class="jersey-item">
            <span class="jersey-label">{{ getTeamName(match?.homeTeam) }}</span>
            <span class="jersey-swatch" :style="{ background: jerseyColors.home }" />
          </div>
          <span class="jersey-vs">{{ $t('common.vs') }}</span>
          <div class="jersey-item">
            <span class="jersey-swatch" :style="{ background: jerseyColors.away }" />
            <span class="jersey-label">{{ getTeamName(match?.awayTeam) }}</span>
          </div>
        </div>

        <!-- ========== 三列时间展示：当地开赛时间 | 用户观看时间 | UTC基准时间 ========== -->
        <div class="time-triple-bar" v-if="match?.startTime">
          <div class="time-triple-item">
            <div class="time-triple-label">{{ $t('match.localTime') }}</div>
            <div class="time-triple-value">{{ formatLocalTime(match.startTime) }}</div>
            <div class="time-triple-zone">{{ match.venue || $t('match.venueTbd') }}</div>
          </div>
          <div class="time-triple-divider"></div>
          <div class="time-triple-item time-triple-item--highlight">
            <div class="time-triple-label">{{ $t('match.yourTime') }}</div>
            <div class="time-triple-value">{{ formatUserTime(match.startTime) }}</div>
            <div class="time-triple-zone">{{ userTimezone }}</div>
          </div>
          <div class="time-triple-divider"></div>
          <div class="time-triple-item">
            <div class="time-triple-label">{{ $t('match.utcTime') }}</div>
            <div class="time-triple-value">{{ formatUtcTime(match.startTime) }}</div>
            <div class="time-triple-zone">UTC</div>
          </div>
        </div>

        <!-- ========== AI 胜负率预测 + 用户预测排行（两列布局） ========== -->
        <div class="prediction-2col" style="margin-top: var(--space-4)">
          <!-- 左：AI 胜负率预测 -->
          <SectionCard :title="$t('match.predictionTitle')">
            <template #extra>
              <div class="prediction-extra">
                <el-tag v-if="prediction" size="small" type="info" effect="plain">
                  <el-icon :size="12"><Cpu /></el-icon>
                  <span style="margin-left: 4px">{{ $t('match.aiDriven') }}</span>
                </el-tag>
                <el-button
                  size="small"
                  type="primary"
                  plain
                  :icon="CopyDocument"
                  @click="copyDimension('result_wdl')"
                >
                  {{ $t('dim.analyze') }}
                </el-button>
              </div>
            </template>
            <div v-if="prediction" class="prediction">
              <!-- 双队对比条 -->
              <div class="prediction-bars">
                <div class="prediction-team">
                  <div class="prediction-team__name">
                    <el-tag size="small" effect="dark" type="primary" class="team-side-tag team-side-tag--inline">{{ $t('match.homeTeam') }}</el-tag>
                    {{ getTeamName(match?.homeTeam) }}
                    <span class="prediction-team__rate" :style="{ color: getRateColor(prediction.homeWin) }">
                      {{ (prediction.homeWin * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <el-progress
                    :percentage="prediction.homeWin * 100"
                    :stroke-width="14"
                    :show-text="false"
                    :color="getRateColor(prediction.homeWin)"
                  />
                </div>
                <div class="prediction-team">
                  <div class="prediction-team__name">
                    <span class="prediction-team__label">{{ $t('match.draw') }}</span>
                    <span class="prediction-team__rate" :style="{ color: getRateColor(prediction.draw) }">
                      {{ (prediction.draw * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <el-progress
                    :percentage="prediction.draw * 100"
                    :stroke-width="14"
                    :show-text="false"
                    :color="getRateColor(prediction.draw)"
                  />
                </div>
                <div class="prediction-team">
                  <div class="prediction-team__name">
                    <el-tag size="small" effect="dark" type="warning" class="team-side-tag team-side-tag--inline">{{ $t('match.awayTeam') }}</el-tag>
                    {{ getTeamName(match?.awayTeam) }}
                    <span class="prediction-team__rate" :style="{ color: getRateColor(prediction.awayWin) }">
                      {{ (prediction.awayWin * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <el-progress
                    :percentage="prediction.awayWin * 100"
                    :stroke-width="14"
                    :show-text="false"
                    :color="getRateColor(prediction.awayWin)"
                  />
                </div>
              </div>
              <!-- AI 解释 -->
              <div v-if="prediction.reasoning" class="prediction-reasoning">
                <el-icon :size="14"><InfoFilled /></el-icon>
                <span>{{ prediction.reasoning }}</span>
              </div>
              <div class="prediction-source">
                <span>{{ $t('match.predictionSource') }}: {{ prediction.source }}</span>
              </div>
            </div>
            <EmptyState
              v-else
              :title="$t('match.predictionEmpty')"
              :description="$t('match.predictionEmptyDesc')"
              variant="document"
            />
          </SectionCard>

          <!-- 右：用户预测排行（与赛事数据中心共享样式） -->
          <SectionCard :title="$t('matchCenter.rankings')">
            <template #extra>
              <el-tag size="small" type="info" effect="plain">{{ $t('matchCenter.userRankingHint') }}</el-tag>
            </template>
            <UserPredictionRanking :list="userPredictionRanking" :loading="userRankingLoading" />
          </SectionCard>
        </div>

        <!-- ========== 关键信息紧凑卡 ========== -->
        <div class="key-info-bar" style="margin-top: var(--space-4)">
          <div class="key-info-card">
            <div class="key-info-card__icon" :style="{ background: 'rgba(91, 143, 249, 0.12)', color: '#5B8FF9' }">
              <el-icon :size="18"><Trophy /></el-icon>
            </div>
            <div class="key-info-card__body">
              <div class="key-info-card__label">{{ $t('match.match') }}</div>
              <div class="key-info-card__value">{{ match?.leagueName || '-' }}</div>
            </div>
          </div>
          <div class="key-info-card">
            <div class="key-info-card__icon" :style="{ background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }">
              <el-icon :size="18"><Clock /></el-icon>
            </div>
            <div class="key-info-card__body">
              <div class="key-info-card__label">{{ $t('match.startTime') }}</div>
              <div class="key-info-card__value">{{ formatTime(match?.startTime) }}</div>
            </div>
          </div>
          <div class="key-info-card">
            <div class="key-info-card__icon" :style="{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }">
              <el-icon :size="18"><Location /></el-icon>
            </div>
            <div class="key-info-card__body">
              <div class="key-info-card__label">{{ $t('match.venue') }}</div>
              <div class="key-info-card__value" :title="match?.venue">
                {{ match?.venue || '-' }}{{ match?.city ? `, ${match.city}` : '' }}
                <span v-if="match?.venueCapacity" class="venue-capacity">({{ match.venueCapacity.toLocaleString() }})</span>
              </div>
              <img v-if="getVenueImageUrl(match?.venueId)" :src="getVenueImageUrl(match?.venueId)" class="venue-image" alt="" />
            </div>
          </div>
          <div class="key-info-card">
            <div class="key-info-card__icon" :style="{ background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }">
              <el-icon :size="18"><User /></el-icon>
            </div>
            <div class="key-info-card__body">
              <div class="key-info-card__label">{{ $t('match.referee') }}</div>
              <div class="key-info-card__value">
                {{ match?.refereeName || '-' }}
                <span v-if="match?.refereeNationality" class="key-info-card__sub">
                  · {{ match.refereeNationality }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 交锋记录 -->
        <div v-if="h2hData && h2hData.total_matches > 0" class="h2h-card" style="margin-top: var(--space-4)">
          <h4>{{ $t('match.h2h') }}</h4>
          <div class="h2h-stats">
            <div class="h2h-stat">
              <span class="h2h-num">{{ h2hData.home_wins }}</span>
              <span class="h2h-label">{{ $t('match.h2hHomeWins') }}</span>
            </div>
            <div class="h2h-stat">
              <span class="h2h-num">{{ h2hData.draws }}</span>
              <span class="h2h-label">{{ $t('match.h2hDraws') }}</span>
            </div>
            <div class="h2h-stat">
              <span class="h2h-num">{{ h2hData.away_wins }}</span>
              <span class="h2h-label">{{ $t('match.h2hAwayWins') }}</span>
            </div>
          </div>
          <div v-if="h2hData.recent_matches?.length" class="h2h-recent">
            <div v-for="rm in h2hData.recent_matches.slice(0, 5)" :key="rm.date" class="h2h-match">
              <span class="h2h-teams">{{ rm.home }} vs {{ rm.away }}</span>
              <span class="h2h-score">{{ rm.score }}</span>
              <span class="h2h-date">{{ new Date(rm.date).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- 趣味事实 -->
        <div v-if="metadataData?.funfacts?.length" class="funfacts" style="margin-top: var(--space-4)">
          <h4>{{ $t('match.funFacts') }}</h4>
          <div v-for="(ff, i) in metadataData.funfacts" :key="i" class="funfact-item">
            {{ ff.sentence }}
          </div>
        </div>

        <!-- ========== 单维度指令报告：21 维度，每维度一个图表（按 5 大板块分组） ==========
             设计：每个分析指令都对应一张图表 + 一个「复制指令」按钮。
             agent 完成 1 条分析指令 → 调 /api/v1/agent/open/dimension/submit
             上传该维度的 distribution（不再传整份 result），图表自动聚合展示。
             「复制指令」按钮复制完整 Markdown 指令（含：基础数据快照 + 单维度问题 + 候选项 + agent 回传地址/Header/Body 示例 + 一键 curl）。 -->
        <SectionCard
          v-for="section in DIMENSION_SECTIONS"
          :key="section.key"
          :title="$t(section.i18nKey)"
          style="margin-top: var(--space-4)"
        >
          <template #extra>
            <div class="user-reports-extra">
              <el-tag size="small" type="info" effect="plain">
                <el-icon :size="12"><ChatLineRound /></el-icon>
                <span style="margin-left: 4px">
                  {{ $t('match.userReportsCount', { n: dimensionReports.length }) }}
                </span>
              </el-tag>
              <el-tag size="small" type="warning" effect="plain">
                {{ $t(section.descI18nKey) }}
              </el-tag>
            </div>
          </template>

          <div v-loading="reportsLoading">
            <!-- 动态渲染该板块下所有维度的图表（2 列布局，每图自带复制指令按钮） -->
            <div class="dim-charts-grid">
              <div
                v-for="dim in sectionDims(section.key)"
                :key="dim.key"
                class="dim-chart-block"
              >
                <div class="dim-chart-header">
                  <div class="dim-chart-title">
                    <span class="dim-chart-name">{{ $t(dim.i18nKey) }}</span>
                    <el-tag
                      v-if="dimPredictCount(dim.key) > 0"
                      size="small"
                      effect="plain"
                      type="info"
                      class="dim-count-tag"
                    >
                      {{ $t('match.dimPredictCount', { n: dimPredictCount(dim.key) }) }}
                    </el-tag>
                    <el-tooltip
                      v-if="dimWinner(dim.key)"
                      :content="dimWinner(dim.key) + (dimConfidence(dim.key) ? ` · ${(dimConfidence(dim.key) * 100).toFixed(0)}%` : '')"
                      placement="top"
                    >
                      <el-tag size="small" effect="plain" type="success" class="dim-winner-tag">
                        <el-icon :size="10"><StarFilled /></el-icon>
                        <span style="margin-left: 2px">{{ dimWinner(dim.key) }}</span>
                      </el-tag>
                    </el-tooltip>
                  </div>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    :icon="CopyDocument"
                    @click="copyDimension(dim.key)"
                  >
                    {{ $t('dim.analyze') }}
                  </el-button>
                </div>
                <div
                  :ref="(el) => setDimChartRef(dim.key, el as HTMLElement | null)"
                  class="dim-chart"
                ></div>
              </div>
            </div>
          </div>
        </SectionCard>

        <!-- ========== 阵容与球员分析 ========== -->
        <SectionCard
          :title="$t('match.lineupTitle')"
          style="margin-top: var(--space-4)"
        >
          <template #extra>
            <el-radio-group v-model="activeLineupTab" size="small">
              <el-radio-button value="home">
                {{ getTeamName(match?.homeTeam) }} ({{ homePlayers.length }})
              </el-radio-button>
              <el-radio-button value="away">
                {{ getTeamName(match?.awayTeam) }} ({{ awayPlayers.length }})
              </el-radio-button>
            </el-radio-group>
          </template>

          <div v-loading="playersLoading">
            <!-- 球队画像 -->
            <div v-if="activeTeam" class="team-profile">
              <div class="team-profile__header">
                <div class="team-profile__name">
                  <span v-if="getFlagClass(activeTeam?.countryCode)" :class="`team-flag ${getFlagClass(activeTeam?.countryCode)}`" />
                  <span>{{ getTeamName(activeTeam) }}</span>
                  <el-tag v-if="activeTeam?.fifaRank" size="small" type="info" effect="plain" round>
                    FIFA #{{ activeTeam.fifaRank }}
                    <span v-if="activeTeam.fifaRankChange" :style="{ color: activeTeam.fifaRankChange > 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
                      {{ activeTeam.fifaRankChange > 0 ? '▲' : '▼' }}{{ Math.abs(activeTeam.fifaRankChange) }}
                    </span>
                  </el-tag>
                </div>
                <div v-if="activeTeam.formation || activeTeam.playStyle" class="team-profile__tags">
                  <el-tag v-if="activeTeam.formation" size="small" effect="dark">
                    {{ activeTeam.formation }}
                  </el-tag>
                  <el-tag v-if="activeTeam.playStyle" size="small" effect="plain">
                    {{ activeTeam.playStyle }}
                  </el-tag>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    :icon="CopyDocument"
                    @click="openTeamCopyDialog(activeLineupTab)"
                  >
                    {{ $t('copyIntro.copyTeam') }}
                  </el-button>
                </div>
              </div>
              <el-row :gutter="12" class="team-profile__stats">
                <el-col :xs="6" :sm="6">
                  <div class="stat-item">
                    <div class="stat-item__value">{{ Number(activeTeam.avgGoalsScored || 0).toFixed(2) }}</div>
                    <div class="stat-item__label">{{ $t('match.avgGoals') }}</div>
                  </div>
                </el-col>
                <el-col :xs="6" :sm="6">
                  <div class="stat-item">
                    <div class="stat-item__value">{{ Number(activeTeam.avgGoalsConceded || 0).toFixed(2) }}</div>
                    <div class="stat-item__label">{{ $t('match.avgConceded') }}</div>
                  </div>
                </el-col>
                <el-col :xs="6" :sm="6">
                  <div class="stat-item">
                    <div class="stat-item__value">{{ Number(activeTeam.avgPossession || 0).toFixed(1) }}%</div>
                    <div class="stat-item__label">{{ $t('match.avgPossession') }}</div>
                  </div>
                </el-col>
                <el-col :xs="6" :sm="6">
                  <div class="stat-item">
                    <div class="stat-item__value">{{ Number(activeTeam.winRate || 0).toFixed(1) }}%</div>
                    <div class="stat-item__label">{{ $t('match.winRate') }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- 加载中：骨架占位 -->
            <div v-if="playersLoading" class="players-skeleton">
              <SkeletonCard :rows="3" show-media />
              <SkeletonCard :rows="3" show-media style="margin-top: var(--space-3)" />
            </div>

            <EmptyState
              v-else-if="activePlayers.length === 0"
              :title="$t('match.noPlayers')"
              :description="$t('match.noPlayersDesc')"
              variant="document"
              style="margin-top: var(--space-3)"
            />

            <!-- 按位置分组的球员列表 -->
            <template v-else>
              <!-- 阵型信息（lineup 数据有阵型时展示） -->
              <div v-if="lineupData" class="formation-row" style="display: flex; gap: 16px; margin-bottom: 12px; align-items: center; flex-wrap: wrap;">
                <el-tag v-if="lineupData.home?.formation" size="small" effect="dark">
                  {{ getTeamName(match?.homeTeam) }}: {{ lineupData.home.formation }}
                </el-tag>
                <el-tag v-if="lineupData.away?.formation" size="small" effect="dark">
                  {{ getTeamName(match?.awayTeam) }}: {{ lineupData.away.formation }}
                </el-tag>
                <el-tag v-if="lineupData.lineup_status" size="small" :type="lineupData.lineup_status === 'confirmed' ? 'success' : lineupData.lineup_status === 'predicted' ? 'warning' : 'info'" effect="plain">
                  {{ $t(`match.${lineupData.lineup_status}`) || lineupData.lineup_status }}
                </el-tag>
                <el-tag v-if="lineupData.home?.confidence != null" size="small" type="info" effect="plain">
                  {{ $t('match.lineupConfidence') }}: {{ (lineupData.home.confidence * 100).toFixed(0) }}%
                </el-tag>
              </div>
              <template v-for="pos in positionOrder" :key="pos.key">
                <div
                  v-if="activeGrouped[pos.key]?.length"
                  class="position-group"
                >
                  <div class="position-group__title">
                    <el-icon><User /></el-icon>
                    <span>{{ $t(pos.label) }}</span>
                    <span class="position-group__count">({{ activeGrouped[pos.key].length }})</span>
                  </div>
                  <el-table
                    :data="activeGrouped[pos.key]"
                    :show-header="false"
                    size="small"
                    :row-class-name="(args: any) => (args.row.isKeyPlayer || args.row.aiScore >= 80) ? 'is-key-player' : ''"
                  >
                    <el-table-column width="48" align="center">
                      <template #default="{ row }">
                        <div class="player-avatar">
                          <el-avatar v-if="getPlayerAvatarUrl(row.bsPlayerId) || row.avatar" :size="32" :src="getPlayerAvatarUrl(row.bsPlayerId) || row.avatar" />
                          <el-avatar v-else :size="32">{{ (row.playerName || row.name || '?').charAt(0) }}</el-avatar>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column>
                      <template #default="{ row }">
                        <div class="player-name">
                          <span class="player-name__cn">{{ row.playerName || row.name }}</span>
                          <span v-if="row.jerseyNumber" class="player-jersey">#{{ row.jerseyNumber }}</span>
                          <el-tooltip v-if="row.isKeyPlayer || row.aiScore >= 80" :content="$t('match.keyPlayerTip')" placement="top">
                            <el-tag size="small" type="warning" effect="dark" class="key-badge">
                              <el-icon :size="10"><StarFilled /></el-icon>
                              <span style="margin-left: 2px">{{ $t('match.keyPlayer') }}</span>
                            </el-tag>
                          </el-tooltip>
                        </div>
                        <div v-if="row.shortName || row.nameEn" class="player-name__en">{{ row.shortName || row.nameEn }}</div>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.age')" width="56" align="center">
                      <template #default="{ row }">
                        {{ row.age ?? '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.height')" width="56" align="center">
                      <template #default="{ row }">
                        {{ row.heightCm ? `${row.heightCm}` : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.weight')" width="56" align="center">
                      <template #default="{ row }">
                        {{ row.weightKg ? `${row.weightKg}` : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.preferredFoot')" width="56" align="center">
                      <template #default="{ row }">
                        {{ row.preferredFoot ? $t(`match.${row.preferredFoot === 'Left' || row.preferredFoot === 'L' ? 'leftFoot' : 'rightFoot'}`) : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.marketValue')" width="72" align="center">
                      <template #default="{ row }">
                        {{ row.marketValueEur ? `${(row.marketValueEur / 10000).toFixed(0)}` : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.goals')" width="56" align="center">
                      <template #default="{ row }">
                        <span class="stat-num">{{ row.seasonGoals ?? 0 }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.assists')" width="64" align="center">
                      <template #default="{ row }">
                        <span class="stat-num">{{ row.seasonAssists ?? 0 }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.cards')" width="80" align="center">
                      <template #default="{ row }">
                        <span class="card-cell">
                          <span class="yellow-card" v-if="row.yellowCards">{{ row.yellowCards }}</span>
                          <span class="red-card" v-if="row.redCards">{{ row.redCards }}</span>
                          <span v-if="!row.yellowCards && !row.redCards" class="stat-empty">-</span>
                        </span>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.injuryStatus')" width="100" align="center">
                      <template #default="{ row }">
                        <el-tag :type="injuryType(row.injuryStatus)" size="small" effect="plain">
                          {{ injuryLabel(row.injuryStatus) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.operation')" width="80" align="center" fixed="right">
                      <template #default="{ row }">
                        <el-tooltip :content="$t('copyIntro.copyPlayerTip')" placement="top">
                          <el-button
                            text
                            type="primary"
                            size="small"
                            :icon="CopyDocument"
                            @click="openPlayerCopyDialog(row, activeLineupTab)"
                          />
                        </el-tooltip>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </template>
          </div>
        </SectionCard>

        <!-- 球员统计面板 -->
        <div v-if="playerStatsData?.player_stats?.length" class="player-stats-panel" style="margin-top: var(--space-4)">
          <h4>{{ $t('match.playerStats') }}</h4>
          <div class="player-stats-table">
            <table>
              <thead>
                <tr>
                  <th>{{ $t('match.playerName') }}</th>
                  <th>{{ $t('match.rating') }}</th>
                  <th>{{ $t('match.goals') }}</th>
                  <th>{{ $t('match.assists') }}</th>
                  <th>{{ $t('match.expectedGoals') }}</th>
                  <th>{{ $t('match.expectedAssists') }}</th>
                  <th>{{ $t('match.shotsOnTarget') }}</th>
                  <th>{{ $t('match.keyPass') }}</th>
                  <th>{{ $t('match.tackles') }}</th>
                  <th>{{ $t('match.interceptions') }}</th>
                  <th>{{ $t('match.saves') }}</th>
                  <th>{{ $t('match.touches') }}</th>
                  <th>{{ $t('match.wonContest') }}</th>
                  <th>{{ $t('match.possessionLost') }}</th>
                  <th>{{ $t('match.cards') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ps in playerStatsData.player_stats" :key="ps.player_id">
                  <td>{{ getPlayerNameById(ps.player_id) || ps.player_id }}</td>
                  <td>{{ ps.rating ?? '-' }}</td>
                  <td>{{ ps.goals || 0 }}</td>
                  <td>{{ ps.goal_assist || 0 }}</td>
                  <td>{{ ps.expected_goals ?? '-' }}</td>
                  <td>{{ ps.expected_assists ?? '-' }}</td>
                  <td>{{ ps.shots_on_target ?? '-' }}</td>
                  <td>{{ ps.key_pass ?? '-' }}</td>
                  <td>{{ ps.total_tackle ?? '-' }}</td>
                  <td>{{ ps.interception ?? '-' }}</td>
                  <td>{{ ps.saves ?? '-' }}</td>
                  <td>{{ ps.touches ?? '-' }}</td>
                  <td>{{ ps.won_contest ?? '-' }}</td>
                  <td>{{ ps.possession_lost ?? '-' }}</td>
                  <td>
                    <span v-if="ps.yellow_card" class="card-yellow">Y{{ ps.yellow_card }}</span>
                    <span v-if="ps.red_card" class="card-red">R{{ ps.red_card }}</span>
                    <span v-if="!ps.yellow_card && !ps.red_card">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 精彩集锦 -->
        <div v-if="highlightsData.length > 0" class="highlights-card" style="margin-top: var(--space-4)">
          <h4>{{ $t('match.highlights') }}</h4>
          <div class="highlights-list">
            <a v-for="h in highlightsData" :key="h.url" :href="h.url" target="_blank" rel="noopener" class="highlight-item">
              <img :src="h.thumbnail" :alt="h.title" class="highlight-thumb" />
              <div class="highlight-info">
                <span class="highlight-title">{{ h.title }}</span>
                <span class="highlight-date">{{ new Date(h.published_at).toLocaleDateString() }}</span>
              </div>
            </a>
          </div>
        </div>

        <!-- ========== 赛事信息 + 临场环境（两列布局，缩短页面长度） ========== -->
        <div class="info-row-2col" style="margin-top: var(--space-4)">
          <!-- 左：赛事信息 -->
          <SectionCard :title="$t('match.matchInfo')">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item :label="$t('match.match')">{{ match?.leagueName || '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.stage')">{{ stageLabel(match?.stage) }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.startTime')">
                <TimeTriple :match="match" size="small" />
              </el-descriptions-item>
              <el-descriptions-item :label="$t('match.venue')">{{ match?.venue || '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.referee')">
                {{ match?.refereeName || '-' }}
                <span v-if="match?.refereeNationality" class="key-info-card__sub">
                  · {{ match.refereeNationality }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item :label="$t('match.refereeStyle')">{{ match?.refereeStyle || '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.homeCoach')">{{ match?.homeCoach || '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.awayCoach')">{{ match?.awayCoach || '-' }}</el-descriptions-item>
              <el-descriptions-item v-if="match?.roundName" :label="$t('match.roundName')">{{ match.roundName }}</el-descriptions-item>
              <el-descriptions-item v-if="match?.groupName" :label="$t('match.groupName')">{{ match.groupName }}</el-descriptions-item>
            </el-descriptions>
          </SectionCard>

          <!-- 右：临场环境 -->
          <SectionCard
            :title="$t('match.environment')"
          >
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item :label="$t('match.temperature')">{{ match?.temperature ?? '-' }}℃</el-descriptions-item>
              <el-descriptions-item :label="$t('match.humidity')">{{ match?.humidity ?? '-' }}%</el-descriptions-item>
              <el-descriptions-item :label="$t('match.weather')">{{ match?.weatherCondition || '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.windSpeed')">{{ match?.windSpeed ?? '-' }} km/h</el-descriptions-item>
              <el-descriptions-item :label="$t('match.homeFans')">{{ match?.homeAttendance?.toLocaleString() || '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.awayFans')">{{ match?.awayAttendance?.toLocaleString() || '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.totalAttendance')">{{ match?.totalAttendance?.toLocaleString() || '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.pitchCondition')">{{ match?.pitchCondition || '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('match.travelDistance')">{{ match?.travelDistanceKm ? `${match.travelDistanceKm} km` : '-' }}</el-descriptions-item>
            </el-descriptions>
          </SectionCard>
        </div>

        <!-- 天气湿度信息（基于场馆经纬度从外部天气 API 拉取） -->
        <div v-if="weatherData" class="weather-card" style="margin-top: var(--space-4)">
          <h4>{{ $t('match.weather') }}</h4>
          <div class="weather-info">
            <span v-if="weatherData.temperature != null">🌡️ {{ weatherData.temperature }}°C</span>
            <span v-if="weatherData.humidity != null">💧 {{ $t('match.humidity') }} {{ weatherData.humidity }}%</span>
            <span v-if="weatherData.windSpeed != null">💨 {{ weatherData.windSpeed.toFixed(1) }} km/h</span>
            <span v-if="weatherData.weatherDescription">☁️ {{ weatherData.weatherDescription }}</span>
          </div>
        </div>

        <!-- ========== 全维度因子数据 + 数据来源（两列布局，缩短页面长度） ========== -->
        <div class="info-row-2col" style="margin-top: var(--space-4)">
          <!-- 左：全维度因子数据 -->
          <SectionCard
            :title="$t('match.factorData')"
          >
            <template v-if="match?.matchData && Object.keys(match.matchData).length">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item
                  v-for="(value, key) in match.matchData"
                  :key="String(key)"
                  :label="factorLabel(String(key))"
                >
                  {{ formatFactorValue(value) }}
                </el-descriptions-item>
              </el-descriptions>
            </template>
            <el-empty v-else :description="$t('common.noData')" :image-size="60" />
          </SectionCard>

          <!-- 右：数据来源 -->
          <SectionCard
            :title="$t('match.dataSource')"
          >
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item :label="$t('match.dataSource')">{{ match?.dataSource || '-' }}</el-descriptions-item>
              <el-descriptions-item v-if="match?.dataSourceUrl" :label="$t('match.sourceLink')">
                <a :href="match.dataSourceUrl" target="_blank" rel="noopener noreferrer">{{ match.dataSourceUrl }}</a>
              </el-descriptions-item>
            </el-descriptions>
          </SectionCard>
        </div>

        <!-- ========== 完整舆情看板（占满全宽；主 / 客 / 全部 三档 tab） ========== -->
        <SectionCard
          :title="$t('sentiment.matchSentiment')"
          style="margin-top: var(--space-4)"
        >
          <template #extra>
            <el-button
              text
              type="primary"
              @click="sentimentExpanded = !sentimentExpanded"
            >
              {{ sentimentExpanded ? $t('common.collapse') : $t('common.expand') }}
              <el-icon>
                <ArrowUp v-if="sentimentExpanded" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </template>

          <!-- 舆情视角切换：全部 / 主队 / 客队 -->
          <el-tabs
            v-model="sentimentTab"
            class="sentiment-tabs"
          >
            <el-tab-pane :label="$t('sentiment.viewAll')" name="all" />
            <el-tab-pane
              :label="`${getTeamName(match?.homeTeam) || $t('match.homeTeam')} · ${$t('sentiment.homeSentiment')}`"
              name="home"
            />
            <el-tab-pane
              :label="`${getTeamName(match?.awayTeam) || $t('match.awayTeam')} · ${$t('sentiment.awaySentiment')}`"
              name="away"
            />
          </el-tabs>

          <div v-loading="sentimentLoading">
            <EmptyState
              v-if="!currentSentiment && !sentimentLoading"
              :title="$t('sentiment.noData')"
              :description="currentSentimentLabel
                ? $t('sentiment.teamNoDataDesc', { team: currentSentimentLabel })
                : $t('sentiment.matchNoDataDesc')"
              variant="document"
            />
            <template v-else-if="currentSentiment">
              <!-- 概览 4 卡片 -->
              <el-row :gutter="16">
                <el-col :xs="12" :sm="6">
                  <div class="sentiment-stat">
                    <div class="sentiment-stat__value">{{ currentSentiment.sampleCount || 0 }}</div>
                    <div class="sentiment-stat__label">{{ $t('sentiment.totalCount') }}</div>
                  </div>
                </el-col>
                <el-col :xs="12" :sm="6">
                  <div class="sentiment-stat">
                    <div
                      class="sentiment-stat__value"
                      :style="{ color: getSentimentColor(currentSentiment.avgScore) }"
                    >
                      {{ Number(currentSentiment.avgScore || 0).toFixed(3) }}
                    </div>
                    <div class="sentiment-stat__label">{{ $t('sentiment.sentimentScore') }}</div>
                  </div>
                </el-col>
                <el-col :xs="12" :sm="6">
                  <div class="sentiment-stat">
                    <div class="sentiment-stat__value" style="color: var(--color-success)">
                      {{ ((currentSentiment.positiveRatio || 0) * 100).toFixed(1) }}%
                    </div>
                    <div class="sentiment-stat__label">{{ $t('sentiment.positiveRatio') }}</div>
                  </div>
                </el-col>
                <el-col :xs="12" :sm="6">
                  <div class="sentiment-stat">
                    <div class="sentiment-stat__value" style="color: var(--color-danger)">
                      {{ ((currentSentiment.negativeRatio || 0) * 100).toFixed(1) }}%
                    </div>
                    <div class="sentiment-stat__label">{{ $t('sentiment.negativeRatio') }}</div>
                  </div>
                </el-col>
              </el-row>

              <el-collapse-transition>
                <div v-show="sentimentExpanded" class="sentiment-detail">
                  <el-row :gutter="16" style="margin-top: var(--space-4)">
                    <el-col :xs="24" :md="14">
                      <div class="sentiment-detail-title">
                        <el-icon><DataLine /></el-icon>
                        <span>{{ $t('sentiment.indicators') }}</span>
                      </div>
                      <div ref="sentimentChartRef" class="sentiment-chart"></div>
                    </el-col>
                    <el-col :xs="24" :md="10">
                      <div class="sentiment-detail-title">
                        <el-icon><Histogram /></el-icon>
                        <span>{{ $t('sentiment.distribution') }}</span>
                      </div>
                      <div ref="distributionChartRef" class="sentiment-chart"></div>
                    </el-col>
                  </el-row>

                  <!-- 最近舆情流 -->
                  <div v-if="currentSentiment.recentItems?.length" class="sentiment-feed">
                    <div class="sentiment-detail-title" style="margin-top: var(--space-4)">
                      <el-icon><ChatLineRound /></el-icon>
                      <span>{{ $t('sentiment.recentSentiment') }}</span>
                    </div>
                    <div
                      v-for="item in currentSentiment.recentItems.slice(0, 5)"
                      :key="item.id"
                      class="feed-item"
                    >
                      <div class="feed-header">
                        <el-tag :type="getPolarityType(item.sentimentPolarity)" size="small">
                          {{ getPolarityLabel(item.sentimentPolarity) }}
                        </el-tag>
                        <span class="feed-platform">{{ platformLabel(item.sourcePlatform) }}</span>
                        <span class="feed-time">{{ formatTime(item.createdAt) }}</span>
                      </div>
                      <div class="feed-text">{{ item.originalText }}</div>
                    </div>
                  </div>
                </div>
              </el-collapse-transition>
            </template>
          </div>
        </SectionCard>
      </template>
    </template>

    <!-- ========== AI 分析指引弹窗 ========== -->
    <CopyInstructionDialog
      v-model="copyDialogOpen"
      :title="$t('copyIntro.dialogTitle')"
      :instruction-text="copyDialogInstructionText"
      :auto-copied="copyDialogAutoCopied"
    />

    <!-- 右侧分享栏（跟随屏幕滚动） -->
    <div class="share-sidebar" v-if="match">
      <div class="share-sidebar__label">{{ $t('match.share') }}</div>
      <!-- X / Twitter -->
      <a class="share-btn share-btn--x" :href="shareUrlX" target="_blank" rel="noopener" title="X (Twitter)">
        <Icon icon="ri:twitter-x-fill" width="18" height="18" />
      </a>
      <!-- Facebook -->
      <a class="share-btn share-btn--facebook" :href="shareUrlFacebook" target="_blank" rel="noopener" title="Facebook">
        <Icon icon="ri:facebook-fill" width="18" height="18" />
      </a>
      <!-- WhatsApp -->
      <a class="share-btn share-btn--whatsapp" :href="shareUrlWhatsApp" target="_blank" rel="noopener" title="WhatsApp">
        <Icon icon="ri:whatsapp-fill" width="18" height="18" />
      </a>
      <!-- Telegram -->
      <a class="share-btn share-btn--telegram" :href="shareUrlTelegram" target="_blank" rel="noopener" title="Telegram">
        <Icon icon="ri:telegram-fill" width="18" height="18" />
      </a>
      <!-- LinkedIn -->
      <a class="share-btn share-btn--linkedin" :href="shareUrlLinkedIn" target="_blank" rel="noopener" title="LinkedIn">
        <Icon icon="ri:linkedin-fill" width="18" height="18" />
      </a>
      <!-- Reddit -->
      <a class="share-btn share-btn--reddit" :href="shareUrlReddit" target="_blank" rel="noopener" title="Reddit">
        <Icon icon="ri:reddit-fill" width="18" height="18" />
      </a>
      <!-- 微博 -->
      <a class="share-btn share-btn--weibo" :href="shareUrlWeibo" target="_blank" rel="noopener" :title="$t('match.platformWeibo')">
        <Icon icon="ri:weibo-fill" width="18" height="18" />
      </a>
      <!-- 微信（弹出二维码弹窗） -->
      <button class="share-btn share-btn--wechat" :title="$t('match.wechatShare')" @click="wechatQrVisible = true">
        <Icon icon="ri:wechat-fill" width="18" height="18" />
      </button>
      <!-- QQ -->
      <a class="share-btn share-btn--qq" :href="shareUrlQQ" target="_blank" rel="noopener" title="QQ">
        <Icon icon="ri:qq-fill" width="18" height="18" />
      </a>
      <!-- 复制链接 -->
      <button class="share-btn share-btn--link" :title="$t('match.copyLink')" @click="copyShareLink">
        <Icon icon="ri:link" width="18" height="18" />
      </button>
    </div>

    <!-- 微信二维码弹窗 -->
    <el-dialog v-model="wechatQrVisible" :title="$t('match.wechatShare')" width="320px" center>
      <div class="wechat-qr-dialog">
        <img
          :src="wechatQrUrl"
          alt="QR Code"
          class="wechat-qr-img"
        />
        <p class="wechat-qr-tip">{{ $t('match.wechatScanTip') }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import {
  ArrowDown,
  ArrowUp,
  ChatLineRound,
  Clock,
  CopyDocument,
  Cpu,
  DataLine,
  Histogram,
  InfoFilled,
  Location,
  StarFilled,
  Trophy,
  User,
} from '@element-plus/icons-vue'
import {
  buildDimensionInstruction,
  buildPlayerInstruction,
  buildTeamInstruction,
  buildMatchInstruction,
  DIMENSION_SECTIONS,
  DIMENSIONS,
  type CopyInstructionInput,
  type DimensionDef,
  type DimensionKey,
} from '@/utils/copyInstruction'
import { useMatchStore } from '@/stores/match'
import { useUserStore } from '@/stores/user'
import { subscribeMatch } from '@/api/websocket'
import { http } from '@/api/request'
import { listInstructions, type IInstruction } from '@/api/instruction'
import CopyInstructionDialog from '@/components/common/CopyInstructionDialog.vue'
import { getFlagClass } from '@/utils/flag'
import * as echarts from 'echarts'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import SectionCard from '@/components/common/SectionCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import TimeTriple from '@/components/common/TimeTriple.vue'
import UserPredictionRanking, { type UserRankingItem } from '@/components/common/UserPredictionRanking.vue'
import { useTeamName } from '@/composables/useTeamName'
import { getTeamLogoUrl, getPlayerAvatarUrl, getVenueImageUrl } from '@/utils/bsdImages'

const route = useRoute()
const router = useRouter()
const { t, locale: i18nLocale } = useI18n()
const matchStore = useMatchStore()
const userStore = useUserStore()
const { getTeamName } = useTeamName()

const loading = ref(false)
const match = ref<any>(null)
const errorState = ref<'' | 'not_found' | 'network'>('')
let unsubscribe: (() => void) | null = null

// ========== 扩展数据（交锋记录、赛事元数据、球员统计、赔率对比、社交媒体）==========
const h2hData = ref<any>(null)
const metadataData = ref<any>(null)
const playerStatsData = ref<any>(null)
const oddsComparisonData = ref<any>(null)
const socialData = ref<any>(null)

/** 获取赛事扩展数据 */
async function fetchExtendedData(matchId: string) {
  try {
    const [h2h, meta, pStats, odds, social] = await Promise.allSettled([
      http.get(`/matches/${matchId}/h2h`),
      http.get(`/matches/${matchId}/metadata`),
      http.get(`/matches/${matchId}/player-stats`),
      http.get(`/matches/${matchId}/odds-comparison`),
      http.get(`/matches/${matchId}/social`),
    ])
    if (h2h.status === 'fulfilled') h2hData.value = h2h.value
    if (meta.status === 'fulfilled') metadataData.value = meta.value
    if (pStats.status === 'fulfilled') playerStatsData.value = pStats.value
    if (odds.status === 'fulfilled') oddsComparisonData.value = odds.value
    if (social.status === 'fulfilled') socialData.value = social.value
  } catch (e) {
    console.warn('fetchExtendedData failed', e)
  }
}

// ========== 精彩集锦 / 赛事天气（湿度+温度+风速+描述）==========
// 精彩集锦数据（视频/新闻链接）
const highlightsData = ref<Array<{ kind: string; title: string; url: string; thumbnail: string; published_at: string }>>([])
// 湿度/天气
const weatherData = ref<{ humidity: number | null; temperature: number | null; windSpeed: number | null; weatherDescription: string } | null>(null)

/** 从 metadata.jerseys 解析球衣颜色（主色） */
const jerseyColors = computed<{ home: string; away: string } | null>(() => {
  const jerseys = (metadataData.value as any)?.jerseys
  if (!jerseys) return null
  const homeColor = jerseys?.home?.player?.base || jerseys?.home?.GK?.base
  const awayColor = jerseys?.away?.player?.base || jerseys?.away?.GK?.base
  if (!homeColor && !awayColor) return null
  return { home: homeColor || '#ccc', away: awayColor || '#ccc' }
})

// AbortController 防止组件卸载后 setState 触发警告 / 消除 net::ERR_ABORTED 日志
let fetchAbortCtrl: AbortController | null = null
function getAbortSignal(): AbortSignal {
  if (!fetchAbortCtrl) fetchAbortCtrl = new AbortController()
  return fetchAbortCtrl.signal
}

/** 获取精彩集锦（视频/新闻） */
async function fetchHighlights(matchId: string) {
  try {
    const r: any = await http.get(`/matches/${matchId}/highlights`, { signal: getAbortSignal() })
    if (!fetchAbortCtrl) return // 已被 abort
    highlightsData.value = r?.data ?? r ?? []
  } catch (e: any) {
    if (e?.name !== 'CanceledError' && e?.code !== 'ERR_CANCELED') {
      console.warn('fetchHighlights failed', e)
    }
  }
}

/** 获取赛事天气（湿度+温度+风速+描述） */
async function fetchWeatherData(matchId: string) {
  try {
    const detail: any = await http.get(`/matches/${matchId}`, { signal: getAbortSignal() })
    if (!fetchAbortCtrl) return
    const d = detail?.data ?? detail
    const lat = d?.venueLatitude
    const lon = d?.venueLongitude
    if (lat && lon && d?.eventDate) {
      const w: any = await http.get(`/external/weather?lat=${lat}&lon=${lon}&date=${encodeURIComponent(d.eventDate)}`, { signal: getAbortSignal() })
      if (!fetchAbortCtrl) return
      weatherData.value = w?.data ?? w ?? null
    }
  } catch (e: any) {
    if (e?.name !== 'CanceledError' && e?.code !== 'ERR_CANCELED') {
      console.warn('fetchWeatherData failed', e)
    }
  }
}

let prediction = ref<{
  homeWin: number
  draw: number
  awayWin: number
  reasoning?: string
  source: string
} | null>(null)

// ========== 用户预测排行（从后端 /ranking/users 获取）==========
const userPredictionRanking = ref<UserRankingItem[]>([])
const userRankingLoading = ref(false)

/**
 * 加载用户预测排行（按当前赛事维度）
 * 后端接口：GET /ranking/match/:matchId/users
 * 映射字段：userId / username / countryCode / lastModel / totalPredictions
 */
async function loadUserRanking() {
  userRankingLoading.value = true
  try {
    const matchId = route.params.id as string
    if (!matchId) return
    const res: any = await http.get(`/ranking/match/${matchId}/users`, { params: { limit: 7 } })
    const list = res?.list || res || []
    userPredictionRanking.value = list.map((item: any) => ({
      userId: item.userId || '',
      username: item.username || t('common.anonymous'),
      countryCode: item.countryCode || '',
      platform: item.lastPlatform || '',
      llmType: item.lastModel || '',
      accuracy: Number(item.totalPredictions) || 0,
    }))
  } catch (err) {
    console.error('[loadUserRanking] failed:', err)
  } finally {
    userRankingLoading.value = false
  }
}

// ========== 单维度指令报告（21 维度，每维度独立一条；agent 完成 1 条指令后只传该维度的 distribution）==========
const dimensionReports = ref<any[]>([])
const reportsLoading = ref(false)

// 监听 dimensionReports 变化，自动聚合 result_wdl 维度生成 AI 胜负率预测 + 重渲染图表
// 使用防抖避免高频分析时频繁触发全量重渲染
let renderDebounceTimer: ReturnType<typeof setTimeout> | null = null
watch(dimensionReports, (reports) => {
  const wdlReports = (reports || []).filter((r: any) => r?.dimKey === 'result_wdl' && r?.distribution)
  if (!wdlReports.length) {
    prediction.value = null
  } else {
    // 归一化 key：不同 Agent 可能用 home/home_win/主胜 等不同 key
    const normalizeKey = (k: string): 'home' | 'draw' | 'away' => {
      const kl = k.toLowerCase().trim()
      if (kl === 'home' || kl === 'home_win' || kl === '主胜' || kl === 'h') return 'home'
      if (kl === 'draw' || kl === '平' || kl === '平局' || kl === 'd') return 'draw'
      if (kl === 'away' || kl === 'away_win' || kl === '客胜' || kl === 'a') return 'away'
      return 'draw' // 未知 key 归入平局
    }
    // 时间加权聚合：越新的分析权重越高（指数衰减）
    // 最新报告权重=1，每往前一条衰减 0.85，最低 0.1
    const DECAY = 0.85
    const MIN_WEIGHT = 0.1
    let totalWeight = 0
    const weightedTotals: Record<string, number> = { home: 0, draw: 0, away: 0 }
    // wdlReports 按 createdAt DESC 排序（后端 order: { createdAt: 'DESC' }），所以第一条最新
    wdlReports.forEach((r: any, idx: number) => {
      const weight = Math.max(MIN_WEIGHT, Math.pow(DECAY, idx))
      totalWeight += weight
      const dist = r.distribution || {}
      Object.entries(dist).forEach(([k, v]) => {
        const nk = normalizeKey(k)
        weightedTotals[nk] = (weightedTotals[nk] || 0) + Number(v || 0) * weight
      })
    })
    const latest = wdlReports[0] // 最新的报告（DESC 排序后第一条）
    prediction.value = {
      homeWin: Number((weightedTotals['home'] / totalWeight).toFixed(4)),
      draw: Number((weightedTotals['draw'] / totalWeight).toFixed(4)),
      awayWin: Number((weightedTotals['away'] / totalWeight).toFixed(4)),
      reasoning: latest?.summary || '',
      source: latest?.model || 'Agent',
    }
  }
  // 防抖重渲染：300ms 内多次数据变化只触发一次
  if (renderDebounceTimer) clearTimeout(renderDebounceTimer)
  renderDebounceTimer = setTimeout(() => {
    renderAllDimensionCharts()
  }, 300)
}, { deep: true })
// 21 个维度的图表容器与实例（按 dimKey 索引）
const dimChartRefs = ref<Record<string, HTMLElement | null>>({})
const dimCharts: Record<string, any> = {}

/**
 * 调色板（21 维度共享）
 */
const DIM_COLOR_PALETTE = [
  '#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452', '#6DC8EC',
  '#9270CA', '#FF9D4D', '#269A99', '#FF99C3', '#1E90FF',
  '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
  '#84CC16', '#A855F7', '#EC4899', '#F97316', '#14B8A6',
  '#0EA5E9',
]

// ========== 复制指令弹窗（兼容非安全上下文，避免 navigator.clipboard 报错）==========
const copyDialogOpen = ref(false)
const copyDialogTabs = ref<Array<{ key: string; label: string; content: string }>>([])
// 新版引导弹窗：指令文本 + 自动复制状态
const copyDialogInstructionText = ref('')
const copyDialogAutoCopied = ref(false)

// ========== 舆情 ==========
/** 舆情数据三档：全部（赛事范围）/ 主队 / 客队 */
const matchSentiment = ref<any>(null)
const homeSentiment = ref<any>(null)
const awaySentiment = ref<any>(null)
const sentimentLoading = ref(false)
const sentimentExpanded = ref(true)
/** 当前查看的舆情视角：'all' = 赛事整体，'home' = 主队，'away' = 客队 */
const sentimentTab = ref<'all' | 'home' | 'away'>('all')
const sentimentChartRef = ref<HTMLElement>()
const distributionChartRef = ref<HTMLElement>()
let sentimentChart: echarts.ECharts | null = null
let distributionChart: echarts.ECharts | null = null

/** 当前 tab 对应展示的舆情数据（切换 tab 时用计算属性自动切换） */
const currentSentiment = computed<any>(() => {
  if (sentimentTab.value === 'home') return homeSentiment.value
  if (sentimentTab.value === 'away') return awaySentiment.value
  return matchSentiment.value
})

/** 当前 tab 对应的队伍名称（用于标题 / 空态描述） */
const currentSentimentLabel = computed<string>(() => {
  if (sentimentTab.value === 'home') return getTeamName(match.value?.homeTeam) || t('match.homeTeam')
  if (sentimentTab.value === 'away') return getTeamName(match.value?.awayTeam) || t('match.awayTeam')
  return ''
})

// ========== 球员阵容 ==========
const homePlayers = ref<any[]>([])
const awayPlayers = ref<any[]>([])
const lineupData = ref<any>(null) // 首发阵容数据（lineups 接口）
const playersLoading = ref(false)
const activeLineupTab = ref<'home' | 'away'>('home')

/**
 * 用户当前 API Key（用于回传指引）
 * 优先从 userStore 获取（登录后后端返回），兜底从 localStorage 获取
 */
const currentApiKey = computed(() => {
  return userStore?.user?.apiKey || localStorage.getItem('cupai_api_key') || ''
})

/**
 * 指令 ID 索引：按 dimKey 缓存（用于在「复制指令」中预填 curl 模板的 instructionId）
 * - 替代原 InstructionBoard 组件的功能
 * - 在 loadMatch 完成后拉取一次，失败也不影响主流程
 */
const instructionMap = ref<Record<string, IInstruction>>({})

/**
 * 构造通用输入
 * @param dimKey 可选 — 当前维度 key；传入时会预填 instructionMap[dimKey].id
 */
function buildCommonInput(dimKey?: DimensionKey): CopyInstructionInput {
  const baseInput: CopyInstructionInput = {
    match: match.value,
    homeTeam: match.value?.homeTeam as any,
    awayTeam: match.value?.awayTeam as any,
    homePlayers: homePlayers.value,
    awayPlayers: awayPlayers.value,
    locale: i18nLocale.value,
    getTeamNameFn: getTeamName,
    sentiment: matchSentiment.value
      ? {
          overall: matchSentiment.value.avgScore ?? 0,
          positiveRatio: matchSentiment.value.positiveRatio ?? 0,
          neutralRatio: matchSentiment.value.neutralRatio ?? 0,
          negativeRatio: matchSentiment.value.negativeRatio ?? 0,
          positiveKeywords: matchSentiment.value.topKeywords
            ? Object.entries(matchSentiment.value.topKeywords).map(([word, count]) => ({ word, count: count as number }))
            : [],
        }
      : null,
    prediction: prediction.value
      ? {
          homeWin: prediction.value.homeWin,
          draw: prediction.value.draw,
          awayWin: prediction.value.awayWin,
          reasoning: prediction.value.reasoning ?? '',
          source: prediction.value.source,
        }
      : null,
    userApiKey: currentApiKey.value,
    // 回传地址使用后端直连地址，不走 Vite 代理（避免代理连接问题导致 404）
    appBaseUrl: import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1$/, '')
      : (typeof window !== 'undefined' ? window.location.origin : undefined),
  }
  // 若传入了 dimKey，自动注入该维度的 instructionId（让 curl 模板中可一键复用）
  if (dimKey && instructionMap.value[dimKey]?.id) {
    baseInput.instructionId = instructionMap.value[dimKey].id
  }
  return baseInput
}

/**
 * 21 维度按 5 大板块分组（每个 SectionCard 一组）
 * 由 sectionDims(sectionKey) 返回该板块下所有维度的定义。
 */
function sectionDims(sectionKey: string): DimensionDef[] {
  return (Object.values(DIMENSIONS) as DimensionDef[]).filter((d) => d.section === sectionKey)
}


/** 设置维度图表容器的 DOM ref（模板中 :ref="(el) => setDimChartRef(...)"） */
function setDimChartRef(dimKey: string, el: HTMLElement | null) {
  if (el) dimChartRefs.value[dimKey] = el
  else delete dimChartRefs.value[dimKey]
}

/**
 * 获取某维度的「最高概率候选项」显示文本（i18n 解析后）
 * 用于图表标题右侧的"赢家"标签
 * 特殊：goal_player_score 显示"指定球员名 · 破门/未破门"
 */
function dimWinner(dimKey: DimensionKey): string {
  const r = dimensionReports.value.find((x) => x?.dimKey === dimKey)
  const winner = r?.extras?.winner
  if (!winner) return ''
  // 特殊：goal_player_score 维度 → 显示"球员名 · 破门/未破门"
  if (dimKey === 'goal_player_score') {
    const playerId = r?.extras?.playerId
    const playerName = resolvePlayerName(playerId)
    const verdict = winner === 'score' ? t('dim.optScore') : t('dim.optNoScore')
    return playerName ? `${playerName} · ${verdict}` : verdict
  }
  // 常规维度：按 optionsKeys 索引匹配 optionsI18nKeys
  const dimDef = DIMENSIONS[dimKey]
  const optKeys = dimDef?.optionsKeys || []
  const optI18nKeys = dimDef?.optionsI18nKeys || []
  const idx = optKeys.indexOf(winner)
  if (idx >= 0 && idx < optI18nKeys.length) {
    return t(optI18nKeys[idx]) as string
  }
  // 自由输出维度（result_exact_score）：winner 本身就是比分
  return winner
}

/** 获取某维度的置信度（0..1） */
function dimConfidence(dimKey: DimensionKey): number {
  const r = dimensionReports.value.find((x) => x?.dimKey === dimKey)
  return Number(r?.extras?.confidence) || 0
}

/** 获取某维度的预测次数（即该维度有多少条 agent 报告） */
function dimPredictCount(dimKey: DimensionKey): number {
  return (dimensionReports.value || []).filter((r) => r?.dimKey === dimKey && r?.distribution).length
}

/**
 * 根据 playerId 解析球员名（在主客队阵容中查找）
 * @param playerId 球员 ID
 * @param homeList 主队球员（可选，默认读响应式数组）
 * @param awayList 客队球员（可选，默认读响应式数组）
 */
function resolvePlayerName(
  playerId?: string | null,
  homeList?: any[],
  awayList?: any[],
): string {
  if (!playerId) return ''
  const h = homeList || homePlayers.value
  const a = awayList || awayPlayers.value
  const all = [...(h || []), ...(a || [])]
  return all.find((p: any) => p.id === playerId)?.name || ''
}

/**
 * 分析单维度 — 自动复制指令 + 打开引导弹窗
 * 新版交互：点击"分析"按钮后，系统自动复制指令到剪贴板，同时弹出 3 步引导弹窗
 */
async function copyDimension(dimKey: DimensionKey) {
  // 未登录跳转登录页
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  const def = DIMENSIONS[dimKey]
  if (!def) return
  const input = buildCommonInput(dimKey)
  const title = t(def.i18nKey)
  const question = t(def.questionI18nKey)
  // 选项：受控维度用 optionsI18nKeys；自由输出维度（result_exact_score）使用全部比分 key
  let options: string[]
  if (def.optionsI18nKeys.length) {
    options = def.optionsI18nKeys.map((k) => t(k))
  } else {
    // 自由输出：列当前 distribution 的所有 key
    const r = dimensionReports.value.find((x) => x?.dimKey === dimKey)
    options = Object.keys(r?.distribution || {})
  }
  const text = buildDimensionInstruction(dimKey, input, title, question, options)

  // 自动复制到剪贴板
  let autoCopied = false
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      autoCopied = true
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      autoCopied = true
    }
  } catch {
    autoCopied = false
  }

  // 打开引导弹窗
  copyDialogInstructionText.value = text
  copyDialogAutoCopied.value = autoCopied
  copyDialogOpen.value = true
}

/**
 * 分析球员 — 自动复制指令 + 打开引导弹窗
 */
async function openPlayerCopyDialog(player: any, side: 'home' | 'away') {
  // 未登录跳转登录页
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  const teamName = side === 'home' ? getTeamName(match.value?.homeTeam) : getTeamName(match.value?.awayTeam)
  const text = buildPlayerInstruction({
    player: { ...player, teamName },
    userApiKey: currentApiKey.value,
    locale: i18nLocale.value,
    appBaseUrl: import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1$/, '')
      : (typeof window !== 'undefined' ? window.location.origin : undefined),
  })

  // 自动复制到剪贴板
  let autoCopied = false
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      autoCopied = true
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      autoCopied = true
    }
  } catch {
    autoCopied = false
  }

  copyDialogInstructionText.value = text
  copyDialogAutoCopied.value = autoCopied
  copyDialogOpen.value = true
}

/**
 * 分析球队 — 自动复制指令 + 打开引导弹窗
 */
async function openTeamCopyDialog(side: 'home' | 'away') {
  // 未登录跳转登录页
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  const team = side === 'home' ? match.value?.homeTeam : match.value?.awayTeam
  const players = side === 'home' ? homePlayers.value : awayPlayers.value
  if (!team) return
  const text = buildTeamInstruction({
    team: {
      ...(team as any),
      id: team.id,
      keyPlayers: players.filter((p) => p.isKeyPlayer).slice(0, 5),
    },
    userApiKey: currentApiKey.value,
    locale: i18nLocale.value,
    appBaseUrl: import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1$/, '')
      : (typeof window !== 'undefined' ? window.location.origin : undefined),
  })

  // 自动复制到剪贴板
  let autoCopied = false
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      autoCopied = true
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      autoCopied = true
    }
  } catch {
    autoCopied = false
  }

  copyDialogInstructionText.value = text
  copyDialogAutoCopied.value = autoCopied
  copyDialogOpen.value = true
}

/** 复制整场赛事分析指令（弹窗显示），预留功能 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function openFullMatchCopyDialog() {
  const text = buildMatchInstruction(buildCommonInput())
  copyDialogOpen.value = true
  copyDialogTabs.value = [
    { key: 'match-all', label: getTeamName(match.value?.homeTeam) ? `${getTeamName(match.value?.homeTeam)} VS ${getTeamName(match.value?.awayTeam) || ''}` : t('copyIntro.tabMatch'), content: text },
  ]
}

// ========== 8 因子字段映射（定义在下方，与球员分组并列）==========

// ========== 球员分组（按位置）==========
const POSITION_NORMALIZE: Record<string, string> = {
  GK: 'GK', Goalkeeper: 'GK', 守门员: 'GK', 门将: 'GK', G: 'GK',
  DF: 'DF', Defender: 'DF', 后卫: 'DF', 防守: 'DF', D: 'DF',
  MF: 'MF', Midfielder: 'MF', 中场: 'MF', M: 'MF',
  FW: 'FW', Forward: 'FW', Striker: 'FW', 前锋: 'FW', 进攻: 'FW', F: 'FW',
}

const positionOrder: Array<{ key: 'GK' | 'DF' | 'MF' | 'FW'; label: string }> = [
  { key: 'GK', label: 'match.positionGK' },
  { key: 'DF', label: 'match.positionDF' },
  { key: 'MF', label: 'match.positionMF' },
  { key: 'FW', label: 'match.positionFW' },
]

function normalizePosition(pos: string): 'GK' | 'DF' | 'MF' | 'FW' | '' {
  if (!pos) return ''
  return (POSITION_NORMALIZE[pos] || POSITION_NORMALIZE[pos.toUpperCase()] || '') as any
}

function groupByPosition(players: any[]) {
  const groups: Record<string, any[]> = { GK: [], DF: [], MF: [], FW: [], OTHER: [] }
  for (const p of players || []) {
    const key = normalizePosition(p.position) || 'OTHER'
    groups[key].push(p)
  }
  return groups
}

function injuryType(status: string | undefined): 'success' | 'warning' | 'danger' | 'info' {
  if (!status) return 'success'
  const s = status.toLowerCase()
  if (s.includes('healthy') || s.includes('fit') || s.includes('健康')) return 'success'
  if (s.includes('doubt') || s.includes('questionable') || s.includes('存疑')) return 'warning'
  if (s.includes('injury') || s.includes('out') || s.includes('伤') || s.includes('停')) return 'danger'
  return 'info'
}

function injuryLabel(status: string | undefined): string {
  if (!status) return t('match.healthy')
  return status
}

const activePlayers = computed(() =>
  activeLineupTab.value === 'home' ? homePlayers.value : awayPlayers.value,
)
const activeTeam = computed(() =>
  activeLineupTab.value === 'home' ? match.value?.homeTeam : match.value?.awayTeam,
)
const activeGrouped = computed(() => groupByPosition(activePlayers.value))

/**
 * 根据 BSD 球员 ID 查找球员名称
 * 用于球员统计面板中将 player_id 映射为可读名称
 */
function getPlayerNameById(bsPlayerId: number): string {
  if (!bsPlayerId) return ''
  // 从阵容数据中查找（lineup 接口返回的球员有 bsPlayerId + playerName）
  const allPlayers = [...homePlayers.value, ...awayPlayers.value]
  const found = allPlayers.find((p: any) => p.bsPlayerId === bsPlayerId || p.bsdPlayerId === bsPlayerId || p.id === bsPlayerId)
  return found?.playerName || found?.name || found?.nameEn || ''
}

// ========== 8 因子字段映射 ==========
const factorLabels = computed<Record<string, string>>(() => ({
  shots: t('match.shots'),
  shotsOnTarget: t('match.shotsOnTarget'),
  possession: t('match.possession'),
  corners: t('match.corners'),
  fouls: t('match.fouls'),
  offsides: t('match.offsides'),
  yellowCards: t('match.yellowCards'),
  redCards: t('match.redCards'),
  passes: t('match.passes'),
  passAccuracy: t('match.passAccuracy'),
  historicalRecord: t('match.historicalRecord'),
  teamStrength: t('match.teamStrength'),
  playerStatus: t('match.playerStatus'),
  realtimeDynamic: t('match.realtimeDynamic'),
  environment: t('match.environmentFactor'),
  tacticalCounter: t('match.tacticalCounter'),
  socialSentiment: t('match.socialSentiment'),
  hiddenFactors: t('match.hiddenFactors'),
}))

function factorLabel(key: string): string {
  return factorLabels.value[key] || key
}
function formatFactorValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
function formatTime(dateStr: string | undefined) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString(i18nLocale.value)
}

/** 用户时区名称（如 "Asia/Shanghai"） */
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

/** 格式化赛事当地开赛时间（举办国时间，世界杯为美东时间 UTC-4） */
function formatLocalTime(dateStr: string | Date): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  // 2026 世界杯在美国举办，使用美东时区
  return d.toLocaleString(i18nLocale.value, { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}

/** 格式化用户本地观看时间 */
function formatUserTime(dateStr: string | Date): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString(i18nLocale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}

/** 格式化UTC基准时间 */
function formatUtcTime(dateStr: string | Date): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString(i18nLocale.value, { timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' })
}
function stageLabel(stage: string | undefined) {
  if (!stage) return '-'
  const key = `match.stage${stage.charAt(0).toUpperCase() + stage.slice(1)}`
  return t(key, stage)
}
function getSentimentColor(score: number): string {
  if (score > 0.3) return 'var(--color-success)'
  if (score > 0) return 'var(--color-warning)'
  return 'var(--color-danger)'
}
function getPolarityType(polarity: string): 'success' | 'danger' | 'info' {
  if (polarity === 'positive') return 'success'
  if (polarity === 'negative') return 'danger'
  return 'info'
}
function getPolarityLabel(polarity: string) {
  if (polarity === 'positive') return t('sentiment.positive')
  if (polarity === 'negative') return t('sentiment.negative')
  return t('sentiment.neutral')
}
function platformLabel(platform: string) {
  const map: Record<string, string> = {
    twitter: t('match.platformTwitter'),
    reddit: t('match.platformReddit'),
    weibo: t('match.platformWeibo'),
  }
  return map[platform] || platform
}

function getRateColor(rate: number): string {
  if (rate >= 0.5) return 'var(--color-success)'
  if (rate >= 0.3) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/match')
  }
}

// ========== AI 预测（已改为 computed，从 result_wdl 维度报告聚合生成）==========
// 不再单独调用 /matches/{id}/prediction 接口

// ========== 单维度指令报告加载（21 维度，每维度 1 个图表） ==========

/**
 * 加载该赛事的单维度报告
 * - agent 完成 1 条分析指令后只回传该维度的 distribution（不再传整份 result）
 */
async function loadDimensionReports(matchId: string) {
  reportsLoading.value = true
  try {
    // 懒加载 dimension API
    const { listDimensions } = await import('@/api/dimension')
    const res = await listDimensions(matchId, undefined, 200)
    dimensionReports.value = res?.list || []
  } catch (err) {
    console.error('[loadDimensionReports] failed:', err)
  } finally {
    reportsLoading.value = false
    // 等待 DOM 更新后渲染所有维度的图表
    await nextTick()
    renderAllDimensionCharts()
  }
}

// ========== 维度数据定时轮询（Agent 回调后前端自动刷新） ==========
let dimensionPollTimer: ReturnType<typeof setInterval> | null = null
/** 比赛时长自动更新定时器 */
let matchMinuteTimer: ReturnType<typeof setInterval> | null = null

/** 启动维度数据轮询（每 15 秒刷新一次） */
function startDimensionPoll(matchId: string) {
  stopDimensionPoll()
  dimensionPollTimer = setInterval(async () => {
    try {
      const { listDimensions } = await import('@/api/dimension')
      const res = await listDimensions(matchId, undefined, 200)
      const newList = res?.list || []
      // 数据变化时更新（长度变化或最新记录 ID 变化）
      const oldLen = dimensionReports.value.length
      const newLen = newList.length
      const oldFirstId = dimensionReports.value[0]?.id
      const newFirstId = newList[0]?.id
      if (newLen !== oldLen || (newLen > 0 && oldFirstId !== newFirstId)) {
        dimensionReports.value = newList
        // 维度数据变化时同步刷新用户排行
        loadUserRanking()
      }
    } catch (err) {
      // 轮询失败静默，不打扰用户
    }
  }, 15000)
}

/** 停止维度数据轮询 */
function stopDimensionPoll() {
  if (dimensionPollTimer) {
    clearInterval(dimensionPollTimer)
    dimensionPollTimer = null
  }
}

/** 启动比赛时长自动更新（每30秒校准一次） */
function startMatchMinutePoll(matchId: string) {
  stopMatchMinutePoll()
  if (match.value?.status !== 'live') return
  matchMinuteTimer = setInterval(async () => {
    try {
      const data = await matchStore.fetchMatchDetail(matchId) as any
      if (data && match.value) {
        // 仅更新实时相关字段，避免覆盖用户正在查看的其他数据
        if (data.currentMinute !== undefined) match.value.currentMinute = data.currentMinute
        if (data.period !== undefined) match.value.period = data.period
        if (data.homeScore !== undefined) match.value.homeScore = data.homeScore
        if (data.awayScore !== undefined) match.value.awayScore = data.awayScore
        if (data.halfTimeHome !== undefined) match.value.halfTimeHome = data.halfTimeHome
        if (data.halfTimeAway !== undefined) match.value.halfTimeAway = data.halfTimeAway
        if (data.penaltyShootout !== undefined) match.value.penaltyShootout = data.penaltyShootout
        if (data.bsStatus !== undefined) match.value.bsStatus = data.bsStatus
        if (data.status !== undefined) match.value.status = data.status
        // 赛事结束则停止轮询
        if (data.status !== 'live') stopMatchMinutePoll()
      }
    } catch {
      // 静默失败，下次轮询重试
    }
  }, 30000) // 每30秒
}

/** 停止比赛时长轮询 */
function stopMatchMinutePoll() {
  if (matchMinuteTimer) {
    clearInterval(matchMinuteTimer)
    matchMinuteTimer = null
  }
}

/**
 * 归一化维度 distribution key
 * 不同 Agent 可能返回中文 key（主胜/平/客胜）或变体 key（home_win/away_win），
 * 需要映射为 DIMENSIONS 中定义的标准 optionsKey
 */
function normalizeDimKey(dimKey: string, key: string): string {
  const kl = key.toLowerCase().trim()
  // result_wdl: home/home_win/主胜 → home, draw/平 → draw, away/away_win/客胜 → away
  if (dimKey === 'result_wdl') {
    if (kl === 'home' || kl === 'home_win' || kl === '主胜' || kl === 'h') return 'home'
    if (kl === 'draw' || kl === '平' || kl === '平局' || kl === 'd') return 'draw'
    if (kl === 'away' || kl === 'away_win' || kl === '客胜' || kl === 'a') return 'away'
  }
  // result_half_full: 中文 key 映射 → 标准英文 key
  // Agent 可能返回 "主/主"/"主/平"/"主/客" 等中文格式
  if (dimKey === 'result_half_full') {
    const hfMap: Record<string, string> = {
      '主/主': 'HW', '主/平': 'HD', '主/客': 'HL',
      '平/主': 'DW', '平/平': 'DD', '平/客': 'DL',
      '客/主': 'LW', '客/平': 'LD', '客/客': 'LL',
      // 兼容 H-H / H-D / H-A 等格式
      'H-H': 'HW', 'H-D': 'HD', 'H-A': 'HL',
      'D-H': 'DW', 'D-D': 'DD', 'D-A': 'DL',
      'A-H': 'LW', 'A-D': 'LD', 'A-A': 'LL',
    }
    if (hfMap[key]) return hfMap[key]
  }
  // goal_first / goal_last: none → noGoal
  if (dimKey === 'goal_first' || dimKey === 'goal_last') {
    if (kl === 'none' || kl === 'nogoal' || kl === '无') return 'noGoal'
  }
  // goal_first_half: yes/no → Yes/No (保持 optionsKey 大小写)
  if (dimKey === 'goal_first_half') {
    if (kl === 'yes' || kl === '是') return 'yes'
    if (kl === 'no' || kl === '否') return 'no'
  }
  // goal_clean_sheet: 中文 key 映射
  if (dimKey === 'goal_clean_sheet') {
    if (kl === 'homeclean' || kl === '主队零封') return 'homeClean'
    if (kl === 'awayclean' || kl === '客队零封') return 'awayClean'
    if (kl === 'bothconcede' || kl === '双方都有失球') return 'bothConcede'
  }
  // goal_odd_even: 中文 key 映射
  if (dimKey === 'goal_odd_even') {
    if (kl === 'odd' || kl === '奇数') return 'odd'
    if (kl === 'even' || kl === '偶数') return 'even'
  }
  // penalty_awarded / goal_own / goal_stoppage / red_card: 中文 key 映射
  if (['penalty_awarded', 'goal_own', 'goal_stoppage', 'red_card'].includes(dimKey)) {
    if (kl === 'yes' || kl === '是') return 'yes'
    if (kl === 'no' || kl === '否') return 'no'
  }
  // extra_round: 中文 key 映射
  if (dimKey === 'extra_round') {
    if (kl === 'extra' || kl === '加时赛') return 'extra'
    if (kl === 'penalty' || kl === '点球大战') return 'penalty'
    if (kl === 'normal' || kl === '常规时间') return 'normal'
  }
  // goal_player_score: 中文 key 映射
  if (dimKey === 'goal_player_score') {
    if (kl === 'score' || kl === '进球') return 'score'
    if (kl === 'noscore' || kl === '未进球') return 'noScore'
  }
  // result_total_goals: 中文 key 映射（"4+" 可能返回 "4球以上"）
  if (dimKey === 'result_total_goals') {
    if (kl === '4+' || kl === '4球以上' || kl === '4+') return '4+'
  }
  // goal_first / goal_last: 中文 key 映射
  if (dimKey === 'goal_first' || dimKey === 'goal_last') {
    if (kl === 'home' || kl === '主队') return 'home'
    if (kl === 'away' || kl === '客队') return 'away'
  }
  // 其他维度：如果 key 在 optionsKeys 中存在，直接返回；否则原样返回
  const optKeys = DIMENSIONS[dimKey as DimensionKey]?.optionsKeys || []
  if (optKeys.includes(key)) return key
  // 尝试小写匹配
  const match = optKeys.find((ok) => ok.toLowerCase() === kl)
  if (match) return match
  return key
}

/**
 * 聚合指定维度的分布（平均所有该维度的报告）
 * @param dimKey 维度 key
 * @returns { labels, values, count }
 */
function aggregateDimension(dimKey: DimensionKey) {
  const list = dimensionReports.value || []
  const totals: Record<string, number> = {}
  let count = 0
  list.forEach((r) => {
    if (r?.dimKey !== dimKey) return
    const dist = r?.distribution
    if (!dist) return
    Object.entries(dist).forEach(([k, v]) => {
      // 归一化 key：将中文/变体 key 映射为标准 optionsKey
      const nk = normalizeDimKey(dimKey, k)
      totals[nk] = (totals[nk] || 0) + Number(v || 0)
    })
    count += 1
  })
  if (!count) return { labels: [], values: [], count: 0 }
  // 按 DIMENSIONS 中 optionsKeys 顺序排序（确保 key 顺序稳定）
  // 注意：必须用 optionsKeys（短 key 列表，对应 distribution 中的 key），
  //       不要再用 optionsI18nKeys（i18n key 列表），否则排序全部失效。
  const optKeys = DIMENSIONS[dimKey]?.optionsKeys || []
  const orderMap = new Map(optKeys.map((k, i) => [k, i]))
  const labels = Object.keys(totals).sort((a, b) => {
    const oa = orderMap.has(a) ? orderMap.get(a)! : 999
    const ob = orderMap.has(b) ? orderMap.get(b)! : 999
    return oa - ob
  })
  const values = labels.map((k) => Number((totals[k] / count).toFixed(4)))
  return { labels, values, count }
}

/**
 * 推断图表类型（按维度 key + 选项数量自适应）
 * - 板块五 (corner) 维度：3+ 项使用雷达图（PRD 6 · 边角趣味数据 → 多维雷达分布图）
 * - 2 项：环形图（环形对比）
 * - 3-4 项：饼图
 * - 5+ 项：横向条形图（按值倒序）
 */
type ChartKind = 'ring' | 'pie' | 'bar-h' | 'bar-v' | 'radar'

function pickChartType(dimKey: DimensionKey, n: number): ChartKind {
  if (n === 0) return 'bar-h'
  // PRD 6：板块五 边角趣味数据 → 多维雷达分布图
  if (dimKey.startsWith('corner_') && n >= 3) return 'radar'
  if (n === 2) return 'ring'
  if (n <= 4) return 'pie'
  return 'bar-h'
}

/**
 * 渲染所有 21 个维度的图表
 * 优化：复用已有 ECharts 实例，仅对无实例的维度 init，已有实例直接 setOption 更新
 */
function renderAllDimensionCharts() {
  // 遍历 5 大板块的所有维度
  for (const section of DIMENSION_SECTIONS) {
    for (const dim of Object.values(DIMENSIONS)) {
      if (dim.section !== section.key) continue
      renderDimensionChart(dim.key as DimensionKey)
    }
  }
}

/**
 * 渲染单个维度的图表
 * 优化：复用已有 ECharts 实例，仅 setOption 更新数据，避免 dispose+init 导致闪烁
 * @param dimKey 维度 key
 */
function renderDimensionChart(dimKey: DimensionKey) {
  const el = dimChartRefs.value[dimKey]
  if (!el) return
  // 复用已有实例，避免 dispose+init 导致图表闪烁
  let chart = dimCharts[dimKey]
  if (!chart || chart.isDisposed?.()) {
    chart = echarts.init(el)
    dimCharts[dimKey] = chart
  }
  const { labels, values } = aggregateDimension(dimKey)
  const dimDef = DIMENSIONS[dimKey]
  const optKeys = dimDef?.optionsKeys || []
  const optI18nKeys = dimDef?.optionsI18nKeys || []
  // === 空数据兜底：维度暂无 agent 报告时仍渲染图表骨架 + 「暂无数据」占位文字 ===
  // 需求：图表区域不出现空白凹陷；用户进入页面应能看到完整的 21 维度结构
  if (!labels.length) {
    chart.setOption({
      tooltip: { show: false },
      grid: { left: 16, right: 16, top: 16, bottom: 16, containLabel: true },
      xAxis: { type: 'value', show: false, min: 0, max: 1 },
      yAxis: { type: 'category', show: false, data: [''] },
      graphic: [
        {
          type: 'group',
          left: 'center',
          top: 'middle',
          children: [
            {
              type: 'text',
              style: {
                text: t('match.dimNoData'),
                fill: '#94a3b8',
                fontSize: 14,
                fontWeight: 500,
              },
            },
            {
              type: 'text',
              top: 24,
              style: {
                text: t('match.dimNoDataDesc'),
                fill: '#cbd5e1',
                fontSize: 11,
              },
            },
          ],
        },
      ],
      series: [{ type: 'bar', data: [0], barWidth: '40%', itemStyle: { color: '#e2e8f0', borderRadius: 4 } }],
    })
    dimCharts[dimKey] = chart
    return
  }
  // i18n label 解析：distribution key 按索引匹配 optionsKeys → optionsI18nKeys
  //   例：result_total_goals distribution = { '0': 0.04, '1': 0.18, ... }
  //       optionsKeys = ['0', '1', '2', '3', '4+']
  //       optionsI18nKeys = ['dim.optGoal0', 'dim.optGoal1', ...]
  //       → '0' 解析为 $t('dim.optGoal0')
  // 自由输出维度（result_exact_score）：distribution key = 比分字符串，直接展示
  const labelByKey: Record<string, string> = {}
  labels.forEach((k) => {
    const idx = optKeys.indexOf(k)
    if (idx >= 0 && idx < optI18nKeys.length) {
      labelByKey[k] = t(optI18nKeys[idx]) as string
    } else {
      // 自由输出或未匹配：保持原 key（精准比分等）
      labelByKey[k] = k
    }
  })
  // 按 optionsKeys 顺序排序 labels，保证图表选项顺序稳定
  const sortedIndices = labels
    .map((k, i) => ({ k, i, order: optKeys.indexOf(k) }))
    .sort((a, b) => (a.order < 0 ? 999 : a.order) - (b.order < 0 ? 999 : b.order))
    .map((x) => x.i)
  // 关键：data.name 改用 i18n 解析后的 label，让 legend / tooltip / formatter 都拿到中文
  const data = sortedIndices.map((i, colorIdx) => ({
    name: labelByKey[labels[i]] || labels[i],
    value: values[i],
    itemStyle: { color: DIM_COLOR_PALETTE[colorIdx % DIM_COLOR_PALETTE.length] },
  }))
  const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`
  // fmtName 仍保留兼容路径（数据无 labelByKey 时回落原 key）
  const fmtName = (name: string) => labelByKey[name] || name
  const chartType = pickChartType(dimKey, data.length)

  const baseTooltip = {
    trigger: chartType === 'bar-h' || chartType === 'bar-v' ? 'axis' : 'item',
    formatter: (arg: any) => {
      if (Array.isArray(arg)) {
        const p = arg[0]
        return `${fmtName(p.name)}<br/>${fmtPct(p.value)}`
      }
      return `${arg.marker}${fmtName(arg.name)}<br/>${fmtPct(arg.value)}`
    },
  }

  if (chartType === 'ring') {
    chart.setOption({
      tooltip: baseTooltip,
      legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#4b5563' } },
      series: [{
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '46%'],
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true, position: 'outside',
          formatter: (p: any) => `${fmtName(p.name)} ${fmtPct(p.value)}`,
          color: '#374151', fontSize: 12,
        },
        data,
      }],
    })
  } else if (chartType === 'radar') {
    // 雷达图（PRD 6 · 板块五 边角趣味数据 → 多维雷达分布图）
    // 3+ 候选项的概率分布映射到雷达轴上
    chart.setOption({
      tooltip: baseTooltip,
      legend: {
        bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8,
        textStyle: { color: '#4b5563', fontSize: 12 },
        data: [t('dimSection.cornerTitle')],
      },
      radar: {
        center: ['50%', '46%'],
        radius: '64%',
        splitNumber: 4,
        axisName: { color: '#4b5563', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(91, 143, 249, 0.18)' } },
        splitArea: { areaStyle: { color: ['rgba(91, 143, 249, 0.04)', 'rgba(91, 143, 249, 0.08)'] } },
        axisLine: { lineStyle: { color: 'rgba(91, 143, 249, 0.25)' } },
        // 雷达指标 = 各候选项；max 按最高概率 *1.2 自适应
        indicator: data.map((d) => ({ name: d.name, max: Math.max(0.1, Math.ceil(d.value * 12) / 10) })),
      },
      series: [{
        type: 'radar',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#5b8ff9', width: 2 },
        itemStyle: { color: '#5b8ff9' },
        areaStyle: { color: 'rgba(91, 143, 249, 0.22)' },
        data: [{
          value: data.map((d) => Number((d.value * 100).toFixed(1))),
          name: t('dimSection.cornerTitle'),
        }],
      }],
    })
  } else if (chartType === 'pie') {
    chart.setOption({
      tooltip: baseTooltip,
      legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#4b5563' } },
      series: [{
        type: 'pie',
        radius: '62%',
        center: ['50%', '46%'],
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true, position: 'outside',
          formatter: (p: any) => `${fmtName(p.name)} ${fmtPct(p.value)}`,
          color: '#374151', fontSize: 11,
        },
        data,
      }],
    })
  } else if (chartType === 'bar-h') {
    // 横向条形图（按值倒序，5+ 项）
    const sorted = data
      .map((d) => ({ name: d.name, value: d.value, color: d.itemStyle.color }))
      .sort((a, b) => b.value - a.value)
    chart.setOption({
      tooltip: baseTooltip,
      grid: { left: 8, right: 40, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10, formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
        splitLine: { lineStyle: { color: 'rgba(91, 143, 249, 0.1)' } },
      },
      yAxis: {
        type: 'category',
        data: sorted.map((s) => s.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#4b5563', fontSize: 11, formatter: (v: string) => fmtName(v) },
      },
      series: [{
        type: 'bar',
        data: sorted.map((s) => ({ value: s.value, itemStyle: { color: s.color, borderRadius: [0, 6, 6, 0] } })),
        barWidth: '55%',
        label: { show: true, position: 'right', color: '#4b5563', fontSize: 10, formatter: (p: any) => fmtPct(p.value) },
      }],
    })
  } else {
    // 竖向柱状图（0 项数据回退）
    chart.setOption({
      tooltip: baseTooltip,
      grid: { left: 32, right: 16, top: 16, bottom: 28 },
      xAxis: { type: 'category', data: labels, axisLine: { lineStyle: { color: '#d1d5db' } }, axisLabel: { color: '#6b7280', fontSize: 11, formatter: (v: string) => fmtName(v) } },
      yAxis: { type: 'value', max: 0.6, axisLabel: { color: '#6b7280', fontSize: 10, formatter: (v: number) => `${(v * 100).toFixed(0)}%` }, splitLine: { lineStyle: { color: 'rgba(91, 143, 249, 0.1)' } } },
      series: [{ type: 'bar', data: values, barWidth: '52%', itemStyle: { borderRadius: [6, 6, 0, 0] } }],
    })
  }
  dimCharts[dimKey] = chart
}

// ========== 舆情加载 ==========
/**
 * 并行拉取赛事 / 主队 / 客队 3 档舆情
 * 后端接口：GET /sentiment/match/:matchId、GET /sentiment/team/:teamId
 */
async function loadAllSentiment(matchId: string, homeTeamId?: string, awayTeamId?: string) {
  sentimentLoading.value = true
  try {
    // 3 档独立拉取，任一失败静默（其余 2 档仍可正常展示）
    const tasks: Array<Promise<void>> = [
      http.get<any>(`/sentiment/match/${matchId}`).then((res) => { matchSentiment.value = res || null }).catch(() => { matchSentiment.value = null }),
    ]
    if (homeTeamId) {
      tasks.push(
        http.get<any>(`/sentiment/team/${homeTeamId}`).then((res) => { homeSentiment.value = res || null }).catch(() => { homeSentiment.value = null }),
      )
    }
    if (awayTeamId) {
      tasks.push(
        http.get<any>(`/sentiment/team/${awayTeamId}`).then((res) => { awaySentiment.value = res || null }).catch(() => { awaySentiment.value = null }),
      )
    }
    await Promise.all(tasks)
  } catch (err) {
    console.error('[loadAllSentiment] failed:', err)
  } finally {
    sentimentLoading.value = false
    await nextTick()
    renderSentimentCharts(currentSentiment.value)
    // prediction 已改为 computed，从 dimensionReports 自动聚合
  }
}

/**
 * 拉取本场赛事的所有 agent 指令（按 dimKey 索引）
 * 用于在「复制指令」按钮生成的 curl 模板中预填 instructionId
 * 替代原 InstructionBoard 组件的功能
 */
async function loadInstructions(matchId: string) {
  if (!matchId) return
  try {
    const resp = await listInstructions({ matchId, pageSize: 100 })
    const map: Record<string, IInstruction> = {}
    for (const ins of resp.list || []) {
      if (ins?.dimKey && ins?.id) map[ins.dimKey] = ins
    }
    instructionMap.value = map
  } catch (err) {
    console.error('[loadInstructions] failed:', err)
    instructionMap.value = {}
  }
}

function renderSentimentCharts(data: any) {
  // 调色板：4 个情感维度的颜色
  const palette = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452']
  if (sentimentChartRef.value) {
    if (sentimentChart) sentimentChart.dispose()
    sentimentChart = echarts.init(sentimentChartRef.value)
    sentimentChart.setOption({
      tooltip: { trigger: 'item' },
      radar: {
        indicator: [
          { name: t('sentiment.sentimentScore'), max: 1 },
          { name: t('sentiment.positiveRatio'), max: 1 },
          { name: t('sentiment.negativeRatio'), max: 1 },
          { name: t('sentiment.pressureIndex'), max: 1 },
        ],
        radius: '68%',
        center: ['50%', '52%'],
        splitNumber: 4,
        axisName: { color: '#4b5563', fontSize: 12, fontWeight: 500 },
        splitLine: { lineStyle: { color: 'rgba(91, 143, 249, 0.18)' } },
        splitArea: {
          areaStyle: {
            color: ['rgba(91, 143, 249, 0.04)', 'rgba(91, 143, 249, 0.10)'],
            shadowBlur: 8,
            shadowColor: 'rgba(91, 143, 249, 0.06)',
          },
        },
        axisLine: { lineStyle: { color: 'rgba(91, 143, 249, 0.25)' } },
      },
      series: [
        {
          type: 'radar',
          symbol: 'circle',
          symbolSize: 6,
          data: [
            {
              value: [
                Math.max(0, Number(data.avgScore || 0)),
                Number(data.positiveRatio || 0),
                Number(data.negativeRatio || 0),
                Number(data.pressureIndex || 0),
              ],
              name: t('sentiment.matchSentiment'),
              lineStyle: { color: palette[0], width: 2.5 },
              itemStyle: { color: palette[0] },
              areaStyle: {
                color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(91, 143, 249, 0.55)' },
                  { offset: 1, color: 'rgba(91, 143, 249, 0.08)' },
                ]),
              },
            },
          ],
        },
      ],
    })
  }
  if (distributionChartRef.value) {
    if (distributionChart) distributionChart.dispose()
    distributionChart = echarts.init(distributionChartRef.value)
    const positive = Number(data.positiveRatio || 0)
    const negative = Number(data.negativeRatio || 0)
    const neutral = Math.max(0, 1 - positive - negative)
    // 三个色块使用渐变，中心放汇总
    distributionChart.setOption({
      tooltip: { trigger: 'item' },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: '#4b5563', fontSize: 12 },
      },
      series: [
        {
          type: 'pie',
          radius: ['52%', '78%'],
          center: ['50%', '46%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, position: 'outside', formatter: '{b}\n{d}%', color: '#374151', fontSize: 12 },
          labelLine: { length: 10, length2: 10 },
          data: [
            {
              name: t('sentiment.positive'),
              value: positive,
              itemStyle: {
                color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#34D399' },
                  { offset: 1, color: '#10B981' },
                ]),
              },
            },
            {
              name: t('sentiment.neutral'),
              value: neutral,
              itemStyle: {
                color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#CBD5E1' },
                  { offset: 1, color: '#94A3B8' },
                ]),
              },
            },
            {
              name: t('sentiment.negative'),
              value: negative,
              itemStyle: {
                color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#FB7185' },
                  { offset: 1, color: '#E11D48' },
                ]),
              },
            },
          ],
        },
      ],
    })
  }
}

// ========== 分享链接 ==========
const sharePageUrl = computed(() => {
  if (!match.value) return ''
  return `${window.location.origin}/match/${match.value.id}`
})

/** 自动识别当前页面信息，生成分享文案 */
const shareText = computed(() => {
  if (!match.value) return ''
  const home = getTeamName(match.value.homeTeam)
  const away = getTeamName(match.value.awayTeam)
  const tournament = match.value.tournament?.name || ''
  // 有比分时展示比分，无比分时展示 VS
  const hs = match.value.homeScore
  const as = match.value.awayScore
  const scorePart = (hs !== null && hs !== undefined && as !== null && as !== undefined)
    ? ` ${hs}:${as} ` : ' VS '
  const prefix = tournament ? `【${tournament}】` : ''
  return `${prefix}${home}${scorePart}${away} — CupAI ${t('match.aiPrediction')}`
})

const shareUrlX = computed(() =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(sharePageUrl.value)}`
)

const shareUrlFacebook = computed(() =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl.value)}`
)

const shareUrlWhatsApp = computed(() =>
  `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText.value + ' ' + sharePageUrl.value)}`
)

const shareUrlTelegram = computed(() =>
  `https://t.me/share/url?url=${encodeURIComponent(sharePageUrl.value)}&text=${encodeURIComponent(shareText.value)}`
)

const shareUrlLinkedIn = computed(() =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharePageUrl.value)}`
)

const shareUrlReddit = computed(() =>
  `https://www.reddit.com/submit?url=${encodeURIComponent(sharePageUrl.value)}&title=${encodeURIComponent(shareText.value)}`
)

const shareUrlWeibo = computed(() =>
  `https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(sharePageUrl.value)}`
)

/** 微信分享：弹出二维码弹窗 */
const wechatQrVisible = ref(false)
const wechatQrUrl = computed(() => {
  // 使用免费 QR 码 API 生成当前页面链接的二维码
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sharePageUrl.value)}`
})

const shareUrlQQ = computed(() =>
  `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(sharePageUrl.value)}&title=${encodeURIComponent(shareText.value)}&summary=${encodeURIComponent(shareText.value)}`
)

/** 复制当前页面链接到剪贴板 */
async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(sharePageUrl.value)
    ElMessage.success(t('match.linkCopied'))
  } catch {
    ElMessage.warning(t('match.copyFailed'))
  }
}

// ========== 主加载 ==========
async function loadDetail() {
  const matchId = route.params.id as string
  if (!matchId) {
    errorState.value = 'not_found'
    return
  }
  unsubscribe?.()
  unsubscribe = null
  stopDimensionPoll()
  stopMatchMinutePoll()
  match.value = null
  matchSentiment.value = null
  // prediction 是 computed，不需要手动清空
  errorState.value = ''
  loading.value = true

  try {
    // 从后端获取赛事详情
    const data = await matchStore.fetchMatchDetail(matchId) as any
    match.value = data
    if (!data) {
      errorState.value = 'not_found'
      return
    }

    // WebSocket 实时订阅
    // 后端 MatchGateway 推送事件名：match:update / match:score / match:status
    // 数据格式：{ matchId, ...变更字段, timestamp }
    unsubscribe = subscribeMatch(matchId, (wsData: any) => {
      if (!match.value) return
      // 仅更新实时相关字段，避免覆盖用户正在查看的其他数据
      if (wsData.currentMinute !== undefined) match.value.currentMinute = wsData.currentMinute
      if (wsData.period !== undefined) match.value.period = wsData.period
      if (wsData.homeScore !== undefined) match.value.homeScore = wsData.homeScore
      if (wsData.awayScore !== undefined) match.value.awayScore = wsData.awayScore
      if (wsData.halfTimeHome !== undefined) match.value.halfTimeHome = wsData.halfTimeHome
      if (wsData.halfTimeAway !== undefined) match.value.halfTimeAway = wsData.halfTimeAway
      if (wsData.penaltyShootout !== undefined) match.value.penaltyShootout = wsData.penaltyShootout
      if (wsData.bsStatus !== undefined) match.value.bsStatus = wsData.bsStatus
      if (wsData.status !== undefined) {
        match.value.status = wsData.status
        // 赛事状态变化时：live→finished 停止轮询；upcoming→live 启动分钟轮询
        if (wsData.status === 'finished') stopMatchMinutePoll()
        if (wsData.status === 'live') startMatchMinutePoll(matchId)
      }
    })

    // 并行加载：舆情（全部 + 主 + 客）、预测、球员阵容、单维度指令报告、agent 指令清单、用户排行
    loadAllSentiment(
      matchId,
      data?.homeTeam?.id || data?.homeTeamId,
      data?.awayTeam?.id || data?.awayTeamId,
    )
    // prediction 从 dimensionReports 自动聚合，无需单独加载
    loadPlayers()
    loadDimensionReports(matchId)
    startDimensionPoll(matchId)
    startMatchMinutePoll(matchId)
    loadInstructions(matchId)
    loadUserRanking()
    fetchExtendedData(matchId)
    fetchHighlights(matchId)
    fetchWeatherData(matchId)
  } catch (e: any) {
    if (e?.response?.status === 404) {
      errorState.value = 'not_found'
    } else {
      errorState.value = 'network'
    }
  } finally {
    loading.value = false
  }
}

/**
 * 加载双方球员阵容
 * 优先使用 lineups 接口获取比赛专用首发阵容，回退到球队球员列表
 */
async function loadPlayers() {
  const matchId = match.value?.id
  const homeId = match.value?.homeTeam?.id
  const awayId = match.value?.awayTeam?.id
  if (!matchId) return
  playersLoading.value = true
  homePlayers.value = []
  awayPlayers.value = []

  // 优先从 lineups 接口获取首发阵容
  let lineupsLoaded = false
  try {
    const lineups: any = await http.get(`/matches/${matchId}/lineups`)
    if (lineups && ((lineups.home?.starters?.length) || (lineups.away?.starters?.length))) {
      lineupData.value = lineups
      // 合并首发+替补
      homePlayers.value = [
        ...(lineups.home?.starters || []),
        ...(lineups.home?.substitutes || []),
      ]
      awayPlayers.value = [
        ...(lineups.away?.starters || []),
        ...(lineups.away?.substitutes || []),
      ]
      lineupsLoaded = true
    }
  } catch {
    // lineups 接口失败，回退到球队球员列表
  }

  // 回退：从球队详情获取球员列表
  if (!lineupsLoaded) {
    const tasks: Promise<void>[] = []
    if (homeId) {
      tasks.push(
        matchStore.fetchTeamPlayers(homeId).then((list) => {
          homePlayers.value = list
        }).catch(() => {}),
      )
    }
    if (awayId) {
      tasks.push(
        matchStore.fetchTeamPlayers(awayId).then((list) => {
          awayPlayers.value = list
        }).catch(() => {}),
      )
    }
    await Promise.all(tasks)
  }
  playersLoading.value = false
}

/**
 * 监听 i18n 语言变化 → 重渲染所有维度图表 + 舆情图表
 * 关键修复：ECharts setOption 不会自动响应 i18n.locale 变化，
 *           必须在 locale 切换后手动重新渲染所有图表才能让
 *           legend / tooltip / axisLabel 显示对应语言。
 */
watch(
  () => i18nLocale.value,
  () => {
    if (dimensionReports.value?.length) {
      renderAllDimensionCharts()
    }
    if (currentSentiment.value) {
      renderSentimentCharts(currentSentiment.value)
    }
  },
)

/**
 * 切换舆情 tab（全部 / 主队 / 客队）→ 重渲染两个 echart 实例
 * currentSentiment 是 computed，watch 它自动触发
 */
watch(
  currentSentiment,
  (val) => {
    if (val) {
      // 切 tab 时 ECharts 容器还在，但内容数据源变了 → 重新 setOption
      renderSentimentCharts(val)
    }
  },
)

/**
 * 监听 route 变化（赛事 ID 切换时重载）
 */
watch(
  () => route.params.id,
  () => {
    loadDetail()
  },
  { immediate: true },
)

// ========== 球员加载完成后强制重渲染指定球员维度 ==========
// 目的：goal_player_score 维度的"赢家"标签需要根据 playerId 解析球员名。
// 当 dimensionReports 比球员阵容先加载完成时，dimWinner 首次返回"进球"（无球员名）。
// 此 watch 在主客队任一加载完成后触发模板中的 dimWinner() 重新求值。
// 优化：不再通过 dimensionReports.value = [...] 触发全量图表重渲染，
//       仅触发 Vue 模板响应式更新即可。
watch(
  [homePlayers, awayPlayers],
  () => {
    if (!dimensionReports.value?.length) return
    // 触发模板中依赖 homePlayers/awayPlayers 的 computed 重新求值
    // Vue 3 模板已自动跟踪 homePlayers/awayPlayers 依赖，无需手动刷新
  },
  { deep: true },
)

onUnmounted(() => {
  unsubscribe?.()
  unsubscribe = null
  stopDimensionPoll()
  stopMatchMinutePoll()
  if (renderDebounceTimer) {
    clearTimeout(renderDebounceTimer)
    renderDebounceTimer = null
  }
  sentimentChart?.dispose()
  sentimentChart = null
  distributionChart?.dispose()
  distributionChart = null
  // 清理所有维度图表实例
  for (const k of Object.keys(dimCharts)) {
    try { dimCharts[k]?.dispose() } catch {}
    delete dimCharts[k]
  }
  // 取消未完成的 fetch，避免组件卸载后 setState 与 net::ERR_ABORTED
  fetchAbortCtrl?.abort()
  fetchAbortCtrl = null
})

// 预留功能引用，消除 noUnusedLocals 警告
void openFullMatchCopyDialog
</script>

<style scoped>
.match-detail-view {
  max-width: var(--page-max-width);
  margin: 0 auto;
  min-height: 60vh;
}
.page-header-title {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--font-semibold);
  word-break: break-word;
  overflow-wrap: anywhere;
}
.detail-row {
  margin-top: 0;
}
.detail-skeleton {
  display: flex;
  flex-direction: column;
}

/* ========== 比分板 ========== */
.scoreboard {
  margin-top: var(--space-4);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
}
.scoreboard--upcoming {
  padding: var(--space-6) var(--space-6);
}
.team-side-tag {
  letter-spacing: 0.04em;
  font-size: var(--text-xs);
}
.team-side-tag--inline {
  margin-right: var(--space-1);
}
.score-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-12);
  flex-wrap: wrap;
}
.team-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 120px;
}
.team-info--home {
  flex-direction: row;
  justify-content: flex-end;
  text-align: right;
}
.team-info--away {
  flex-direction: row;
  justify-content: flex-start;
  text-align: left;
}
.team-info__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.team-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.team-flag {
  width: 120px;
  height: 80px;
  line-height: 1;
  flex-shrink: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: inline-block;
  border: 0 !important;
  border-radius: 0;
  box-shadow: none !important;
  outline: none !important;
}
.team-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  flex-shrink: 0;
}
.team-name {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.team-rank {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
.score-display {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 140px;
  justify-content: center;
}
.score-num {
  font-size: var(--text-6xl);
  font-weight: var(--font-extrabold);
  color: var(--color-danger);
  font-feature-settings: 'tnum';
  line-height: 1;
}
.score-sep {
  font-size: var(--text-4xl);
  color: var(--color-text-tertiary);
  font-weight: var(--font-light);
}
.half-time {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* 进行时间展示 */
.match-progress-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: var(--space-2);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-danger);
}

.match-progress-time .live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-danger);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.match-period {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* ========== 三列时间展示 ========== */
.time-triple-bar {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-top: var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.time-triple-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  gap: 2px;
}

.time-triple-item--highlight {
  background: var(--color-primary-bg, rgba(64, 158, 255, 0.06));
  border-top: 2px solid var(--color-primary);
}

.time-triple-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-triple-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.time-triple-item--highlight .time-triple-value {
  color: var(--color-primary);
}

.time-triple-zone {
  font-size: 10px;
  color: var(--color-text-tertiary);
}

.time-triple-divider {
  width: 1px;
  background: var(--color-border);
  align-self: stretch;
}

/* ========== 关键信息紧凑卡 ========== */
.key-info-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}
.key-info-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  transition: transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}
.key-info-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.key-info-card__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--space-10);
  height: var(--space-10);
  border-radius: var(--radius-md);
}
.key-info-card__body {
  flex: 1;
  min-width: 0;
}
.key-info-card__label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-0-5, 2px);
}
.key-info-card__value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.key-info-card__sub {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-normal);
  margin-left: var(--space-0-5, 2px);
}

/* ========== 2 列信息行（赛事信息+临场环境 / 因子数据+数据来源） ==========
   用于将原本全宽的若干 SectionCard 改为左右两列，缩短页面总长度
   - 大屏（>= 960px）：2 列
   - 小屏（< 960px）：1 列 */
.info-row-2col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}
@media (max-width: 960px) {
  .info-row-2col {
    grid-template-columns: 1fr;
  }
}

/* ========== AI 胜负率预测 + 用户预测排行（两列布局） ==========
   左侧展示 AI 胜负率（胜/平/负），右侧展示用户预测排行榜
   - 大屏（>= 1100px）：2 列
   - 小屏：1 列 */
.prediction-2col {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: stretch;
}
@media (max-width: 1100px) {
  .prediction-2col {
    grid-template-columns: 1fr;
  }
}

/* 关键信息卡内时间字段（三份时间需要换行展示） */
.key-info-card__value--time {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  white-space: normal;
  line-height: var(--leading-tight);
}

/* ========== 单维度指令报告（21 维度动态图表，按 5 大板块分组） ========== */
.user-reports-extra {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}
/* 板块内的图表网格：响应式 2 列布局（每图带标题行+复制指令按钮）
   - 大屏：2 列
   - 中等屏（<1100px）：2 列
   - 小屏（<720px）：1 列 */
.dim-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-2);
}
@media (max-width: 720px) {
  .dim-charts-grid {
    grid-template-columns: 1fr;
  }
}
.dim-chart-block {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4) var(--space-2);
  min-width: 0; /* 防止 grid 子项溢出 */
}
.dim-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  flex-wrap: wrap;
}
.dim-chart-title {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  min-width: 0;
  flex: 1;
}
.dim-chart-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dim-winner-tag {
  font-weight: var(--font-normal);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dim-count-tag {
  font-weight: var(--font-normal);
  flex-shrink: 0;
}
.dim-chart {
  width: 100%;
  height: 200px;
}

@media (max-width: 768px) {
  .key-info-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ========== AI 预测 ========== */
.prediction-extra {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.prediction {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.prediction-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.prediction-team {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.prediction-team__name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prediction-team__label {
  font-weight: var(--font-normal);
  color: var(--color-text-secondary);
}
.prediction-team__rate {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  font-feature-settings: 'tnum';
}
.prediction-reasoning {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  line-height: var(--leading-relaxed);
}
.prediction-reasoning .el-icon {
  color: var(--color-primary-light);
  flex-shrink: 0;
  margin-top: var(--space-0-5, 2px);
}
.prediction-source {
  text-align: right;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

/* ========== 阵容与球员分析 ========== */
.players-skeleton {
  margin-top: var(--space-2);
}
.team-profile {
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}
.team-profile__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
  gap: var(--space-2);
}
.team-profile__name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}
.team-profile__name .team-flag {
  font-size: var(--text-2xl);
}
.team-profile__tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.team-profile__stats {
  margin-top: var(--space-2);
}
.stat-item {
  text-align: center;
  padding: var(--space-2);
  background: var(--color-bg-muted);
  border-radius: var(--radius-md);
}
.stat-item__value {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  font-feature-settings: 'tnum';
}
.stat-item__label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-0-5, 2px);
}
.position-group {
  margin-bottom: var(--space-3);
}
.position-group__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: var(--space-2);
}
.position-group__title .el-icon {
  color: var(--color-primary-light);
}
.position-group__count {
  color: var(--color-text-tertiary);
  font-weight: var(--font-normal);
  font-size: var(--text-xs);
}
.player-avatar {
  display: flex;
  justify-content: center;
}
.player-name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-medium);
}
.player-name__cn {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
.player-name__en {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-0-5, 2px);
}
.key-badge {
  flex-shrink: 0;
}
.stat-num {
  font-weight: var(--font-semibold);
  font-feature-settings: 'tnum';
  color: var(--color-text-primary);
}
.stat-empty {
  color: var(--color-text-tertiary);
}
.card-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
.yellow-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 22px;
  padding: 0 var(--space-1);
  background: var(--color-warning);
  color: var(--color-bg-elevated);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}
.red-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 22px;
  padding: 0 var(--space-1);
  background: var(--color-danger);
  color: var(--color-bg-elevated);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}
:deep(.is-key-player) {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--color-warning) 6%, transparent) 0%,
    color-mix(in srgb, var(--color-warning) 0%, transparent) 50%
  );
}
:deep(.el-table .is-key-player td) {
  font-weight: var(--font-semibold);
}

/* ========== 舆情 ========== */
.sentiment-stat {
  text-align: center;
  padding: var(--space-3) 0;
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
}
.sentiment-stat__value {
  font-size: var(--text-2xl);
  font-weight: var(--font-extrabold);
  color: var(--color-text-primary);
  font-feature-settings: 'tnum';
}
.sentiment-stat__label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-1);
}
.sentiment-detail-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}
.sentiment-detail-title .el-icon {
  color: var(--color-primary-light);
}
.sentiment-chart {
  height: 240px;
}
.feed-item {
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-light);
}
.feed-item:last-child {
  border-bottom: none;
}
.feed-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}
.feed-platform {
  font-size: var(--text-xs);
  color: var(--color-primary-light);
  font-weight: var(--font-semibold);
}
.feed-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-left: auto;
}
.feed-text {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-primary);
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* 单维度分析板块的样式已迁移到上面的 .dim-chart-block / .dim-chart-* */

.match-card__status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  margin-right: var(--space-1);
  animation: blink 1.5s ease-in-out infinite;
}
.match-card__status-dot--live {
  background: var(--color-danger);
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ========== 响应式断点 ========== */
@media (max-width: 768px) {
  .score-row { gap: var(--space-4); }
  .score-num { font-size: var(--text-5xl); }
  .team-flag { width: 80px; height: 54px; }
  .team-name { font-size: var(--text-base); }
}

/* 响应式断点：超小屏幕 */
@media (max-width: 480px) {
  .key-info-bar {
    grid-template-columns: 1fr;
  }
  .score-row { gap: var(--space-2); }
  .score-num { font-size: var(--text-4xl); }
  .team-flag { width: 56px; height: 38px; }
  .dim-charts-grid {
    grid-template-columns: 1fr;
  }
}

/* ========== 右侧分享栏 ========== */
.share-sidebar {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 100;
}
.share-sidebar__label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  writing-mode: vertical-rl;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border-light);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}
.share-btn:hover {
  transform: scale(1.12);
  box-shadow: var(--shadow-md);
}
.share-btn--x:hover { color: #000; border-color: #000; }
.share-btn--facebook:hover { color: #1877F2; border-color: #1877F2; }
.share-btn--whatsapp:hover { color: #25D366; border-color: #25D366; }
.share-btn--telegram:hover { color: #0088CC; border-color: #0088CC; }
.share-btn--linkedin:hover { color: #0A66C2; border-color: #0A66C2; }
.share-btn--reddit:hover { color: #FF4500; border-color: #FF4500; }
.share-btn--weibo:hover { color: #E6162D; border-color: #E6162D; }
.share-btn--wechat:hover { color: #07C160; border-color: #07C160; }
.share-btn--qq:hover { color: #12B7F5; border-color: #12B7F5; }
.share-btn--link:hover { color: var(--color-primary); border-color: var(--color-primary); }

/* 微信二维码弹窗 */
.wechat-qr-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}
.wechat-qr-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  border: 1px solid var(--color-border-light);
}
.wechat-qr-tip {
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

@media (max-width: 1100px) {
  .share-sidebar {
    right: 8px;
  }
  .share-btn {
    width: 32px;
    height: 32px;
  }
}
@media (max-width: 768px) {
  .share-sidebar {
    display: none;
  }
}

/* ========== 交锋记录 ========== */
.h2h-card {
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}
.h2h-card h4 {
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
}
.h2h-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-bottom: 12px;
}
.h2h-stat {
  text-align: center;
}
.h2h-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
}
.h2h-label {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.h2h-recent {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 8px;
}
.h2h-match {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}
.h2h-score {
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}
.h2h-date {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

/* ========== 趣味事实 ========== */
.funfacts {
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}
.funfacts h4 {
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
}
.funfact-item {
  padding: 6px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.funfact-item:last-child {
  border-bottom: none;
}

/* ========== 球员统计面板 ========== */
.player-stats-panel {
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}
.player-stats-panel h4 {
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
}
.player-stats-table {
  overflow-x: auto;
}
.player-stats-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.player-stats-table th,
.player-stats-table td {
  padding: 6px 8px;
  text-align: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.player-stats-table th {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.player-stats-table td:first-child {
  text-align: left;
}
.card-yellow {
  color: #f0c000;
  font-weight: 600;
}
.card-red {
  color: #f56c6c;
  font-weight: 600;
}
.venue-capacity {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.venue-image {
  width: 100%;
  max-height: 120px;
  object-fit: cover;
  border-radius: var(--el-border-radius-base, 4px);
  margin-top: 4px;
}

/* ========== 精彩集锦 ========== */
.highlights-card {
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}
.highlights-card h4 {
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
}
.highlights-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.highlight-item {
  display: flex;
  gap: 8px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  padding: 8px;
  text-decoration: none;
  color: var(--el-text-color-primary);
  transition: all 0.2s;
}
.highlight-item:hover {
  background: var(--el-fill-color);
  transform: translateY(-2px);
}
.highlight-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}
.highlight-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
}
.highlight-title {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.highlight-date {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

/* ========== 天气湿度信息 ========== */
.weather-card {
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}
.weather-card h4 {
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
}
.weather-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  flex-wrap: wrap;
}
.weather-humidity {
  color: var(--el-text-color-regular);
}
.weather-desc {
  color: var(--el-text-color-secondary);
}

/* ========== 球衣颜色 ========== */
.jersey-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}
.jersey-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.jersey-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.jersey-swatch {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--color-border-light);
}
.jersey-vs {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
</style>
