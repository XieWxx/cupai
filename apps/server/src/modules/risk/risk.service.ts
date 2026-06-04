import { Injectable } from '@nestjs/common'
import { GAMBLING_BLOCKED_WORDS } from '@cupai/constants'

/**
 * 风控服务
 * - 博彩词汇屏蔽
 * - 敏感词过滤
 * - 内容合规审核
 */
@Injectable()
export class RiskService {
  // 博彩屏蔽词列表
  private readonly gamblingWords: string[]

  // 自定义敏感词列表（后续从数据库加载）
  private customSensitiveWords: string[] = []

  constructor() {
    this.gamblingWords = [...GAMBLING_BLOCKED_WORDS]
  }

  /**
   * 内容合规审核
   * @param content 待审核内容
   * @returns 审核结果
   */
  reviewContent(content: string): { passed: boolean; violations: string[] } {
    const violations: string[] = []
    const lowerContent = content.toLowerCase()

    // 博彩词汇检测
    for (const word of this.gamblingWords) {
      if (lowerContent.includes(word.toLowerCase())) {
        violations.push(`博彩违规词: ${word}`)
      }
    }

    // 自定义敏感词检测
    for (const word of this.customSensitiveWords) {
      if (lowerContent.includes(word.toLowerCase())) {
        violations.push(`敏感词: ${word}`)
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    }
  }

  /**
   * 过滤内容中的违规词汇（替换为 ***）
   * @param content 原始内容
   * @returns 过滤后的内容
   */
  filterContent(content: string): string {
    let filtered = content
    const allWords = [...this.gamblingWords, ...this.customSensitiveWords]

    for (const word of allWords) {
      const regex = new RegExp(word, 'gi')
      filtered = filtered.replace(regex, '***')
    }

    return filtered
  }

  /**
   * 添加自定义敏感词
   */
  addSensitiveWord(word: string) {
    if (!this.customSensitiveWords.includes(word)) {
      this.customSensitiveWords.push(word)
    }
  }

  /**
   * 移除自定义敏感词
   */
  removeSensitiveWord(word: string) {
    this.customSensitiveWords = this.customSensitiveWords.filter((w) => w !== word)
  }
}
