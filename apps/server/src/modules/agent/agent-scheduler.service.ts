import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { MatchEntity } from '../match/entities/match.entity'
import { AnalysisReportEntity } from './entities/analysis-report.entity'
import { DimensionSubmissionEntity } from './entities/dimension-submission.entity'
import { PromptTemplateEntity } from '../prompt/entities/prompt-template.entity'
import { SquareGateway } from './square.gateway'
import { AlgorithmService } from './algorithm.service'
import { AiService } from '../ai/ai.service'
import { RedisCacheService } from '../../config/redis-cache.service'

/**
 * Agent 定时任务服务
 * - 定时扫描即将开始的赛事，自动生成分析报告
 * - 检查进行中赛事状态，推送 WebSocket 通知
 * - 数据巡检与缓存清理
 */
@Injectable()
export class AgentSchedulerService {
  private readonly logger = new Logger(AgentSchedulerService.name)

  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(AnalysisReportEntity)
    private readonly reportRepo: Repository<AnalysisReportEntity>,
    @InjectRepository(DimensionSubmissionEntity)
    private readonly submissionRepo: Repository<DimensionSubmissionEntity>,
    @InjectRepository(PromptTemplateEntity)
    private readonly promptTemplateRepo: Repository<PromptTemplateEntity>,
    private readonly squareGateway: SquareGateway,
    private readonly algorithmService: AlgorithmService,
    private readonly aiService: AiService,
    private readonly configService: ConfigService,
    private readonly redisCache: RedisCacheService,
  ) {}

  /**
   * 每30分钟扫描即将开始的赛事
   * 发现新赛事时自动调用 AI 生成分析报告
   */
  @Cron('*/30 * * * *')
  async scanUpcomingMatches() {
    this.logger.log('开始扫描即将开始的赛事...')

    try {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const upcomingMatches = await this.matchRepo
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.homeTeam', 'homeTeam')
        .leftJoinAndSelect('match.awayTeam', 'awayTeam')
        .where('match.status = :status', { status: 'upcoming' })
        .andWhere('match.startTime BETWEEN :now AND :tomorrow', { now, tomorrow })
        .getMany()

      this.logger.log(`发现 ${upcomingMatches.length} 场即将开始的赛事`)

      for (const match of upcomingMatches) {
        const existingReport = await this.reportRepo.findOne({
          where: { matchId: match.id, source: 'agent' },
        })

        if (!existingReport) {
          this.logger.log(`赛事 ${match.id} 尚无 Agent 分析，开始生成...`)
          await this.generateAgentReport(match)
        }
      }
    } catch (error) {
      this.logger.error('赛事扫描失败', error)
    }
  }

  /**
   * 每5分钟检查进行中的赛事状态
   * 检测比分变更并推送 WebSocket 通知
   */
  @Cron('*/5 * * * *')
  async checkLiveMatches() {
    this.logger.log('检查进行中的赛事...')

    try {
      const liveMatches = await this.matchRepo.find({
        where: { status: 'live' },
      })

      this.logger.log(`当前 ${liveMatches.length} 场赛事进行中`)

      for (const match of liveMatches) {
        // 通过 WebSocket 推送实时比分
        this.squareGateway.broadcastNewReport({
          type: 'live_update',
          matchId: match.id,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
        })

        // 更新赛事缓存
        await this.redisCache.set(`match:${match.id}`, match, 300)
      }
    } catch (error) {
      this.logger.error('赛事状态检查失败', error)
    }
  }

  /**
   * 每天凌晨3点执行数据巡检
   * 检查数据完整性、清理过期缓存
   */
  @Cron('0 3 * * *')
  async dailyDataInspection() {
    this.logger.log('开始每日数据巡检...')

    try {
      const totalMatches = await this.matchRepo.count()
      const totalReports = await this.reportRepo.count()

      // 清理过期赛事缓存
      await this.redisCache.delByPattern('matches:*')

      this.logger.log(`数据巡检完成: ${totalMatches} 场赛事, ${totalReports} 份报告, 缓存已清理`)
    } catch (error) {
      this.logger.error('数据巡检失败', error)
    }
  }

  /**
   * 为单场赛事生成 Agent 分析报告
   * 使用系统配置的 AI 模型自动生成
   */
  private async generateAgentReport(match: MatchEntity) {
    try {
      // 获取系统默认 Prompt 模板
      const defaultTemplate = await this.promptTemplateRepo.findOne({
        where: { userId: 'system', isPublic: true },
        order: { useCount: 'DESC' },
      })

      const promptTemplate = defaultTemplate?.content || this.getDefaultPromptTemplate()

      // 使用默认权重
      const defaultWeights = {
        historicalRecord: 18,
        teamStrength: 18,
        playerStatus: 14,
        realtimeDynamic: 12,
        environment: 10,
        tacticalCounter: 5,
        socialSentiment: 8,
        hiddenFactors: 15,
      }

      // 算法处理权重
      const processed = this.algorithmService.autoProcessWeights(
        defaultWeights,
        match.stage || '小组赛',
      )

      // 组装赛事数据
      const matchData = {
        league: match.leagueName,
        stage: match.stage,
        startTime: match.startTime,
        venue: match.venue,
        weather: {
          temperature: match.temperature,
          humidity: match.humidity,
          condition: match.weatherCondition,
          windSpeed: match.windSpeed,
        },
        referee: {
          name: match.refereeName,
          nationality: match.refereeNationality,
          style: match.refereeStyle,
        },
        attendance: {
          home: match.homeAttendance,
          away: match.awayAttendance,
          total: match.totalAttendance,
        },
      }

      // 注入数据到 Prompt
      const fullPrompt = this.algorithmService.generateAnalysisPrompt(
        promptTemplate,
        processed.final,
        matchData,
      )

      // 读取系统 AI 配置（从环境变量获取）
      const apiEndpoint = this.configService.get<string>('AGENT_AI_ENDPOINT')
      const apiKey = this.configService.get<string>('AGENT_AI_KEY')
      const modelName = this.configService.get<string>('AGENT_AI_MODEL', 'agnes-2.0-flash')

      if (!apiEndpoint || !apiKey) {
        this.logger.warn('未配置 Agent AI 环境变量（AGENT_AI_ENDPOINT/AGENT_AI_KEY），跳过自动生成')
        return
      }

      // 调用 AI 中转服务
      const aiPayload = {
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '你是 CupAI 平台的自动赛事分析师。请基于提供的数据和权重，生成客观、专业的赛事分析报告。',
          },
          { role: 'user', content: fullPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }

      const aiResponse = await this.aiService.proxyAiRequest(apiEndpoint, apiKey, aiPayload)

      // 提取 AI 生成内容
      const content =
        (aiResponse as any)?.choices?.[0]?.message?.content ||
        (aiResponse as any)?.output?.text ||
        (typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse))

      // 保存 Agent 报告（强制公开 + 授权）
      const report = new AnalysisReportEntity()
      report.userId = 'system'
      report.matchId = match.id
      report.llmType = modelName
      report.weightSnapshot = processed.final
      report.content = content
      report.isPublic = true
      report.source = 'agent'
      report.isAuthorized = true
      report.displayLanguage = 'zh-CN'

      await this.reportRepo.save(report)
      this.logger.log(`赛事 ${match.id} Agent 分析报告已生成`)

      // 同时生成 21 维度预测数据，填充 dimension_submissions 表
      await this.generateDimensionPredictions(match, modelName)

      // 通过 WebSocket 通知广场有新报告
      this.squareGateway.broadcastNewReport({
        type: 'new_report',
        reportId: report.id,
        matchId: match.id,
      })
    } catch (error) {
      this.logger.error(`赛事 ${match.id} Agent 分析生成失败: ${error}`)
    }
  }

  /**
   * 获取默认分析 Prompt 模板
   */
  private getDefaultPromptTemplate(): string {
    return `请基于以下赛事数据和权重配置，生成一份专业的赛事分析报告。

## 权重配置
{{weights}}

## 赛事数据
{{matchData}}

## 分析要求
1. 按权重优先级逐项分析各维度数据
2. 给出双方优势与劣势对比
3. 综合分析后给出预测结论
4. 标注数据置信度和关键不确定性因素

分析时间: {{timestamp}}`
  }

  /**
   * 21 维度定义（与前端 DIMENSIONS 保持一致）
   * 用于自动生成维度预测数据
   */
  private static readonly DIMENSION_DEFS: Array<{
    key: string
    options: string[]
    question: string
  }> = [
    { key: 'result_wdl', options: ['home', 'draw', 'away'], question: '全场胜平负' },
    { key: 'result_total_goals', options: ['0', '1', '2', '3', '4+'], question: '全场总进球档位' },
    { key: 'result_half_full', options: ['HW', 'HD', 'HL', 'DW', 'DD', 'DL', 'LW', 'LD', 'LL'], question: '半全场结果' },
    { key: 'result_exact_score', options: [], question: '精准比分' },
    { key: 'goal_first_half', options: ['yes', 'no'], question: '上半场有无进球' },
    { key: 'goal_first', options: ['home', 'away', 'none'], question: '首球归属' },
    { key: 'goal_last', options: ['home', 'away', 'none'], question: '末球归属' },
    { key: 'goal_own', options: ['yes', 'no'], question: '是否出现乌龙球' },
    { key: 'goal_player_score', options: ['score', 'noScore'], question: '指定球员能否破门' },
    { key: 'goal_stoppage', options: ['yes', 'no'], question: '补时阶段能否产生进球' },
    { key: 'goal_clean_sheet', options: ['home', 'away', 'none'], question: '单队零封' },
    { key: 'goal_odd_even', options: ['odd', 'even'], question: '全场进球总数单双' },
    { key: 'penalty_awarded', options: ['yes', 'no'], question: '是否判罚点球' },
    { key: 'penalty_var_cancel', options: ['yes', 'no'], question: 'VAR取消进球' },
    { key: 'penalty_knockout_extra', options: ['extra', 'shootout', 'normal'], question: '淘汰赛加时/点球' },
    { key: 'card_red', options: ['yes', 'no'], question: '是否出现红牌' },
    { key: 'card_yellow_total', options: ['0', '1-2', '3+'], question: '黄牌总量' },
    { key: 'card_yellow_compare', options: ['home', 'away', 'equal'], question: '两队黄牌数量对比' },
    { key: 'corner_total', options: ['0-3', '4-6', '7+'], question: '全场角球总数档位' },
    { key: 'corner_freekick_goal', options: ['yes', 'no'], question: '有无任意球直接得分' },
    { key: 'corner_substitutions', options: ['home', 'away', 'equal'], question: '两队换人次数对比' },
  ]

  /**
   * 为单场赛事自动生成 21 维度预测数据
   * 使用 AI 模型一次性生成所有维度的概率分布，然后逐条写入 dimension_submissions
   */
  private async generateDimensionPredictions(match: MatchEntity, modelName: string) {
    try {
      // 检查该赛事是否已有维度数据（避免重复生成）
      const existingCount = await this.submissionRepo.count({
        where: { matchId: match.id },
      })
      if (existingCount > 0) {
        this.logger.log(`赛事 ${match.id} 已有 ${existingCount} 条维度数据，跳过自动生成`)
        return
      }

      const apiEndpoint = this.configService.get<string>('AGENT_AI_ENDPOINT')
      const apiKey = this.configService.get<string>('AGENT_AI_KEY')
      if (!apiEndpoint || !apiKey) return

      // 构建 AI 提示词，要求一次性输出所有维度的概率分布
      const dimensionList = AgentSchedulerService.DIMENSION_DEFS.map(
        (d, i) => `${i + 1}. ${d.key} (${d.question}): 候选项 [${d.options.join(', ')}${d.options.length === 0 ? '自由输出' : ''}]`,
      ).join('\n')

      // 构建赛事名称（从关联的 homeTeam/awayTeam 获取，或使用占位文本）
      const homeTeamName = (match as any).homeTeam?.name || match.homeTeamId || '主队'
      const awayTeamName = (match as any).awayTeam?.name || match.awayTeamId || '客队'

      const prompt = `你是一位专业的足球赛事分析师。请基于以下赛事信息，对每个维度给出概率分布预测。

赛事: ${homeTeamName} vs ${awayTeamName}
联赛: ${match.leagueName || ''}
阶段: ${match.stage || ''}
开赛时间: ${match.startTime || ''}

维度列表:
${dimensionList}

请严格按以下 JSON 格式输出，不要包含任何其他文字:
{
  "dimensions": [
    {"key": "result_wdl", "distribution": {"home": 0.45, "draw": 0.28, "away": 0.27}, "topOption": "home", "summary": "简要分析"},
    {"key": "result_total_goals", "distribution": {"0": 0.08, "1": 0.22, "2": 0.35, "3": 0.22, "4+": 0.13}, "topOption": "2", "summary": "简要分析"},
    ...
  ]
}

要求:
1. 每个维度的 distribution 中所有概率值之和必须等于 1
2. topOption 必须是 distribution 中概率最高的选项
3. summary 为 1-2 句简要分析理由
4. result_exact_score 维度的 distribution 为 {"1-0": 0.12, "2-1": 0.15, "2-0": 0.10, "1-1": 0.18, "0-0": 0.08, "0-1": 0.07, "1-2": 0.09, "0-2": 0.06, "2-2": 0.08, "3-1": 0.04, "3-0": 0.03} 等常见比分
5. 所有 21 个维度都必须包含`

      const aiPayload = {
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '你是 CupAI 平台的自动赛事分析师。请严格按照用户要求的 JSON 格式输出维度预测数据，不要包含任何 markdown 标记或其他文字。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }

      const aiResponse = await this.aiService.proxyAiRequest(apiEndpoint, apiKey, aiPayload)

      // 提取 AI 响应内容
      const content =
        (aiResponse as any)?.choices?.[0]?.message?.content ||
        (aiResponse as any)?.output?.text ||
        (typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse))

      // 解析 JSON（兼容 markdown 代码块包裹）
      let jsonStr = content
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim()
      }

      const parsed = JSON.parse(jsonStr)
      const dimensions = parsed.dimensions || parsed.data || []

      if (!Array.isArray(dimensions) || dimensions.length === 0) {
        this.logger.warn(`赛事 ${match.id} AI 返回的维度数据格式异常，跳过`)
        return
      }

      // 逐条写入 dimension_submissions
      let savedCount = 0
      for (const dim of dimensions) {
        if (!dim.key || !dim.distribution) continue

        const entry = this.submissionRepo.create({
          matchId: match.id,
          dimKey: dim.key,
          topOption: dim.topOption || null,
          topProbability: dim.topOption
            ? dim.distribution[dim.topOption] ?? null
            : null,
          distribution: dim.distribution,
          summary: dim.summary || null,
          model: modelName,
          platform: 'cupai-scheduler',
          apiKeyHint: 'scheduler',
        })
        await this.submissionRepo.save(entry)
        savedCount++
      }

      // 同步写入 Redis 缓存
      const cacheKey = `dimensions:${match.id}:all`
      const cacheEntries = dimensions.map((dim) => ({
        id: `auto_${Date.now()}_${dim.key}`,
        dimKey: dim.key,
        topOption: dim.topOption || null,
        topProbability: dim.topOption ? dim.distribution[dim.topOption] ?? null : null,
        distribution: dim.distribution,
        summary: dim.summary || null,
        model: modelName,
        updatedAt: new Date().toISOString(),
      }))
      await this.redisCache.set(cacheKey, cacheEntries, 3600)

      this.logger.log(`赛事 ${match.id} 已自动生成 ${savedCount} 条维度预测数据`)
    } catch (error) {
      this.logger.error(`赛事 ${match.id} 维度预测生成失败: ${error}`)
    }
  }
}
