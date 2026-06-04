import { Injectable, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AnalysisReportEntity } from './entities/analysis-report.entity'
import { CreateReportDto } from './dto/create-report.dto'

/**
 * Agent 服务 - 分析报告生成与管理
 */
@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AnalysisReportEntity)
    private readonly reportRepo: Repository<AnalysisReportEntity>,
  ) {}

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
