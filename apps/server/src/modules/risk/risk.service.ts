import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GAMBLING_BLOCKED_WORDS } from '@cupai/constants'
import { SensitiveWordEntity } from './entities/sensitive-word.entity'

/**
 * 风控服务
 * - 博彩词汇屏蔽
 * - 敏感词过滤（持久化存储）
 * - AI 内容二次审核
 */
@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name)

  // 博彩屏蔽词列表（从常量加载）
  private readonly gamblingWords: string[]

  constructor(
    @InjectRepository(SensitiveWordEntity)
    private readonly sensitiveWordRepo: Repository<SensitiveWordEntity>,
  ) {
    this.gamblingWords = [...GAMBLING_BLOCKED_WORDS]
  }

  /**
   * 内容合规审核
   * @param content 待审核内容
   * @returns 审核结果
   */
  async reviewContent(content: string): Promise<{ passed: boolean; violations: string[] }> {
    // 防御性空值保护：content 为 null/undefined/非字符串时视为通过（不阻断上层流程）
    if (!content || typeof content !== 'string') {
      return { passed: true, violations: [] }
    }

    const violations: string[] = []
    const lowerContent = content.toLowerCase()

    // 博彩词汇检测
    for (const word of this.gamblingWords) {
      if (lowerContent.includes(word.toLowerCase())) {
        violations.push(`博彩违规词: ${word}`)
      }
    }

    // 自定义敏感词检测（从数据库加载）
    const customWords = await this.sensitiveWordRepo.find()
    for (const entity of customWords) {
      if (lowerContent.includes(entity.word.toLowerCase())) {
        violations.push(`敏感词: ${entity.word}`)
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    }
  }

  /**
   * 过滤内容中的违规词汇（替换为 ***）
   */
  async filterContent(content: string): Promise<string> {
    let filtered = content
    const allWords = [...this.gamblingWords]

    // 从数据库加载自定义敏感词
    const customWords = await this.sensitiveWordRepo.find()
    for (const entity of customWords) {
      allWords.push(entity.word)
    }

    for (const word of allWords) {
      const regex = new RegExp(word, 'gi')
      filtered = filtered.replace(regex, '***')
    }

    return filtered
  }

  /**
   * AI 生成内容二次审核
   * 在 AI 分析报告发布前自动调用
   * @param content AI 生成的内容
   * @returns 审核通过的内容（已过滤违规词）或拒绝发布
   */
  async reviewAiContent(content: string): Promise<{ approved: boolean; filteredContent: string; violations: string[] }> {
    const review = await this.reviewContent(content)
    const filteredContent = await this.filterContent(content)

    if (!review.passed) {
      this.logger.warn(`AI 内容审核发现违规: ${review.violations.join(', ')}`)
    }

    return {
      approved: review.passed,
      filteredContent,
      violations: review.violations,
    }
  }

  /**
   * 添加自定义敏感词
   */
  async addSensitiveWord(word: string, createdBy = 'system') {
    const existing = await this.sensitiveWordRepo.findOne({ where: { word } })
    if (existing) return existing

    const entity = this.sensitiveWordRepo.create({ word, category: 'custom', createdBy })
    return this.sensitiveWordRepo.save(entity)
  }

  /**
   * 移除自定义敏感词
   */
  async removeSensitiveWord(word: string) {
    await this.sensitiveWordRepo.delete({ word })
  }

  /**
   * 获取所有自定义敏感词
   */
  async getSensitiveWords() {
    return this.sensitiveWordRepo.find({ order: { createdAt: 'DESC' } })
  }
}
