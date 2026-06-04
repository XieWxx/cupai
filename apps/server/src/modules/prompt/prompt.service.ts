import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PromptTemplateEntity } from './entities/prompt-template.entity'
import { CreatePromptDto } from './dto/create-prompt.dto'

/**
 * Prompt 模板服务
 */
@Injectable()
export class PromptService {
  constructor(
    @InjectRepository(PromptTemplateEntity)
    private readonly promptRepo: Repository<PromptTemplateEntity>,
  ) {}

  // 创建 Prompt 模板（默认私密）
  async create(userId: string, dto: CreatePromptDto) {
    const template = this.promptRepo.create({ userId, ...dto, isPublic: false })
    return this.promptRepo.save(template)
  }

  // 更新模板
  async update(userId: string, templateId: string, dto: Partial<CreatePromptDto>) {
    const template = await this.promptRepo.findOne({ where: { id: templateId } })
    if (!template) throw new NotFoundException('模板不存在')
    if (template.userId !== userId) throw new ForbiddenException('无权修改他人模板')
    await this.promptRepo.update(templateId, dto)
    return this.promptRepo.findOne({ where: { id: templateId } })
  }

  // 删除模板（仅创建者可删除）
  async delete(userId: string, templateId: string) {
    const template = await this.promptRepo.findOne({ where: { id: templateId } })
    if (!template) throw new NotFoundException('模板不存在')
    if (template.userId !== userId) throw new ForbiddenException('无权删除他人模板')
    await this.promptRepo.delete(templateId)
  }

  // 设置模板公开/私密
  async toggleVisibility(userId: string, templateId: string, isPublic: boolean) {
    const template = await this.promptRepo.findOne({ where: { id: templateId } })
    if (!template) throw new NotFoundException('模板不存在')
    if (template.userId !== userId) throw new ForbiddenException('无权修改他人模板')
    await this.promptRepo.update(templateId, { isPublic })
  }

  // 获取用户个人模板
  async getUserTemplates(userId: string) {
    return this.promptRepo.find({ where: { userId }, order: { updatedAt: 'DESC' } })
  }

  // 获取公开模板市场（支持筛选排序）
  async getPublicMarket(scene?: string, sortBy = 'useCount', page = 1, pageSize = 20) {
    const query = this.promptRepo
      .createQueryBuilder('t')
      .where('t.isPublic = :isPublic', { isPublic: true })

    if (scene) query.andWhere('t.scene = :scene', { scene })

    // 排序：使用量/收藏量/最新
    const sortMap: Record<string, string> = {
      useCount: 't.useCount DESC',
      collectCount: 't.collectCount DESC',
      latest: 't.createdAt DESC',
      likeCount: 't.likeCount DESC',
    }
    query.orderBy(sortMap[sortBy] || sortMap.useCount)

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { list, total, page, pageSize }
  }

  // 收藏模板（增加收藏计数）
  async collectTemplate(templateId: string) {
    await this.promptRepo.increment({ id: templateId }, 'collectCount', 1)
  }

  // 使用模板（增加使用计数）
  async useTemplate(templateId: string) {
    await this.promptRepo.increment({ id: templateId }, 'useCount', 1)
  }

  /**
   * 获取系统默认 Prompt 模板
   * userId='system' 的公开模板，作为新手兜底模板
   */
  async getSystemDefaults() {
    return this.promptRepo.find({
      where: { userId: 'system', isPublic: true },
      order: { useCount: 'DESC' },
    })
  }
}
