import { Injectable, ForbiddenException, NotFoundException, Logger, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AnalysisReportEntity } from './entities/analysis-report.entity'
import { CreateReportDto } from './dto/create-report.dto'
import { GenerateAnalysisDto } from './dto/generate-analysis.dto'
import { TriggerAgentDto } from './dto/trigger-agent.dto'
import { AlgorithmService } from './algorithm.service'
import { AiService } from '../ai/ai.service'
import { MatchEntity } from '../match/entities/match.entity'
import { UserAiConfigEntity } from '../ai/entities/user-ai-config.entity'
import { WeightModelEntity } from '../ranking/entities/weight-model.entity'
import { PromptTemplateEntity } from '../prompt/entities/prompt-template.entity'

/**
 * Agent 服务 - 分析报告生成与管理
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)

  constructor(
    @InjectRepository(AnalysisReportEntity)
    private readonly reportRepo: Repository<AnalysisReportEntity>,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(UserAiConfigEntity)
    private readonly aiConfigRepo: Repository<UserAiConfigEntity>,
    @InjectRepository(WeightModelEntity)
    private readonly weightModelRepo: Repository<WeightModelEntity>,
    @InjectRepository(PromptTemplateEntity)
    private readonly promptTemplateRepo: Repository<PromptTemplateEntity>,
    private readonly algorithmService: AlgorithmService,
    private readonly aiService: AiService,
  ) {}

  /**
   * 生成分析报告（完整闭环流程）
   * 1. 获取赛事数据 + AI配置 + 权重模型 + Prompt模板
   * 2. 算法处理权重（归一化→极值修正→跨因子制衡→场景自适应）
   * 3. 组装完整 Prompt
   * 4. 调用 AI 中转服务生成分析
   * 5. 保存报告并返回
   */
  async generateAnalysis(userId: string, dto: GenerateAnalysisDto) {
    // 步骤1：获取赛事数据
    const match = await this.matchRepo.findOne({
      where: { id: dto.matchId },
      relations: ['homeTeam', 'awayTeam'],
    })
    if (!match) throw new NotFoundException('赛事不存在')

    // 获取 AI 配置
    const aiConfig = await this.aiConfigRepo.findOne({
      where: { id: dto.aiConfigId, userId },
    })
    if (!aiConfig) throw new NotFoundException('AI 配置不存在')

    // 获取权重模型（可选）
    let weightModel: WeightModelEntity | null = null
    let rawWeights: Record<string, number> = {}
    if (dto.weightModelId) {
      weightModel = await this.weightModelRepo.findOne({
        where: { id: dto.weightModelId, userId },
      })
      if (!weightModel) throw new NotFoundException('权重模型不存在')
      rawWeights = {
        historicalRecord: Number(weightModel.historicalRecord),
        teamStrength: Number(weightModel.teamStrength),
        playerStatus: Number(weightModel.playerStatus),
        realtimeDynamic: Number(weightModel.realtimeDynamic),
        environment: Number(weightModel.environment),
        tacticalCounter: Number(weightModel.tacticalCounter),
        socialSentiment: Number(weightModel.socialSentiment),
        hiddenFactors: Number(weightModel.hiddenFactors),
      }
    }

    // 获取 Prompt 模板（可选）
    let promptTemplate = ''
    if (dto.promptTemplateId) {
      const template = await this.promptTemplateRepo.findOne({
        where: { id: dto.promptTemplateId },
      })
      if (!template) throw new NotFoundException('Prompt 模板不存在')
      promptTemplate = template.content
    }

    // 步骤2：算法处理权重
    let finalWeights = rawWeights
    if (Object.keys(rawWeights).length > 0) {
      const processed = this.algorithmService.autoProcessWeights(
        rawWeights,
        match.stage || '小组赛',
      )
      finalWeights = processed.final
      this.logger.log(`权重处理完成: ${JSON.stringify(finalWeights)}`)
    }

    // 步骤3：组装完整 Prompt
    const matchData = {
      league: match.leagueName,
      stage: match.stage,
      homeTeam: match.homeTeam?.name || '未知',
      awayTeam: match.awayTeam?.name || '未知',
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
      score: {
        home: match.homeScore,
        away: match.awayScore,
      },
      detailedData: match.matchData,
    }

    // 如果没有自定义模板，使用默认分析模板
    if (!promptTemplate) {
      promptTemplate = this.getDefaultPromptTemplate()
    }

    const fullPrompt = this.algorithmService.generateAnalysisPrompt(
      promptTemplate,
      finalWeights,
      matchData,
    )

    // 步骤4：调用 AI 中转服务
    this.logger.log(`开始调用 AI 中转服务: ${aiConfig.modelName}`)
    const aiPayload = {
      model: aiConfig.modelName,
      messages: [
        {
          role: 'system',
          content: '你是一位专业的足球赛事分析师，擅长基于多维度数据进行深度分析和预测。请用专业但易懂的语言撰写分析报告。',
        },
        { role: 'user', content: fullPrompt },
      ],
      temperature: Number(aiConfig.temperature) || 0.7,
      max_tokens: aiConfig.maxTokens || 4096,
    }

    const aiResponse = await this.aiService.proxyAiRequest(
      aiConfig.apiEndpoint,
      dto.apiKey,
      aiPayload,
    )

    // 提取 AI 生成的内容
    const content =
      (aiResponse as any)?.choices?.[0]?.message?.content ||
      (aiResponse as any)?.output?.text ||
      (typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse))

    // 步骤5：保存报告
    const report = new AnalysisReportEntity()
    report.userId = userId
    report.matchId = dto.matchId
    report.modelId = (dto.weightModelId || undefined) as any
    report.promptTemplateId = (dto.promptTemplateId || undefined) as any
    report.llmType = aiConfig.modelName
    report.weightSnapshot = finalWeights
    report.content = content
    report.isPublic = dto.isPublic ?? false
    report.source = 'manual'
    report.isAuthorized = false
    report.displayLanguage = dto.displayLanguage || 'zh-CN'

    const savedReport = await this.reportRepo.save(report)
    this.logger.log(`分析报告已生成: ${savedReport.id}`)

    return savedReport
  }

  /**
   * 用户手动触发 Agent 分析
   * 必须同意授权协议，报告强制公开
   */
  async triggerAgentAnalysis(userId: string, dto: TriggerAgentDto) {
    // 校验授权协议
    if (!dto.isAuthorized) {
      throw new BadRequestException('使用 Agent 分析必须同意公开授权协议')
    }

    // 复用 generateAnalysis 的核心流程，但标记为 agent 来源
    const match = await this.matchRepo.findOne({
      where: { id: dto.matchId },
      relations: ['homeTeam', 'awayTeam'],
    })
    if (!match) throw new NotFoundException('赛事不存在')

    const aiConfig = await this.aiConfigRepo.findOne({
      where: { id: dto.aiConfigId, userId },
    })
    if (!aiConfig) throw new NotFoundException('AI 配置不存在')

    // 获取权重模型（可选）
    let rawWeights: Record<string, number> = {}
    if (dto.weightModelId) {
      const weightModel = await this.weightModelRepo.findOne({
        where: { id: dto.weightModelId, userId },
      })
      if (!weightModel) throw new NotFoundException('权重模型不存在')
      rawWeights = {
        historicalRecord: Number(weightModel.historicalRecord),
        teamStrength: Number(weightModel.teamStrength),
        playerStatus: Number(weightModel.playerStatus),
        realtimeDynamic: Number(weightModel.realtimeDynamic),
        environment: Number(weightModel.environment),
        tacticalCounter: Number(weightModel.tacticalCounter),
        socialSentiment: Number(weightModel.socialSentiment),
        hiddenFactors: Number(weightModel.hiddenFactors),
      }
    }

    // 获取 Prompt 模板（可选）
    let promptTemplate = ''
    if (dto.promptTemplateId) {
      const template = await this.promptTemplateRepo.findOne({
        where: { id: dto.promptTemplateId },
      })
      if (!template) throw new NotFoundException('Prompt 模板不存在')
      promptTemplate = template.content
    }

    // 算法处理权重
    let finalWeights = rawWeights
    if (Object.keys(rawWeights).length > 0) {
      const processed = this.algorithmService.autoProcessWeights(rawWeights, match.stage || '小组赛')
      finalWeights = processed.final
    }

    // 组装赛事数据
    const matchData = {
      league: match.leagueName,
      stage: match.stage,
      homeTeam: match.homeTeam?.name || '未知',
      awayTeam: match.awayTeam?.name || '未知',
      startTime: match.startTime,
      venue: match.venue,
      weather: { temperature: match.temperature, humidity: match.humidity, condition: match.weatherCondition, windSpeed: match.windSpeed },
      referee: { name: match.refereeName, nationality: match.refereeNationality, style: match.refereeStyle },
      attendance: { home: match.homeAttendance, away: match.awayAttendance, total: match.totalAttendance },
      score: { home: match.homeScore, away: match.awayScore },
    }

    if (!promptTemplate) promptTemplate = this.getDefaultPromptTemplate()

    const fullPrompt = this.algorithmService.generateAnalysisPrompt(promptTemplate, finalWeights, matchData)

    // 调用 AI 中转
    this.logger.log(`Agent 分析: 用户 ${userId} 触发赛事 ${dto.matchId}`)
    const aiPayload = {
      model: aiConfig.modelName,
      messages: [
        { role: 'system', content: '你是 CupAI 平台的赛事分析师。请基于提供的数据和权重，生成客观、专业的赛事分析报告。' },
        { role: 'user', content: fullPrompt },
      ],
      temperature: Number(aiConfig.temperature) || 0.7,
      max_tokens: aiConfig.maxTokens || 4096,
    }

    const aiResponse = await this.aiService.proxyAiRequest(aiConfig.apiEndpoint, dto.apiKey, aiPayload)

    const content =
      (aiResponse as any)?.choices?.[0]?.message?.content ||
      (aiResponse as any)?.output?.text ||
      (typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse))

    // 保存 Agent 报告（强制公开 + 授权）
    const report = new AnalysisReportEntity()
    report.userId = userId
    report.matchId = dto.matchId
    report.modelId = (dto.weightModelId || undefined) as any
    report.promptTemplateId = (dto.promptTemplateId || undefined) as any
    report.llmType = aiConfig.modelName
    report.weightSnapshot = finalWeights
    report.content = content
    report.isPublic = true // Agent 报告强制公开
    report.source = 'agent'
    report.isAuthorized = true // 用户已同意授权
    report.displayLanguage = dto.displayLanguage || 'zh-CN'

    const savedReport = await this.reportRepo.save(report)
    this.logger.log(`Agent 分析报告已生成: ${savedReport.id}`)
    return savedReport
  }

  /**
   * 获取默认分析 Prompt 模板
   * 当用户未选择自定义模板时使用
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
   * 手动生成分析报告
   * 默认私密，用户可选择公开
   */
  async createManualReport(userId: string, dto: CreateReportDto) {
    const report = this.reportRepo.create({
      userId,
      matchId: dto.matchId,
      modelId: dto.modelId,
      promptTemplateId: dto.promptTemplateId,
      llmType: dto.llmType,
      weightSnapshot: dto.weightSnapshot,
      content: dto.content,
      isPublic: false, // 手动分析默认私密
      source: 'manual',
      isAuthorized: false,
      displayLanguage: dto.displayLanguage || 'zh-CN',
    })
    return this.reportRepo.save(report)
  }

  /**
   * Agent 自动生成报告
   * 强制公开，不可设为私密
   */
  async createAgentReport(userId: string, dto: CreateReportDto) {
    const report = this.reportRepo.create({
      userId,
      matchId: dto.matchId,
      modelId: dto.modelId,
      promptTemplateId: dto.promptTemplateId,
      llmType: dto.llmType,
      weightSnapshot: dto.weightSnapshot,
      content: dto.content,
      isPublic: true, // Agent 报告强制公开
      source: 'agent',
      isAuthorized: true, // Agent 报告强制授权公开
      displayLanguage: dto.displayLanguage || 'zh-CN',
    })
    return this.reportRepo.save(report)
  }

  /**
   * 设置报告公开/私密
   * 规则：手动报告可自由切换，Agent 报告不可设为私密
   */
  async toggleVisibility(userId: string, reportId: string, isPublic: boolean) {
    const report = await this.reportRepo.findOne({ where: { id: reportId } })
    if (!report) throw new ForbiddenException('报告不存在')
    if (report.userId !== userId) throw new ForbiddenException('无权操作他人报告')

    // Agent 报告不可设为私密（内容权限不可逆规则）
    if (report.source === 'agent' && !isPublic) {
      throw new ForbiddenException('Agent 授权生成的公开内容不可私有化')
    }

    await this.reportRepo.update(reportId, { isPublic })
  }

  /**
   * 获取分析广场公开报告
   */
  async getPublicReports(matchId?: string, source?: string, page = 1, pageSize = 20) {
    const query = this.reportRepo
      .createQueryBuilder('r')
      .where('r.isPublic = :isPublic', { isPublic: true })
      .leftJoinAndSelect('r.user', 'user')

    if (matchId) query.andWhere('r.matchId = :matchId', { matchId })
    if (source) query.andWhere('r.source = :source', { source })

    query.orderBy('r.createdAt', 'DESC')

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { list, total, page, pageSize }
  }

  /**
   * 获取用户个人报告（含私密）
   */
  async getUserReports(userId: string) {
    return this.reportRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
  }

  /**
   * 删除报告
   * Agent 报告仅可本人删除，删除后全网下架
   */
  async deleteReport(userId: string, reportId: string) {
    const report = await this.reportRepo.findOne({ where: { id: reportId } })
    if (!report) throw new ForbiddenException('报告不存在')
    if (report.userId !== userId) throw new ForbiddenException('无权删除他人报告')
    await this.reportRepo.delete(reportId)
  }
}
