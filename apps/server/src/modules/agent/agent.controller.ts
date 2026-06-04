import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AgentService } from './agent.service'
import { AlgorithmService } from './algorithm.service'
import { CreateReportDto } from './dto/create-report.dto'

/**
 * Agent 与分析报告控制器
 */
@Controller('analysis')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly algorithmService: AlgorithmService,
  ) {}

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
}
