import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AgentService } from './agent.service'
import { AlgorithmService } from './algorithm.service'
import { InteractionService } from './interaction.service'
import { CreateReportDto } from './dto/create-report.dto'
import { GenerateAnalysisDto } from './dto/generate-analysis.dto'
import { TriggerAgentDto } from './dto/trigger-agent.dto'
import { InteractionDto } from './dto/interaction.dto'

/**
 * Agent 与分析报告控制器
 */
@Controller('analysis')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly algorithmService: AlgorithmService,
    private readonly interactionService: InteractionService,
  ) {}

  // 生成分析报告（完整闭环：组装Prompt → 调AI → 保存报告）
  @Post('generate')
  @UseGuards(AuthGuard('jwt'))
  async generate(@Req() req: { user: { id: string } }, @Body() dto: GenerateAnalysisDto) {
    return this.agentService.generateAnalysis(req.user.id, dto)
  }

  // 用户手动触发 Agent 分析（需同意授权协议，报告强制公开）
  @Post('agent/trigger')
  @UseGuards(AuthGuard('jwt'))
  async triggerAgent(@Req() req: { user: { id: string } }, @Body() dto: TriggerAgentDto) {
    return this.agentService.triggerAgentAnalysis(req.user.id, dto)
  }

  // 获取 Agent 授权协议文本
  @Get('agent/agreement')
  async getAgentAgreement() {
    return {
      title: 'CupAI Agent 分析授权协议',
      version: '1.0',
      content: `在使用 CupAI Agent 自动分析功能前，请您仔细阅读并同意以下条款：

1. **公开授权**：您理解并同意，通过 Agent 功能生成的分析报告将自动设为公开，所有用户可见。
2. **不可逆规则**：Agent 生成的公开内容不可设为私密，此权限不可逆。
3. **内容归属**：Agent 分析报告基于您选择的 AI 模型和权重配置生成，内容版权归您所有，但平台有权在广场等公共区域展示。
4. **合规声明**：所有分析内容仅供体育赛事数据娱乐参考，不构成任何投注及博弈建议。
5. **内容审核**：Agent 生成的内容将经过平台风控系统自动审核，违规内容将被过滤或删除。
6. **责任声明**：AI 生成内容可能存在偏差，您应对分析结果的使用自行判断和负责。`,
    }
  }

  // 手动生成分析报告（需登录）
  @Post('manual')
  @UseGuards(AuthGuard('jwt'))
  async createManual(@Req() req: { user: { id: string } }, @Body() dto: CreateReportDto) {
    return this.agentService.createManualReport(req.user.id, dto)
  }

  // Agent 自动生成报告（需登录 + 授权）
  @Post('agent')
  @UseGuards(AuthGuard('jwt'))
  async createAgent(@Req() req: { user: { id: string } }, @Body() dto: CreateReportDto) {
    return this.agentService.createAgentReport(req.user.id, dto)
  }

  // 获取分析广场公开报告
  @Get('square')
  async getSquare(
    @Query('matchId') matchId?: string,
    @Query('source') source?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.agentService.getPublicReports(matchId, source, Number(page) || 1, Number(pageSize) || 20)
  }

  // 获取个人报告（需登录）
  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyReports(@Req() req: { user: { id: string } }) {
    return this.agentService.getUserReports(req.user.id)
  }

  // 设置报告公开/私密（需登录）
  @Put(':id/visibility')
  @UseGuards(AuthGuard('jwt'))
  async toggleVisibility(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { isPublic: boolean },
  ) {
    return this.agentService.toggleVisibility(req.user.id, id, body.isPublic)
  }

  // 删除报告（需登录）
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteReport(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.agentService.deleteReport(req.user.id, id)
  }

  // ============ 算法接口 ============

  // 权重处理流程（归一化+制衡+自适应）
  @Post('algorithm/weights')
  @UseGuards(AuthGuard('jwt'))
  async processWeights(
    @Body() body: { weights: Record<string, number>; stage?: string; isDerby?: boolean; isNeutral?: boolean },
  ) {
    return this.algorithmService.autoProcessWeights(
      body.weights,
      body.stage || '小组赛',
      body.isDerby,
      body.isNeutral,
    )
  }

  // 数据降噪
  @Post('algorithm/denoise')
  @UseGuards(AuthGuard('jwt'))
  async denoiseData(@Body() body: { data: number[]; windowSize?: number }) {
    return { denoised: this.algorithmService.processDataDenoise(body.data, body.windowSize) }
  }

  // 舆情分析
  @Post('algorithm/sentiment')
  @UseGuards(AuthGuard('jwt'))
  async analyzeSentiment(
    @Body() body: { positiveWords: Record<string, number>; negativeWords: Record<string, number>; text: string },
  ) {
    return this.algorithmService.analyzeSentiment(body.positiveWords, body.negativeWords, body.text)
  }

  // ============ 社区互动接口 ============

  // 点赞/收藏（toggle 模式）
  @Post('interaction')
  @UseGuards(AuthGuard('jwt'))
  async toggleInteraction(@Req() req: { user: { id: string } }, @Body() dto: InteractionDto) {
    return this.interactionService.toggleInteraction(req.user.id, dto)
  }

  // 查询用户对多份报告的互动状态
  @Post('interactions/check')
  @UseGuards(AuthGuard('jwt'))
  async checkInteractions(
    @Req() req: { user: { id: string } },
    @Body() body: { reportIds: string[] },
  ) {
    return this.interactionService.getUserInteractions(req.user.id, body.reportIds)
  }

  // 获取我的收藏列表
  @Get('interactions/collections')
  @UseGuards(AuthGuard('jwt'))
  async getMyCollections(@Req() req: { user: { id: string } }) {
    return this.interactionService.getUserCollections(req.user.id)
  }
}
