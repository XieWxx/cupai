import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WeightModelEntity } from './entities/weight-model.entity'
import { UserRankingEntity } from './entities/user-ranking.entity'
import { ModelRankingEntity } from './entities/model-ranking.entity'
import { AnalysisReportEntity } from '../agent/entities/analysis-report.entity'
import { DimensionSubmissionEntity } from '../agent/entities/dimension-submission.entity'
import { UserAiConfigEntity } from '../ai/entities/user-ai-config.entity'
import { UserEntity } from '../user/entities/user.entity'
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
 * 域名 / 平台字符串 -> 平台 key 的归一化映射
 * 平台识别失败时按 host 首字符兜底
 *
 * 兼容：URL 主机名、agent 客户端名、口语化别名
 *  - 真实域名（如 api.openai.com）按 host 匹配
 *  - 客户端/别名（如 'cursor'、'claude'、'chatgpt'）通过别名归一到标准 key
 *  - 标准 key 本身（如 'openai'、'anthropic'）原样返回
 */
function hostToPlatformKey(host: string): string {
  if (!host) return 'unknown'
  const h = host.toLowerCase()

  // 0) 标准 key 透传（后端 dimension_submissions.platform 直填 platformKey 的场景）
  const standardKeys = [
    'openai', 'anthropic', 'gemini', 'deepseek', 'qwen', 'ernie', 'spark',
    'glm', 'moonshot', 'cohere', 'cursor', 'windsurf', 'cline', 'trae',
    'codex-cli', 'workbuddy', 'agnes', 'coze',
    'doubao', 'hunyuan', 'stepfun', 'yi', 'meta', 'mistral', 'baichuan',
    'hermesagent',
  ]
  if (standardKeys.includes(h)) return h

  // 1) 客户端 / 口语化别名映射
  const aliasMap: Record<string, string> = {
    chatgpt: 'openai',
    gpt: 'openai',
    'open-ai': 'openai',
    claude: 'anthropic',
    'claude-ai': 'anthropic',
    bard: 'gemini',
    google: 'gemini',
    tongyi: 'qwen',
    wenxin: 'ernie',
    yiyan: 'ernie',
    xinghuo: 'spark',
    iflytek: 'spark',
    zhipu: 'glm',
    chatglm: 'glm',
    kimi: 'moonshot',
    bytedance: 'doubao',
    volcengine: 'doubao',
    tencent: 'hunyuan',
    '01-ai': 'yi',
    llama: 'meta',
    mixtral: 'mistral',
    codex: 'codex-cli',
    'hermes-agent': 'hermesagent',
    hermes: 'hermesagent',
  }
  if (aliasMap[h]) return aliasMap[h]

  // 2) 真实域名匹配
  if (/openai\.com/.test(h)) return 'openai'
  if (/anthropic\.com/.test(h)) return 'anthropic'
  if (/googleapis\.com|gemini|google\.com/.test(h)) return 'gemini'
  if (/deepseek\.com/.test(h)) return 'deepseek'
  if (/dashscope|aliyuncs\.com|qwen/.test(h)) return 'qwen'
  if (/qianfan|baidubce\.com|baidu/.test(h)) return 'ernie'
  if (/spark-api|xf-yun\.com|iflytek/.test(h)) return 'spark'
  if (/bigmodel\.cn|zhipu/.test(h)) return 'glm'
  if (/moonshot\.cn|kimi/.test(h)) return 'moonshot'
  if (/cohere\.ai/.test(h)) return 'cohere'
  if (/codex-cli|codex/i.test(h)) return 'codex-cli'
  if (/cursor/i.test(h)) return 'cursor'
  if (/windsurf/i.test(h)) return 'windsurf'
  if (/cline/i.test(h)) return 'cline'
  if (/trae/i.test(h)) return 'trae'
  if (/workbuddy/i.test(h)) return 'workbuddy'
  if (/agnes/i.test(h)) return 'agnes'
  if (/coze/i.test(h)) return 'coze'
  if (/doubao|volcengine|bytedance/i.test(h)) return 'doubao'
  if (/hunyuan|tencent/i.test(h)) return 'hunyuan'
  if (/stepfun|step/i.test(h)) return 'stepfun'
  if (/\byi-|01\.ai|\byi\b/.test(h)) return 'yi'
  if (/\bllama\b|meta\.com|meta-llama/i.test(h)) return 'meta'
  if (/mistral|mixtral|codestral/i.test(h)) return 'mistral'
  if (/baichuan/i.test(h)) return 'baichuan'
  if (/hermes/i.test(h)) return 'hermesagent'

  // 兜底：取主域名前缀
  const m = h.match(/^([a-z0-9-]+)/i)
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
  'codex-cli': 'Codex CLI',
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  cline: 'Cline',
  trae: 'Trae',
  workbuddy: 'WorkBuddy',
  agnes: 'Agnes',
  coze: 'Coze',
  doubao: '豆包',
  hunyuan: '腾讯混元',
  stepfun: '阶跃星辰',
  yi: '零一万物',
  meta: 'Meta Llama',
  mistral: 'Mistral',
  baichuan: '百川',
  hermesagent: 'Hermes Agent',
  unknown: '未配置',
}

/**
 * 模型名 -> 平台 key 的映射
 * 用于 dimension_submissions 中 platform 为空时从 model 字段推断平台
 */
function modelToPlatformKey(model: string): string {
  if (!model) return 'unknown'
  const m = model.toLowerCase().trim()
  if (/^(gpt-|o1-|o3-|chatgpt)/.test(m)) return 'openai'
  if (/^claude-/.test(m)) return 'anthropic'
  if (/gemini-/.test(m)) return 'gemini'
  if (/deepseek/.test(m)) return 'deepseek'
  if (/qwen|qwq/.test(m)) return 'qwen'
  if (/ernie-/.test(m)) return 'ernie'
  if (/spark|iflytek/.test(m)) return 'spark'
  if (/glm-|chatglm/.test(m)) return 'glm'
  if (/moonshot-|kimi/.test(m)) return 'moonshot'
  if (/cohere/.test(m)) return 'cohere'
  if (/workbuddy/.test(m)) return 'workbuddy'
  if (/agnes/.test(m)) return 'agnes'
  if (/coze/.test(m)) return 'coze'
  if (/doubao-|skylark-|volcengine/.test(m)) return 'doubao'
  if (/hunyuan-/.test(m)) return 'hunyuan'
  if (/\bstep-1\b|\bstep-2\b|stepfun/.test(m)) return 'stepfun'
  if (/(^|[-_/])yi-?\d|yi-large|yi-medium|yi-vision|01-ai/.test(m)) return 'yi'
  if (/llama|meta-llama/.test(m)) return 'meta'
  if (/mistral|mixtral|codestral/.test(m)) return 'mistral'
  if (/baichuan/.test(m)) return 'baichuan'
  return 'unknown'
}

/**
 * 模型名归一化函数
 * 将各种变体的模型名统一为标准形式，确保 model_rankings 和 user_ai_configs 中的模型名可匹配
 * 规则：
 * 1. 全部转小写
 * 2. 去除空格和常见分隔符变体（统一为连字符）
 * 3. 将同一模型的不同版本归一化（如 deepseek-chat/deepseek-reasoner → deepseek-chat/deepseek-reasoner，保持区分）
 * 4. 将常见别名归一化（如 gpt4 → gpt-4, claude3 → claude-3）
 */
function normalizeModelName(name: string): string {
  if (!name) return ''
  let n = name.trim().toLowerCase()
  // 统一分隔符：空格、下划线 → 连字符
  n = n.replace(/[\s_]+/g, '-')
  // 去除连续连字符
  n = n.replace(/-+/g, '-')
  // 去除首尾连字符
  n = n.replace(/^-+|-+$/g, '')

  // 常见别名归一化
  const aliasMap: Record<string, string> = {
    'gpt4': 'gpt-4',
    'gpt4o': 'gpt-4o',
    'gpt4-turbo': 'gpt-4-turbo',
    'gpt3.5': 'gpt-3.5',
    'gpt35': 'gpt-3.5',
    'gpt-35-turbo': 'gpt-3.5-turbo',
    'claude3': 'claude-3',
    'claude3.5': 'claude-3.5',
    'claude35': 'claude-3.5',
    'o1preview': 'o1-preview',
    'o1mini': 'o1-mini',
    'o3mini': 'o3-mini',
    'deepseekchat': 'deepseek-chat',
    'deepseekreasoner': 'deepseek-reasoner',
    'deepseek-v3': 'deepseek-chat',
    'deepseek-r1': 'deepseek-reasoner',
    'qwen2.5': 'qwen-2.5',
    'qwenmax': 'qwen-max',
    'qwq': 'qwen-qwq',
    'glm4': 'glm-4',
    'chatglm4': 'glm-4',
    'doubao-pro': 'doubao-pro',
    'hunyuan-lite': 'hunyuan-lite',
    'moonshot-v1': 'moonshot-v1',
    'kimi': 'moonshot-v1',
  }
  if (aliasMap[n]) return aliasMap[n]

  return n
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
    @InjectRepository(DimensionSubmissionEntity)
    private readonly submissionRepo: Repository<DimensionSubmissionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
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

    // 主排序：按预测次数降序；预测次数相同时按 totalScore 兜底
    query.orderBy('r.totalPredictions', 'DESC')
    query.addOrderBy('r.totalScore', 'DESC')

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
   * userCount 统计来源：dimension_submissions 表，按归一化模型名统计去重 apiKeyHint
   *
   * @param limit  限制返回条数（首页摘要用）
   */
  async getModelRankings(seasonId?: string, page = 1, pageSize = 20, limit?: number) {
    const query = this.modelRankingRepo.createQueryBuilder('r')

    if (seasonId) {
      query.andWhere('r.seasonId = :seasonId', { seasonId })
    }

    query.orderBy('r.totalPredictions', 'DESC')
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

    // 从 dimension_submissions 统计每个模型的使用用户数（按归一化模型名去重 apiKeyHint）
    const submissionRows = await this.submissionRepo
      .createQueryBuilder('s')
      .select('s.model', 'model')
      .addSelect('s.apiKeyHint', 'apiKeyHint')
      .where('s.model IS NOT NULL')
      .andWhere('s.model != :empty', { empty: '' })
      .andWhere('s.apiKeyHint IS NOT NULL')
      .getRawMany()

    // 建立 归一化模型名 -> Set<apiKeyHint> 映射
    const modelUserMap = new Map<string, Set<string>>()
    for (const row of submissionRows) {
      const mn = (row.model || '').trim()
      if (!mn) continue
      const key = normalizeModelName(mn)
      if (!modelUserMap.has(key)) modelUserMap.set(key, new Set())
      modelUserMap.get(key)!.add(row.apiKeyHint)
    }

    // 附加 userCount 和 modelKey 到每条记录
    const listWithUserCount = list.map(item => {
      const mn = item.modelName?.trim()
      if (!mn) return { ...item, userCount: 0, modelKey: '' }
      const normalizedKey = normalizeModelName(mn)
      const users = modelUserMap.get(normalizedKey)
      return { ...item, userCount: users?.size || 0, modelKey: normalizedKey }
    })

    return { list: listWithUserCount, total, page, pageSize }
  }

  /**
   * 热门 Agent 平台排行
   * 从 dimension_submissions 聚合：
   * 1. 按 platform/model 字段归一化为 platformKey
   * 2. 统计每个 platformKey 的去重用户数（apiKeyHint）和预测次数
   * 3. 保留用户传的原始 platform 名作为 platformName
   */
  async getPlatformRankings(limit?: number) {
    // 从 dimension_submissions 聚合
    const submissionRows = await this.submissionRepo
      .createQueryBuilder('s')
      .select('s.platform', 'platform')
      .addSelect('s.model', 'model')
      .addSelect('s.apiKeyHint', 'apiKeyHint')
      .getRawMany()

    // 按 platformKey 聚合：统计去重用户数 + 预测次数 + 保留原始名
    const platformAggMap = new Map<string, {
      platformKey: string
      platformName: string
      userSet: Set<string>
      totalPredictions: number
    }>()

    for (const row of submissionRows) {
      const rawPlatform: string = row.platform || ''
      const rawModel: string = row.model || ''
      const apiKeyHint: string = row.apiKeyHint || ''

      // 优先使用 platform 字段，若为空则从 model 推断
      let key = rawPlatform ? hostToPlatformKey(rawPlatform.toLowerCase()) : ''
      if (!key || key === 'unknown') {
        key = modelToPlatformKey(rawModel)
      }
      if (!key || key === 'unknown') continue

      // 保留用户传的原始平台名（优先用 platform 字段，否则用 model 推断出的平台展示名）
      const displayName = rawPlatform || rawModel || key

      if (!platformAggMap.has(key)) {
        platformAggMap.set(key, {
          platformKey: key,
          platformName: displayName,
          userSet: new Set(),
          totalPredictions: 0,
        })
      }
      const agg = platformAggMap.get(key)!
      agg.totalPredictions += 1
      if (apiKeyHint) agg.userSet.add(apiKeyHint)
      // 优先保留更短的原始名（如 "coze" 优先于 "coze/xxx"）
      if (rawPlatform && (!agg.platformName || agg.platformName.length > rawPlatform.length)) {
        agg.platformName = rawPlatform
      }
    }

    let list = Array.from(platformAggMap.values())
      .filter((row) => row.platformKey !== 'unknown')
      .map((agg) => ({
        platform: agg.platformName,
        platformKey: agg.platformKey,
        userCount: agg.userSet.size,
        totalPredictions: agg.totalPredictions,
      }))
      .sort((a, b) => b.totalPredictions - a.totalPredictions)

    if (limit && limit > 0) {
      list = list.slice(0, limit)
    }

    return { list, total: list.length }
  }

  /**
   * 用户提交维度分析后，更新用户排行记录
   * 同时记录最近使用的模型和平台
   * @param userId 用户 ID
   * @param model 模型名称
   * @param platform 平台名称
   */
  async incrementUserPredictions(userId: string, model?: string, platform?: string): Promise<void> {
    let ranking = await this.userRankingRepo.findOne({ where: { userId } })
    if (!ranking) {
      ranking = this.userRankingRepo.create({
        userId,
        totalPredictions: 1,
        lastModel: model || null,
        lastPlatform: platform || null,
      })
    } else {
      ranking.totalPredictions += 1
      if (model) ranking.lastModel = model
      if (platform) ranking.lastPlatform = platform
    }
    await this.userRankingRepo.save(ranking)
  }

  /**
   * 模型提交维度分析后，更新模型排行记录
   * 同时记录所属平台
   * @param modelName 模型名称（如 deepseek-chat、gpt-4o）
   * @param platform 平台名称
   */
  async incrementModelPredictions(modelName: string, platform?: string): Promise<void> {
    if (!modelName) return
    let ranking = await this.modelRankingRepo.findOne({ where: { modelName } })
    if (!ranking) {
      ranking = this.modelRankingRepo.create({
        modelName,
        totalPredictions: 1,
        platform: platform || null,
      })
    } else {
      ranking.totalPredictions += 1
      if (platform) ranking.platform = platform
    }
    await this.modelRankingRepo.save(ranking)
  }

  /**
   * 按赛事维度获取用户预测排行
   * 从 dimension_submissions 按 matchId 聚合，
   * 统计每个用户（通过 apiKeyHint 反查）在该赛事的提交数、最近模型、最近平台
   *
   * @param matchId 赛事 ID
   * @param limit   限制返回条数
   */
  async getMatchUserRankings(matchId: string, limit = 10) {
    // 查询该赛事所有维度提交，按 api_key_hint 分组
    const rows = await this.submissionRepo
      .createQueryBuilder('s')
      .select('s.apiKeyHint', 'apiKeyHint')
      .addSelect('COUNT(*)', 'totalPredictions')
      .addSelect('MAX(s.model)', 'lastModel')
      .addSelect('MAX(s.platform)', 'lastPlatform')
      .addSelect('MAX(s.createdAt)', 'lastActiveAt')
      .where('s.matchId = :matchId', { matchId })
      .andWhere('s.apiKeyHint IS NOT NULL')
      .groupBy('s.apiKeyHint')
      .orderBy('COUNT(*)', 'DESC')
      .limit(limit)
      .getRawMany()

    if (rows.length === 0) {
      return { list: [], total: 0 }
    }

    // 通过 apiKeyHint 反查用户信息
    const hints = rows.map((r) => r.apiKeyHint)
    // 查找 apiKey 以 hint 开头的用户
    const users = await this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickname', 'u.username', 'u.region', 'u.apiKey'])
      .getMany()

    // 建立 hint -> user 映射
    const hintUserMap = new Map<string, UserEntity>()
    for (const user of users) {
      if (user.apiKey) {
        const hint = user.apiKey.slice(0, 8)
        hintUserMap.set(hint, user)
      }
    }

    const list = rows.map((r) => {
      const user = hintUserMap.get(r.apiKeyHint)
      return {
        userId: user?.id || null,
        username: user?.nickname || user?.username || 'Anonymous',
        countryCode: user?.region || '',
        lastModel: r.lastModel || '',
        lastPlatform: r.lastPlatform || null,
        totalPredictions: Number(r.totalPredictions) || 0,
        lastActiveAt: r.lastActiveAt,
      }
    })

    return { list, total: list.length }
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
