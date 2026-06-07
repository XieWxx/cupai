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
            {{ match?.homeTeam?.name }} {{ $t('common.vs') }} {{ match?.awayTeam?.name }}
            <el-tag v-if="match?.status === 'live'" type="danger" size="small" effect="dark" round>
              <span class="match-card__status-dot match-card__status-dot--live" />
              {{ $t('match.live') }}
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
            <div class="team-info">
              <el-tag size="small" effect="dark" type="primary" class="team-side-tag">{{ $t('match.homeTeam') }}</el-tag>
              <span v-if="getFlagClass(match?.homeTeam?.countryCode)" :class="`team-flag ${getFlagClass(match?.homeTeam?.countryCode)}`" />
              <span class="team-name">{{ match?.homeTeam?.name }}</span>
              <span class="team-rank" v-if="match?.homeTeam?.fifaRank">FIFA #{{ match.homeTeam.fifaRank }}</span>
            </div>
            <div class="score-display">
              <span class="score-num">{{ match?.homeScore }}</span>
              <span class="score-sep">:</span>
              <span class="score-num">{{ match?.awayScore }}</span>
            </div>
            <div class="team-info">
              <el-tag size="small" effect="dark" type="warning" class="team-side-tag">{{ $t('match.awayTeam') }}</el-tag>
              <span v-if="getFlagClass(match?.awayTeam?.countryCode)" :class="`team-flag ${getFlagClass(match?.awayTeam?.countryCode)}`" />
              <span class="team-name">{{ match?.awayTeam?.name }}</span>
              <span class="team-rank" v-if="match?.awayTeam?.fifaRank">FIFA #{{ match.awayTeam.fifaRank }}</span>
            </div>
          </div>
          <div v-if="match?.halfTimeHome !== null" class="half-time">
            {{ $t('match.halfTime') }} {{ match.halfTimeHome }} : {{ match.halfTimeAway }}
          </div>
        </div>

        <!-- ========== 比分板（开赛前展示，标注主客队） ========== -->
        <div v-else class="scoreboard scoreboard--upcoming">
          <div class="score-row">
            <div class="team-info">
              <el-tag size="small" effect="dark" type="primary" class="team-side-tag">{{ $t('match.homeTeam') }}</el-tag>
              <span v-if="getFlagClass(match?.homeTeam?.countryCode)" :class="`team-flag ${getFlagClass(match?.homeTeam?.countryCode)}`" />
              <span class="team-name">{{ match?.homeTeam?.name }}</span>
              <span class="team-rank" v-if="match?.homeTeam?.fifaRank">FIFA #{{ match.homeTeam.fifaRank }}</span>
            </div>
            <div class="score-display score-display--vs">
              <span class="vs-text">{{ $t('common.vs') }}</span>
            </div>
            <div class="team-info">
              <el-tag size="small" effect="dark" type="warning" class="team-side-tag">{{ $t('match.awayTeam') }}</el-tag>
              <span v-if="getFlagClass(match?.awayTeam?.countryCode)" :class="`team-flag ${getFlagClass(match?.awayTeam?.countryCode)}`" />
              <span class="team-name">{{ match?.awayTeam?.name }}</span>
              <span class="team-rank" v-if="match?.awayTeam?.fifaRank">FIFA #{{ match.awayTeam.fifaRank }}</span>
            </div>
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
                  {{ $t('dim.copy') }}
                </el-button>
              </div>
            </template>
            <div v-if="prediction" class="prediction">
              <!-- 双队对比条 -->
              <div class="prediction-bars">
                <div class="prediction-team">
                  <div class="prediction-team__name">
                    <el-tag size="small" effect="dark" type="primary" class="team-side-tag team-side-tag--inline">{{ $t('match.homeTeam') }}</el-tag>
                    {{ match?.homeTeam?.name }}
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
                    {{ match?.awayTeam?.name }}
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
              <div class="key-info-card__value" :title="match?.venue">{{ match?.venue || '-' }}</div>
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
            <EmptyState
              v-if="!reportsLoading && allSectionDimsEmpty"
              :title="$t('match.userReportsEmpty')"
              :description="$t('match.userReportsEmptyDesc')"
              variant="document"
            />
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
                    {{ $t('dim.copy') }}
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
                {{ match?.homeTeam?.name }} ({{ homePlayers.length }})
              </el-radio-button>
              <el-radio-button value="away">
                {{ match?.awayTeam?.name }} ({{ awayPlayers.length }})
              </el-radio-button>
            </el-radio-group>
          </template>

          <div v-loading="playersLoading">
            <!-- 球队画像 -->
            <div v-if="activeTeam" class="team-profile">
              <div class="team-profile__header">
                <div class="team-profile__name">
                  <span v-if="getFlagClass(activeTeam?.countryCode)" :class="`team-flag ${getFlagClass(activeTeam?.countryCode)}`" />
                  <span>{{ activeTeam?.name }}</span>
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
                    :row-class-name="(args: any) => args.row.isKeyPlayer ? 'is-key-player' : ''"
                  >
                    <el-table-column width="48" align="center">
                      <template #default="{ row }">
                        <div class="player-avatar">
                          <el-avatar v-if="row.avatar" :size="32" :src="row.avatar" />
                          <el-avatar v-else :size="32">{{ (row.name || '?').charAt(0) }}</el-avatar>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column>
                      <template #default="{ row }">
                        <div class="player-name">
                          <span class="player-name__cn">{{ row.name }}</span>
                          <el-tooltip v-if="row.isKeyPlayer" :content="$t('match.keyPlayerTip')" placement="top">
                            <el-tag size="small" type="warning" effect="dark" class="key-badge">
                              <el-icon :size="10"><StarFilled /></el-icon>
                              <span style="margin-left: 2px">{{ $t('match.keyPlayer') }}</span>
                            </el-tag>
                          </el-tooltip>
                        </div>
                        <div v-if="row.nameEn" class="player-name__en">{{ row.nameEn }}</div>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('match.age')" width="64" align="center" prop="age" />
                    <el-table-column :label="$t('match.goals')" width="64" align="center">
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
            </el-descriptions>
          </SectionCard>

          <!-- 右：临场环境 -->
          <SectionCard
            v-if="match?.temperature || match?.humidity"
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
            </el-descriptions>
          </SectionCard>
          <!-- 占位：右侧无内容时让布局对齐 -->
          <SectionCard
            v-else
            :title="$t('match.environment')"
          >
            <el-empty :description="$t('match.environment')" :image-size="60" />
          </SectionCard>
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
              :label="`${match?.homeTeam?.name || $t('match.homeTeam')} · ${$t('sentiment.homeSentiment')}`"
              name="home"
            />
            <el-tab-pane
              :label="`${match?.awayTeam?.name || $t('match.awayTeam')} · ${$t('sentiment.awaySentiment')}`"
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

    <!-- ========== 复制指令弹窗（兼容非安全上下文） ========== -->
    <CopyInstructionDialog
      v-model="copyDialogOpen"
      :title="$t('copyIntro.title')"
      :tabs="copyDialogTabs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
  DIMENSION_SECTIONS,
  DIMENSIONS,
  type CopyInstructionInput,
  type DimensionDef,
  type DimensionKey,
} from '@/utils/copyInstruction'
import { useMatchStore } from '@/stores/match'
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
// （已删除：原 InstructionBoard 组件 import；指令中心页面已并入每张图表的「复制指令」按钮）

const route = useRoute()
const router = useRouter()
const { t, locale: i18nLocale } = useI18n()
const matchStore = useMatchStore()

const loading = ref(false)
const match = ref<any>(null)
const errorState = ref<'' | 'not_found' | 'network'>('')
let unsubscribe: (() => void) | null = null

// ========== AI 胜率预测 ==========
const prediction = ref<{
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
 * 加载用户预测排行
 * 后端接口：GET /ranking/users（按 accuracyRate 降序）
 * 映射字段：userId / username / countryCode / platform / llmType / accuracy
 */
async function loadUserRanking() {
  userRankingLoading.value = true
  try {
    const res: any = await http.get('/ranking/users', { params: { sort: 'accuracy', pageSize: 7 } })
    const list = res?.list || res || []
    userPredictionRanking.value = list.map((item: any) => ({
      userId: item.userId || item.id || '',
      username: item.user?.nickname || item.user?.username || item.username || '',
      countryCode: item.user?.region || item.countryCode || '',
      platform: item.user?.defaultAiConfig?.modelName || item.platform || '',
      llmType: item.user?.defaultAiConfig?.modelName || item.llmType || '',
      accuracy: Number(item.accuracyRate) || 0,
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
  if (sentimentTab.value === 'home') return match.value?.homeTeam?.name || t('match.homeTeam')
  if (sentimentTab.value === 'away') return match.value?.awayTeam?.name || t('match.awayTeam')
  return ''
})

// ========== 球员阵容 ==========
const homePlayers = ref<any[]>([])
const awayPlayers = ref<any[]>([])
const playersLoading = ref(false)
const activeLineupTab = ref<'home' | 'away'>('home')

/**
 * 用户当前 API Key（用于回传指引）
 */
const currentApiKey = computed(() => localStorage.getItem('cupai_api_key') || '')

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
    appBaseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
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


/** 所有维度板块是否全部无数据（用于决定是否显示 EmptyState） */
const allSectionDimsEmpty = computed(() => {
  return dimensionReports.value.every((r) => !r?.distribution || Object.keys(r.distribution).length === 0)
})
/**
 * 设置维度图表容器的 DOM ref（模板中 :ref="(el) => setDimChartRef(...)"）
 */
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
 * 复制单维度分析指令
 * 改为弹窗显示完整 Markdown，避免 navigator.clipboard 在非安全上下文报错
 * 新版（按产品要求）：每条复制指令末尾都附带 agent 回传地址、Header、Body 字段、curl 模板
 */
async function copyDimension(dimKey: DimensionKey) {
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
  // 弹窗显示 + 用户主动复制（兼容非安全上下文）
  copyDialogOpen.value = true
  copyDialogTabs.value = [
    { key: dimKey, label: title, content: text },
  ]
}

/**
 * 复制球员分析指令（弹窗显示）
 */
async function openPlayerCopyDialog(player: any, side: 'home' | 'away') {
  const teamName = side === 'home' ? match.value?.homeTeam?.name : match.value?.awayTeam?.name
  const text = buildPlayerInstruction({
    player: { ...player, teamName },
    userApiKey: currentApiKey.value,
    appBaseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
  })
  copyDialogOpen.value = true
  copyDialogTabs.value = [
    { key: `player-${player.id || ''}`, label: player.name || t('copyIntro.tabPlayer'), content: text },
  ]
}

/**
 * 复制球队分析指令（弹窗显示）
 */
async function openTeamCopyDialog(side: 'home' | 'away') {
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
    appBaseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
  })
  copyDialogOpen.value = true
  copyDialogTabs.value = [
    { key: `team-${side}`, label: team.name || t('copyIntro.tabTeam'), content: text },
  ]
}

/**
 * 复制整场赛事分析指令（弹窗显示）
 */
async function openFullMatchCopyDialog() {
  const text = buildMatchInstruction(buildCommonInput())
  copyDialogOpen.value = true
  copyDialogTabs.value = [
    { key: 'match-all', label: match.value?.homeTeam?.name ? `${match.value.homeTeam.name} VS ${match.value.awayTeam?.name || ''}` : t('copyIntro.tabMatch'), content: text },
  ]
}

// ========== 8 因子字段映射（定义在下方，与球员分组并列）==========

// ========== 球员分组（按位置）==========
const POSITION_NORMALIZE: Record<string, string> = {
  GK: 'GK', Goalkeeper: 'GK', 守门员: 'GK', 门将: 'GK',
  DF: 'DF', Defender: 'DF', 后卫: 'DF', 防守: 'DF',
  MF: 'MF', Midfielder: 'MF', 中场: 'MF',
  FW: 'FW', Forward: 'FW', Striker: 'FW', 前锋: 'FW', 进攻: 'FW',
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

// ========== AI 预测（仅后端真实数据，不再本地启发式 fallback）==========
// 说明：docs/api-spec.md §3.6.4 后端返回完整 {homeWin, draw, awayWin, reasoning, source, dimensions}，
// 不再用前端 winRate/fifaRank 启发式计算（已删除 computeLocalPrediction 函数）。
// 失败时 prediction 留空，UI 由 v-if 兜底"暂无 AI 预测"。

async function loadPrediction() {
  try {
    // 后端真实接口：GET /matches/{id}/prediction
    // 响应：{ homeWin, draw, awayWin, reasoning, source, dimensions }
    // 见 docs/api-spec.md §3.6.4
    const res = await http.get<any>(`/matches/${route.params.id}/prediction`)
    if (res && typeof res.homeWin === 'number') {
      prediction.value = res
    } else {
      console.warn('[loadPrediction] backend response missing homeWin:', res)
    }
  } catch (err) {
    console.error('[loadPrediction] failed:', err)
  }
}

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
      totals[k] = (totals[k] || 0) + Number(v || 0)
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
 * 每个维度调用 renderDimensionChart
 */
function renderAllDimensionCharts() {
  // 清理旧实例
  for (const k of Object.keys(dimCharts)) {
    try { dimCharts[k]?.dispose() } catch {}
    delete dimCharts[k]
  }
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
 * @param dimKey 维度 key
 */
function renderDimensionChart(dimKey: DimensionKey) {
  const el = dimChartRefs.value[dimKey]
  if (!el) return
  if (dimCharts[dimKey]) {
    try { dimCharts[dimKey].dispose() } catch {}
    delete dimCharts[dimKey]
  }
  const { labels, values } = aggregateDimension(dimKey)
  const chart = echarts.init(el)
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
                text: t('match.dimNoData') || '暂无数据',
                fill: '#94a3b8',
                fontSize: 14,
                fontWeight: 500,
              },
            },
            {
              type: 'text',
              top: 24,
              style: {
                text: t('match.dimNoDataDesc') || '该维度暂无 agent 分析报告',
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
        data: [t('dimSection.cornerTitle') || '边角趣味数据'],
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
          name: t('dimSection.cornerTitle') || '边角趣味数据',
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

/** Markdown 摘要：去掉标题/分割线，截取正文前 220 字（已废弃，保留以备回退） */
function reportPreview(content: string): string {
  if (!content) return ''
  return content
    .replace(/^#+\s+.*$/gm, '') // 去掉标题行
    .replace(/^---+$/gm, '') // 去掉分割线
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 220)
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
    if (!prediction.value) loadPrediction()
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

// ========== 主加载 ==========
async function loadDetail() {
  const matchId = route.params.id as string
  if (!matchId) {
    errorState.value = 'not_found'
    return
  }
  unsubscribe?.()
  unsubscribe = null
  match.value = null
  matchSentiment.value = null
  prediction.value = null
  errorState.value = ''
  loading.value = true

  try {
    // 从后端获取赛事详情
    const data = await matchStore.fetchMatchDetail(matchId)
    match.value = data
    if (!data) {
      errorState.value = 'not_found'
      return
    }

    // WebSocket 实时订阅
    unsubscribe = subscribeMatch(matchId, (wsData: any) => {
      if (!match.value) return
      if (wsData.type === 'live_update') {
        if (wsData.homeScore !== undefined) match.value.homeScore = wsData.homeScore
        if (wsData.awayScore !== undefined) match.value.awayScore = wsData.awayScore
      } else if (wsData.type === 'match:update') {
        Object.assign(match.value, wsData)
      }
    })

    // 并行加载：舆情（全部 + 主 + 客）、预测、球员阵容、单维度指令报告、agent 指令清单、用户排行
    loadAllSentiment(
      matchId,
      data?.homeTeam?.id || data?.homeTeamId,
      data?.awayTeam?.id || data?.awayTeamId,
    )
    loadPrediction()
    loadPlayers()
    loadDimensionReports(matchId)
    loadInstructions(matchId)
    loadUserRanking()
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
 */
async function loadPlayers() {
  const homeId = match.value?.homeTeam?.id
  const awayId = match.value?.awayTeam?.id
  if (!homeId && !awayId) return
  playersLoading.value = true
  homePlayers.value = []
  awayPlayers.value = []
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
// 此 watch 在主客队任一加载完成后触发 21 维度图表重渲染，让 el-tooltip / el-tag 重新求值 dimWinner。
watch(
  [homePlayers, awayPlayers],
  () => {
    if (!dimensionReports.value?.length) return
    // 不需要重建实例，只重新触发模板中的 dimWinner() 求值即可
    // （Vue 3 模板已自动跟踪 homePlayers/awayPlayers 依赖；这里仅做一次显式兜底刷新）
    dimensionReports.value = [...dimensionReports.value]
  },
  { deep: true },
)

onUnmounted(() => {
  unsubscribe?.()
  unsubscribe = null
  sentimentChart?.dispose()
  sentimentChart = null
  distributionChart?.dispose()
  distributionChart = null
})
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
  background: var(--gradient-dark);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
}
.scoreboard--upcoming {
  padding: var(--space-6) var(--space-6);
}
.scoreboard--upcoming .team-flag {
  font-size: var(--text-4xl);
}
.scoreboard--upcoming .team-name {
  font-size: var(--text-base);
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
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  min-width: 120px;
}
.team-flag {
  font-size: var(--text-5xl);
  line-height: 1;
}
.team-name {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-dark);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.team-rank {
  font-size: var(--text-xs);
  color: var(--color-text-dark-muted);
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
  color: var(--color-text-dark-muted);
  font-weight: var(--font-light);
}
.half-time {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-dark-muted);
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
  background: var(--color-bg-dark-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-dark);
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
  color: var(--color-text-dark-muted);
  margin-bottom: var(--space-0-5, 2px);
}
.key-info-card__value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.key-info-card__sub {
  font-size: var(--text-xs);
  color: var(--color-text-dark-muted);
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
  background: var(--color-bg-dark-card);
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
  color: var(--color-text-dark);
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
  color: var(--color-text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prediction-team__label {
  font-weight: var(--font-normal);
  color: var(--color-text-dark-muted);
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
  background: var(--color-bg-dark-card);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-dark);
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
  color: var(--color-text-dark-muted);
}

/* ========== 阵容与球员分析 ========== */
.players-skeleton {
  margin-top: var(--space-2);
}
.team-profile {
  padding: var(--space-3);
  background: var(--gradient-dark);
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
  color: var(--color-text-dark);
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
  background: var(--color-bg-dark-hover);
  border-radius: var(--radius-md);
}
.stat-item__value {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-dark);
  font-feature-settings: 'tnum';
}
.stat-item__label {
  font-size: var(--text-xs);
  color: var(--color-text-dark-muted);
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
  color: var(--color-text-dark);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-dark);
  margin-bottom: var(--space-2);
}
.position-group__title .el-icon {
  color: var(--color-primary-light);
}
.position-group__count {
  color: var(--color-text-dark-muted);
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
  color: var(--color-text-dark);
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
  color: var(--color-text-dark-muted);
  margin-top: var(--space-0-5, 2px);
}
.key-badge {
  flex-shrink: 0;
}
.stat-num {
  font-weight: var(--font-semibold);
  font-feature-settings: 'tnum';
  color: var(--color-text-dark);
}
.stat-empty {
  color: var(--color-text-dark-muted);
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
  background: var(--color-bg-dark-card);
}
.sentiment-stat__value {
  font-size: var(--text-2xl);
  font-weight: var(--font-extrabold);
  color: var(--color-text-dark);
  font-feature-settings: 'tnum';
}
.sentiment-stat__label {
  font-size: var(--text-xs);
  color: var(--color-text-dark-muted);
  margin-top: var(--space-1);
}
.sentiment-detail-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-dark);
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
  border-bottom: 1px solid var(--color-border-dark);
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
  color: var(--color-text-dark-muted);
  margin-left: auto;
}
.feed-text {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-dark);
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
  .team-flag { font-size: var(--text-4xl); }
  .team-name { font-size: var(--text-base); }
}

/* 响应式断点：超小屏幕 */
@media (max-width: 480px) {
  .key-info-bar {
    grid-template-columns: 1fr;
  }
  .score-row { gap: var(--space-2); }
  .score-num { font-size: var(--text-4xl); }
  .team-flag { font-size: var(--text-3xl); }
  .dim-charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
