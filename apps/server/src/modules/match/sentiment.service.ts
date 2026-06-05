import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SentimentDataEntity } from './entities/sentiment-data.entity'
import { RedisCacheService } from '../../config/redis-cache.service'
import {
  analyzeMultilingualSentiment,
  aggregateSentiment,
  detectLanguage,
} from '@cupai/utils'
import type { MultilingualSentimentResult, SentimentAggregation, SupportedLanguage } from '@cupai/utils'

/**
 * 海外舆情精准识别服务
 * - 多语言情感分析（8 种语言）
 * - 按球队/赛事/地区聚合统计
 * - 舆情趋势追踪
 */
@Injectable()
export class SentimentService {
  private readonly logger = new Logger(SentimentService.name)

  constructor(
    @InjectRepository(SentimentDataEntity)
    private readonly sentimentRepo: Repository<SentimentDataEntity>,
    private readonly redisCache: RedisCacheService,
  ) {}

  /**
   * 提交舆情数据并自动分析
   */
  async submitAndAnalyze(data: {
    teamId?: string
    matchId?: string
    sourcePlatform: string
    originalText: string
    language?: SupportedLanguage
    region?: string
    publishedAt?: Date
    sourceUrl?: string
    author?: string
    engagement?: number
  }) {
    // 自动检测语言
    const detectedLanguage = data.language || detectLanguage(data.originalText)

    // 多语言情感分析
    const result = analyzeMultilingualSentiment(data.originalText, detectedLanguage)

    // 保存到数据库
    const entity = this.sentimentRepo.create({
      teamId: data.teamId || undefined,
      matchId: data.matchId || undefined,
      sourcePlatform: data.sourcePlatform,
      originalText: data.originalText,
      language: detectedLanguage,
      region: data.region || undefined,
      sentimentScore: result.score,
      sentimentPolarity: result.polarity,
      sentimentIntensity: result.intensity,
      confidence: result.confidence,
      publishedAt: data.publishedAt || new Date(),
      sourceUrl: data.sourceUrl || undefined,
      author: data.author || undefined,
      engagement: data.engagement || 0,
      isReviewed: false,
    } as Partial<SentimentDataEntity>)

    const saved = await this.sentimentRepo.save(entity)

    // 清除相关缓存
    if (data.teamId) await this.redisCache.del(`sentiment:team:${data.teamId}`)
    if (data.matchId) await this.redisCache.del(`sentiment:match:${data.matchId}`)
    await this.redisCache.del('sentiment:overview')

    return { ...saved, analysis: result }
  }

  /**
   * 批量提交舆情数据
   */
  async batchSubmit(items: Array<{
    teamId?: string
    matchId?: string
    sourcePlatform: string
    originalText: string
    language?: SupportedLanguage
    region?: string
    engagement?: number
  }>) {
    const results: Array<{ saved: SentimentDataEntity; analysis: MultilingualSentimentResult }> = []

    for (const item of items) {
      const detectedLanguage = item.language || detectLanguage(item.originalText)
      const analysis = analyzeMultilingualSentiment(item.originalText, detectedLanguage)

      const entity = this.sentimentRepo.create({
        teamId: item.teamId || undefined,
        matchId: item.matchId || undefined,
        sourcePlatform: item.sourcePlatform,
        originalText: item.originalText,
        language: detectedLanguage,
        region: item.region || undefined,
        sentimentScore: analysis.score,
        sentimentPolarity: analysis.polarity,
        sentimentIntensity: analysis.intensity,
        confidence: analysis.confidence,
        engagement: item.engagement || 0,
        isReviewed: false,
      } as Partial<SentimentDataEntity>)

      const saved = await this.sentimentRepo.save(entity) as SentimentDataEntity
      results.push({ saved, analysis })
    }

    this.logger.log(`批量分析完成: ${results.length} 条舆情数据`)

    // 清除缓存
    await this.redisCache.delByPattern('sentiment:*')

    return results
  }

  /**
   * 获取球队舆情聚合数据
   */
  async getTeamSentiment(teamId: string): Promise<SentimentAggregation & { recentItems: SentimentDataEntity[] }> {
    const cacheKey = `sentiment:team:${teamId}`
    const cached = await this.redisCache.get<any>(cacheKey)
    if (cached) return cached

    const items = await this.sentimentRepo.find({
      where: { teamId },
      order: { createdAt: 'DESC' },
      take: 500,
    })

    const results = items.map((item) => ({
      score: Number(item.sentimentScore),
      polarity: item.sentimentPolarity as 'positive' | 'negative' | 'neutral',
      intensity: Number(item.sentimentIntensity),
      confidence: Number(item.confidence),
      detectedLanguage: item.language as SupportedLanguage,
      matchedKeywords: [],
      culturalModifier: 1,
      region: item.region || undefined,
    }))

    const aggregation = aggregateSentiment(results)
    const recentItems = items.slice(0, 20)

    const result = { ...aggregation, recentItems }
    await this.redisCache.set(cacheKey, result, 300)
    return result
  }

  /**
   * 获取赛事舆情聚合数据
   */
  async getMatchSentiment(matchId: string): Promise<SentimentAggregation & { recentItems: SentimentDataEntity[] }> {
    const cacheKey = `sentiment:match:${matchId}`
    const cached = await this.redisCache.get<any>(cacheKey)
    if (cached) return cached

    const items = await this.sentimentRepo.find({
      where: { matchId },
      order: { createdAt: 'DESC' },
      take: 500,
    })

    const results = items.map((item) => ({
      score: Number(item.sentimentScore),
      polarity: item.sentimentPolarity as 'positive' | 'negative' | 'neutral',
      intensity: Number(item.sentimentIntensity),
      confidence: Number(item.confidence),
      detectedLanguage: item.language as SupportedLanguage,
      matchedKeywords: [],
      culturalModifier: 1,
      region: item.region || undefined,
    }))

    const aggregation = aggregateSentiment(results)
    const recentItems = items.slice(0, 20)

    const result = { ...aggregation, recentItems }
    await this.redisCache.set(cacheKey, result, 300)
    return result
  }

  /**
   * 获取全局舆情概览
   */
  async getOverview() {
    const cacheKey = 'sentiment:overview'
    const cached = await this.redisCache.get<any>(cacheKey)
    if (cached) return cached

    // 按平台统计
    const platformStats = await this.sentimentRepo
      .createQueryBuilder('s')
      .select('s.sourcePlatform', 'platform')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(s.sentimentScore)', 'avgScore')
      .groupBy('s.sourcePlatform')
      .getRawMany()

    // 按语言统计
    const languageStats = await this.sentimentRepo
      .createQueryBuilder('s')
      .select('s.language', 'language')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(s.sentimentScore)', 'avgScore')
      .groupBy('s.language')
      .getRawMany()

    // 按地区统计
    const regionStats = await this.sentimentRepo
      .createQueryBuilder('s')
      .select('s.region', 'region')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(s.sentimentScore)', 'avgScore')
      .where('s.region IS NOT NULL')
      .groupBy('s.region')
      .getRawMany()

    // 最近 24 小时趋势
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentTrend = await this.sentimentRepo
      .createQueryBuilder('s')
      .select("DATE_FORMAT(s.createdAt, '%Y-%m-%d %H:00')", 'hour')
      .addSelect('AVG(s.sentimentScore)', 'avgScore')
      .addSelect('COUNT(*)', 'count')
      .where('s.createdAt >= :yesterday', { yesterday })
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany()

    // 总体统计
    const total = await this.sentimentRepo.count()
    const avgScore = await this.sentimentRepo
      .createQueryBuilder('s')
      .select('AVG(s.sentimentScore)', 'avg')
      .getRawOne()

    const result = {
      total,
      avgScore: Number(avgScore?.avg || 0).toFixed(4),
      platformStats,
      languageStats,
      regionStats,
      recentTrend,
    }

    await this.redisCache.set(cacheKey, result, 300)
    return result
  }

  /**
   * 舆情时间线（按小时/天聚合）
   */
  async getTimeline(teamId?: string, matchId?: string, interval: 'hour' | 'day' = 'hour') {
    const format = interval === 'hour' ? '%Y-%m-%d %H:00' : '%Y-%m-%d'

    const query = this.sentimentRepo
      .createQueryBuilder('s')
      .select(`DATE_FORMAT(s.createdAt, '${format}')`, 'period')
      .addSelect('AVG(s.sentimentScore)', 'avgScore')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(CASE WHEN s.sentimentPolarity = \'positive\' THEN 1 ELSE 0 END)', 'positiveCount')
      .addSelect('SUM(CASE WHEN s.sentimentPolarity = \'negative\' THEN 1 ELSE 0 END)', 'negativeCount')
      .addSelect('SUM(CASE WHEN s.sentimentPolarity = \'neutral\' THEN 1 ELSE 0 END)', 'neutralCount')

    if (teamId) query.andWhere('s.teamId = :teamId', { teamId })
    if (matchId) query.andWhere('s.matchId = :matchId', { matchId })

    return query
      .groupBy('period')
      .orderBy('period', 'ASC')
      .limit(72)
      .getRawMany()
  }
}
