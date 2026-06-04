import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { MatchEntity } from '../match/entities/match.entity'
import { AnalysisReportEntity } from './entities/analysis-report.entity'
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
      const modelName = this.configService.get<string>('AGENT_AI_MODEL', 'deepseek')

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
}
