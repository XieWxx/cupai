import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InteractionEntity } from './entities/interaction.entity'
import { AnalysisReportEntity } from './entities/analysis-report.entity'
import { InteractionDto } from './dto/interaction.dto'

/**
 * 社区互动服务
 * 管理点赞、收藏功能（toggle 模式）
 */
@Injectable()
export class InteractionService {
  constructor(
    @InjectRepository(InteractionEntity)
    private readonly interactionRepo: Repository<InteractionEntity>,
    @InjectRepository(AnalysisReportEntity)
    private readonly reportRepo: Repository<AnalysisReportEntity>,
  ) {}

  /**
   * 点赞/收藏（toggle 模式：已存在则取消，不存在则创建）
   */
  async toggleInteraction(userId: string, dto: InteractionDto) {
    const report = await this.reportRepo.findOne({ where: { id: dto.reportId } })
    if (!report) throw new NotFoundException('报告不存在')

    // 查找是否已有互动记录
    const existing = await this.interactionRepo.findOne({
      where: { userId, reportId: dto.reportId, type: dto.type },
    })

    if (existing) {
      // 取消互动
      await this.interactionRepo.remove(existing)
      await this.updateReportCount(dto.reportId, dto.type, -1)
      return { action: 'removed', type: dto.type }
    }

    // 创建互动
    const interaction = this.interactionRepo.create({
      userId,
      reportId: dto.reportId,
      type: dto.type,
    })
    await this.interactionRepo.save(interaction)
    await this.updateReportCount(dto.reportId, dto.type, 1)
    return { action: 'added', type: dto.type }
  }

  /**
   * 查询用户对报告的互动状态
   */
  async getUserInteractions(userId: string, reportIds: string[]) {
    const interactions = await this.interactionRepo
      .createQueryBuilder('i')
      .where('i.userId = :userId', { userId })
      .andWhere('i.reportId IN (:...reportIds)', { reportIds })
      .getMany()

    // 转为 { reportId: { like: boolean, collect: boolean } } 结构
    const result: Record<string, { like: boolean; collect: boolean }> = {}
    for (const id of reportIds) {
      result[id] = { like: false, collect: false }
    }
    for (const i of interactions) {
      if (i.type === 'like') result[i.reportId].like = true
      if (i.type === 'collect') result[i.reportId].collect = true
    }
    return result
  }

  /**
   * 更新报告互动计数
   */
  private async updateReportCount(reportId: string, type: string, delta: number) {
    const field = type === 'like' ? 'likeCount' : 'collectCount'
    if (delta > 0) {
      await this.reportRepo.increment({ id: reportId }, field as any, 1)
    } else {
      await this.reportRepo.decrement({ id: reportId }, field as any, 1)
    }
  }

  /**
   * 获取用户收藏列表（含报告内容）
   */
  async getUserCollections(userId: string) {
    const collections = await this.interactionRepo.find({
      where: { userId, type: 'collect' },
      order: { createdAt: 'DESC' },
    })

    const reportIds = collections.map((c) => c.reportId)
    if (reportIds.length === 0) return []

    const reports = await this.reportRepo
      .createQueryBuilder('r')
      .where('r.id IN (:...ids)', { ids: reportIds })
      .getMany()

    // 合并收藏时间和报告内容
    return reports.map((r) => ({
      ...r,
      collectedAt: collections.find((c) => c.reportId === r.id)?.createdAt,
    }))
  }
}
