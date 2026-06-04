import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WeightModelEntity } from './entities/weight-model.entity'
import { UserRankingEntity } from './entities/user-ranking.entity'
import { ModelRankingEntity } from './entities/model-ranking.entity'
import { CreateWeightModelDto } from './dto/create-weight-model.dto'
import { WEIGHT_SUM } from '@cupai/constants'

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
   * 按总积分降序，支持赛季筛选
   */
  async getUserRankings(seasonId?: string, page = 1, pageSize = 20) {
    const query = this.userRankingRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')

    if (seasonId) {
      query.andWhere('r.seasonId = :seasonId', { seasonId })
    }

    query.orderBy('r.totalScore', 'DESC')
    query.addOrderBy('r.accuracyRate', 'DESC')

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { list, total, page, pageSize }
  }

  /**
   * 获取大模型准确率排行
   * 按总积分降序
   */
  async getModelRankings(seasonId?: string, page = 1, pageSize = 20) {
    const query = this.modelRankingRepo.createQueryBuilder('r')

    if (seasonId) {
      query.andWhere('r.seasonId = :seasonId', { seasonId })
    }

    query.orderBy('r.totalScore', 'DESC')
    query.addOrderBy('r.accuracyRate', 'DESC')

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { list, total, page, pageSize }
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
}
