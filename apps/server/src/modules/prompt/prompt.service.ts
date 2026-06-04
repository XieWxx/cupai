import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PromptTemplateEntity } from './entities/prompt-template.entity'
import { CreatePromptDto } from './dto/create-prompt.dto'

// Prompt 模板支持的所有变量
const TEMPLATE_VARIABLES = [
  '{{weights}}',
  '{{matchData}}',
  '{{timestamp}}',
  '{{league}}',
  '{{stage}}',
  '{{homeTeam}}',
  '{{awayTeam}}',
  '{{venue}}',
  '{{weather}}',
  '{{referee}}',
  '{{attendance}}',
  '{{score}}',
]

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

  /**
   * 校验 Prompt 模板变量
   * 检测模板中使用的变量是否合法，返回校验结果
   */
  validateTemplate(content: string): { valid: boolean; usedVariables: string[]; unknownVariables: string[]; missingRequired: string[] } {
    // 提取模板中所有 {{xxx}} 变量
    const regex = /\{\{(\w+)\}\}/g
    const found: string[] = []
    let match: RegExpExecArray | null
    while ((match = regex.exec(content)) !== null) {
      found.push(`{{${match[1]}}}`)
    }

    const usedVariables = [...new Set(found)]
    const knownSet = new Set(TEMPLATE_VARIABLES)
    const unknownVariables = usedVariables.filter((v) => !knownSet.has(v))

    // 必须包含 weights 或 matchData 之一
    const required = ['{{weights}}', '{{matchData}}']
    const missingRequired = required.filter((v) => !usedVariables.includes(v))

    return {
      valid: unknownVariables.length === 0 && missingRequired.length === 0,
      usedVariables,
      unknownVariables,
      missingRequired,
    }
  }

  /**
   * 预览 Prompt 模板（用示例数据填充变量）
   */
  previewTemplate(content: string): string {
    const sampleData: Record<string, string> = {
      '{{weights}}': '历史战绩: 18%, 球队实力: 18%, 球员状态: 14%, 实时动态: 12%, 环境: 10%, 战术克制: 5%, 舆情: 8%, 隐藏因素: 15%',
      '{{matchData}}': '联赛: 世界杯, 阶段: 小组赛, 主队: 巴西, 客队: 阿根廷, 场馆: 卢赛尔体育场',
      '{{timestamp}}': new Date().toISOString(),
      '{{league}}': '世界杯',
      '{{stage}}': '小组赛',
      '{{homeTeam}}': '巴西',
      '{{awayTeam}}': '阿根廷',
      '{{venue}}': '卢赛尔体育场',
      '{{weather}}': '温度: 28℃, 湿度: 45%, 天气: 晴, 风速: 12km/h',
      '{{referee}}': '裁判: C. Turpin, 国籍: 法国, 风格: 严格',
      '{{attendance}}': '主队球迷: 30000, 客队球迷: 25000, 总计: 55000',
      '{{score}}': '0 : 0',
    }

    let preview = content
    for (const [key, value] of Object.entries(sampleData)) {
      preview = preview.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
    }
    return preview
  }

  /**
   * 创建模板时自动校验变量
   */
  async createWithValidation(userId: string, dto: CreatePromptDto) {
    const validation = this.validateTemplate(dto.content)
    if (validation.unknownVariables.length > 0) {
      throw new BadRequestException(`模板包含未知变量: ${validation.unknownVariables.join(', ')}`)
    }
    if (validation.missingRequired.length > 0) {
      throw new BadRequestException(`模板必须包含 {{weights}} 或 {{matchData}} 变量之一`)
    }
    return this.create(userId, dto)
  }
}
