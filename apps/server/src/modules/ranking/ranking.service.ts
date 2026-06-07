import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WeightModelEntity } from './entities/weight-model.entity'
import { UserRankingEntity } from './entities/user-ranking.entity'
import { ModelRankingEntity } from './entities/model-ranking.entity'
import { AnalysisReportEntity } from '../agent/entities/analysis-report.entity'
import { UserAiConfigEntity } from '../ai/entities/user-ai-config.entity'
import { CreateWeightModelDto } from './dto/create-weight-model.dto'
import { WEIGHT_SUM } from '@cupai/constants'

/**
 * 用户排行支持的排序方式
 * - total：总预测准确率（默认）
 * - exact：精准比分命中率
 * - funny：趣味数据命中率
 */
export type UserRankingSort = 'total' | 'exact' | 'funny'

/**
 * 域名 -> 平台 key 的归一化映射
 * 平台识别失败时按 host 首字符兜底
 */
function hostToPlatformKey(host: string): string {
  if (!host) return 'unknown'
  if (/openai\.com/.test(host)) return 'openai'
  if (/anthropic\.com/.test(host)) return 'anthropic'
  if (/googleapis\.com|gemini|google\.com/.test(host)) return 'gemini'
  if (/deepseek\.com/.test(host)) return 'deepseek'
  if (/dashscope|aliyuncs\.com|qwen/.test(host)) return 'qwen'
  if (/qianfan|baidubce\.com|baidu/.test(host)) return 'ernie'
  if (/spark-api|xf-yun\.com|iflytek/.test(host)) return 'spark'
  if (/bigmodel\.cn|zhipu/.test(host)) return 'glm'
  if (/moonshot\.cn|kimi/.test(host)) return 'moonshot'
  if (/cohere\.ai/.test(host)) return 'cohere'
  // 兜底：取主域名前缀
  const m = host.match(/^([a-z0-9-]+)/i)
  return m ? m[1] : 'unknown'
}

/**
 * 平台 key -> 中文展示名（与前端 agentPlatform.ts 字典保持一致）
 */
const PLATFORM_DISPLAY: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
  deepseek: 'DeepSeek',
  qwen: '通义千问',
  ernie: '文心一言',
  spark: '讯飞星火',
  glm: '智谱清言',
  moonshot: 'Moonshot',
  cohere: 'Cohere',
  unknown: '未配置',
}

/**
 * 权重模型与排行服务
 */
@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(WeightModelEntity)
    private readonly weightModelRepo: Repository<WeightModelEntity>,
    @InjectRepository(UserRankingEntity)
    private readonly userRankingRepo: Repository<UserRankingEntity>,
    @InjectRepository(ModelRankingEntity)
    private readonly modelRankingRepo: Repository<ModelRankingEntity>,
    @InjectRepository(AnalysisReportEntity)
    private readonly reportRepo: Repository<AnalysisReportEntity>,
    @InjectRepository(UserAiConfigEntity)
    private readonly userAiConfigRepo: Repository<UserAiConfigEntity>,
  ) {}

  // 创建权重模型
  async createModel(userId: string, dto: CreateWeightModelDto) {
    // 校验权重总和 = 100
    const sum =
      dto.historicalRecord +
      dto.teamStrength +
      dto.playerStatus +
      dto.realtimeDynamic +
      dto.environment +
      dto.tacticalCounter +
      dto.socialSentiment +
      dto.hiddenFactors

    if (Math.abs(sum - WEIGHT_SUM) > 0.01) {
      throw new BadRequestException(`权重总和必须为 ${WEIGHT_SUM}%，当前为 ${sum}%`)
    }

    const model = this.weightModelRepo.create({ userId, ...dto })
    return this.weightModelRepo.save(model)
  }

  // 获取用户所有权重模型
  async getUserModels(userId: string) {
    return this.weightModelRepo.find({ where: { userId }, order: { isDefault: 'DESC', updatedAt: 'DESC' } })
  }

  // 更新权重模型
  async updateModel(userId: string, modelId: string, dto: Partial<CreateWeightModelDto>) {
    const model = await this.weightModelRepo.findOne({ where: { id: modelId } })
    if (!model) throw new NotFoundException('模型不存在')
    if (model.userId !== userId) throw new ForbiddenException('无权修改他人模型')

    // 如果更新了权重值，校验总和
    if (dto.historicalRecord !== undefined) {
      const sum =
        (dto.historicalRecord ?? model.historicalRecord) +
        (dto.teamStrength ?? model.teamStrength) +
        (dto.playerStatus ?? model.playerStatus) +
        (dto.realtimeDynamic ?? model.realtimeDynamic) +
        (dto.environment ?? model.environment) +
        (dto.tacticalCounter ?? model.tacticalCounter) +
        (dto.socialSentiment ?? model.socialSentiment) +
        (dto.hiddenFactors ?? model.hiddenFactors)

      if (Math.abs(sum - WEIGHT_SUM) > 0.01) {
        throw new BadRequestException(`权重总和必须为 ${WEIGHT_SUM}%，当前为 ${sum}%`)
      }
    }

    await this.weightModelRepo.update(modelId, dto)
    return this.weightModelRepo.findOne({ where: { id: modelId } })
  }

  // 删除权重模型
  async deleteModel(userId: string, modelId: string) {
    const model = await this.weightModelRepo.findOne({ where: { id: modelId } })
    if (!model) throw new NotFoundException('模型不存在')
    if (model.userId !== userId) throw new ForbiddenException('无权删除他人模型')
    await this.weightModelRepo.delete(modelId)
  }

  // 设置默认模型
  async setDefaultModel(userId: string, modelId: string) {
    // 取消当前默认
    await this.weightModelRepo.update({ userId, isDefault: true }, { isDefault: false })
    // 设置新默认
    await this.weightModelRepo.update({ id: modelId, userId }, { isDefault: true })
  }

  // ============ 排行榜 ============

  /**
   * 获取用户预测准确率排行
   * 按 sort 字段降序，支持赛季筛选
   * 关联用户的默认 AI 配置（denormalize 为 defaultAiConfig）
   *
   * @param sort    排序字段：total（默认）/ exact / funny
   * @param limit   限制返回条数（首页摘要用），与 page/pageSize 互斥，limit 优先
   */
  async getUserRankings(
    seasonId?: string,
    page = 1,
    pageSize = 20,
    sort?: string,
    limit?: number,
  ) {
    const sortKey: UserRankingSort =
      sort === 'exact' || sort === 'funny' ? sort : 'total'

    // 精准/趣味命中率字段尚未在实体中建模，使用 0 兜底，
    // 待 PRD 3.3.2 后端字段落地后可替换为真实表达式。
    const orderColumn =
      sortKey === 'exact'
        ? 'r.exactScoreRate'
        : sortKey === 'funny'
        ? 'r.funnyDataRate'
        : 'r.accuracyRate'

    const query = this.userRankingRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      // 关联用户的 AI 配置列表（用于 denormalize 默认配置）
      .leftJoinAndSelect('user.aiConfigs', 'aiCfg')

    if (seasonId) {
      query.andWhere('r.seasonId = :seasonId', { seasonId })
    }

    // 主排序：按 sort 字段降序；缺字段时按 totalScore / accuracyRate 兜底
    query.orderBy(orderColumn, 'DESC')
    query.addOrderBy('r.totalScore', 'DESC')
    query.addOrderBy('r.accuracyRate', 'DESC')

    let list: UserRankingEntity[]
    let total = 0
    if (limit && limit > 0) {
      // 首页摘要场景：跳过 count 提高性能
      list = await query.take(limit).getMany()
    } else {
      [list, total] = await query
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount()
    }

    // 后处理：denormalize 用户默认 AI 配置（前端可直接读取 platform + modelName）
    const enrichedList = list.map((r) => {
      const defaultCfg = r.user?.aiConfigs?.find((c) => c.isDefault) || null
      return {
        ...r,
        user: {
          ...r.user,
          // 默认 AI 配置（agentPlatform 推断 + modelName 取自此处）
          defaultAiConfig: defaultCfg,
        },
      }
    })

    return { list: enrichedList, total, page, pageSize }
  }

  /**
   * 获取大模型准确率排行
   * 按总积分降序
   *
   * @param limit  限制返回条数（首页摘要用）
   */
  async getModelRankings(seasonId?: string, page = 1, pageSize = 20, limit?: number) {
    const query = this.modelRankingRepo.createQueryBuilder('r')

    if (seasonId) {
      query.andWhere('r.seasonId = :seasonId', { seasonId })
    }

    query.orderBy('r.totalScore', 'DESC')
    query.addOrderBy('r.accuracyRate', 'DESC')

    let list: ModelRankingEntity[]
    let total = 0
    if (limit && limit > 0) {
      list = await query.take(limit).getMany()
    } else {
      [list, total] = await query
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount()
    }

    return { list, total, page, pageSize }
  }

  /**
   * 热门 Agent 平台排行（首页摘要用）
   * 聚合 user_ai_configs.apiEndpoint，按域名归一化后按用户数降序
   * 一个用户可被多个平台计数（按其全部 AI 配置）
   *
   * 返回结构：{ list: [{ platform, platformKey, userCount, totalPredictions }] }
   */
  async getPlatformRankings(limit?: number) {
    const configs = await this.userAiConfigRepo.find({
      select: ['id', 'userId', 'apiEndpoint'],
    })

    // 聚合：platformKey -> { userIds: Set, totalPredictions: 0 }
    const agg = new Map<
      string,
      { userIds: Set<string>; totalPredictions: number }
    >()

    for (const cfg of configs) {
      let host = ''
      try {
        let url = (cfg.apiEndpoint || '').trim()
        if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url
        host = url ? new URL(url).host.toLowerCase() : ''
      } catch {
        host = (cfg.apiEndpoint || '').split('/')[0].toLowerCase()
      }
      const key = hostToPlatformKey(host)
      if (!agg.has(key)) {
        agg.set(key, { userIds: new Set(), totalPredictions: 0 })
      }
      const bucket = agg.get(key)!
      bucket.userIds.add(cfg.userId)
    }

    let list = Array.from(agg.entries())
      .map(([platformKey, info]) => ({
        platform: PLATFORM_DISPLAY[platformKey] || platformKey,
        platformKey,
        userCount: info.userIds.size,
        totalPredictions: 0,
      }))
      .filter((row) => row.platformKey !== 'unknown')
      .sort((a, b) => b.userCount - a.userCount)

    if (limit && limit > 0) {
      list = list.slice(0, limit)
    }

    return { list, total: list.length }
  }

  /**
   * 用户提交维度分析后，更新用户排行记录
   * 如果用户没有排行记录，则创建一条新记录
   * @param userId 用户 ID
   */
  async incrementUserPredictions(userId: string): Promise<void> {
    let ranking = await this.userRankingRepo.findOne({ where: { userId } })
    if (!ranking) {
      ranking = this.userRankingRepo.create({ userId, totalPredictions: 1 })
    } else {
      ranking.totalPredictions += 1
    }
    await this.userRankingRepo.save(ranking)
  }

  /**
   * 模型提交维度分析后，更新模型排行记录
   * 如果模型没有排行记录，则创建一条新记录
   * @param modelName 模型名称（如 deepseek-chat、gpt-4o）
   */
  async incrementModelPredictions(modelName: string): Promise<void> {
    if (!modelName) return
    let ranking = await this.modelRankingRepo.findOne({ where: { modelName } })
    if (!ranking) {
      ranking = this.modelRankingRepo.create({ modelName, totalPredictions: 1 })
    } else {
      ranking.totalPredictions += 1
    }
    await this.modelRankingRepo.save(ranking)
  }

  /**
   * 获取用户个人排行信息
   */
  async getMyRanking(userId: string, seasonId?: string) {
    const where: any = { userId }
    if (seasonId) where.seasonId = seasonId

    const ranking = await this.userRankingRepo.findOne({ where })
    if (!ranking) {
      return {
        totalPredictions: 0,
        exactMatches: 0,
        basicMatches: 0,
        deviations: 0,
        totalMisses: 0,
        totalScore: 0,
        accuracyRate: 0,
      }
    }
    return ranking
  }

  /**
   * 获取热门 AI 分析简报
   * 按 match_id 聚合分析报告，取分析数量最多的赛事
   */
  async getHotBriefs(pageSize = 6) {
    // 按赛事聚合：统计每个赛事的分析数量、点赞总数、最常用模型
    const rows = await this.reportRepo
      .createQueryBuilder('r')
      .select('r.matchId', 'matchId')
      .addSelect('COUNT(*)', 'analysisCount')
      .addSelect('SUM(r.likeCount)', 'totalLikes')
      .addSelect('(SELECT r2.llm_type FROM analysis_reports r2 WHERE r2.match_id = r.match_id AND r2.is_public = 1 ORDER BY r2.like_count DESC LIMIT 1)', 'topModel')
      .addSelect('(SELECT r3.content FROM analysis_reports r3 WHERE r3.match_id = r.match_id AND r3.is_public = 1 ORDER BY r3.like_count DESC LIMIT 1)', 'topConclusion')
      .where('r.isPublic = :isPublic', { isPublic: true })
      .groupBy('r.matchId')
      .orderBy('COUNT(*)', 'DESC')
      .limit(pageSize)
      .getRawMany()

    if (rows.length === 0) {
      return { list: [] }
    }

    // 关联赛事和球队信息
    const matchIds = rows.map((r) => r.matchId)
    const matches = await this.reportRepo.manager
      .createQueryBuilder()
      .select([
        'm.id AS matchId',
        'm.league_name AS leagueName',
        'ht.name AS homeTeamName',
        'ht.country_code AS homeCountryCode',
        'at.name AS awayTeamName',
        'at.country_code AS awayCountryCode',
      ])
      .from('matches', 'm')
      .leftJoin('teams', 'ht', 'ht.id = m.home_team_id')
      .leftJoin('teams', 'at', 'at.id = m.away_team_id')
      .where('m.id IN (:...matchIds)', { matchIds })
      .getRawMany()

    const matchMap = new Map(matches.map((m) => [m.matchId, m]))

    const list = rows.map((r) => {
      const match = matchMap.get(r.matchId) || {}
      // 截取报告内容前 100 字符作为结论摘要
      const conclusion = r.topConclusion
        ? r.topConclusion.replace(/[#*\n]/g, ' ').trim().slice(0, 100)
        : ''
      return {
        matchId: r.matchId,
        homeTeamName: match.homeTeamName || '',
        homeCountryCode: match.homeCountryCode || 'INT',
        awayTeamName: match.awayTeamName || '',
        awayCountryCode: match.awayCountryCode || 'INT',
        leagueName: match.leagueName || '',
        topConclusion: conclusion,
        accuracyRate: 0,
        analysisCount: Number(r.analysisCount) || 0,
        topModel: r.topModel || '',
      }
    })

    return { list }
  }
}
