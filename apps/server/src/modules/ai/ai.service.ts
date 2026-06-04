import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import axios, { type AxiosInstance } from 'axios'
import { UserAiConfigEntity } from './entities/user-ai-config.entity'
import { CreateAiConfigDto } from './dto/create-ai-config.dto'

/**
 * AI 中转服务
 * - 用户 API 配置管理
 * - AI 调用中转（密钥临时缓存、分级重试）
 * - 连接测试
 */
@Injectable()
export class AiService {
  constructor(
    @InjectRepository(UserAiConfigEntity)
    private readonly aiConfigRepo: Repository<UserAiConfigEntity>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 创建/更新用户 AI 配置
   * 注意：API Key 不存储在服务端，仅前端加密存储
   */
  async upsertConfig(userId: string, dto: CreateAiConfigDto) {
    const existing = await this.aiConfigRepo.findOne({
      where: { userId, modelName: dto.modelName },
    })

    if (existing) {
      await this.aiConfigRepo.update(existing.id, {
        apiEndpoint: dto.apiEndpoint,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        contextLength: dto.contextLength,
      })
      return this.aiConfigRepo.findOne({ where: { id: existing.id } })
    }

    const config = this.aiConfigRepo.create({ userId, ...dto })
    return this.aiConfigRepo.save(config)
  }

  /**
   * 获取用户所有 AI 配置
   */
  async getUserConfigs(userId: string) {
    return this.aiConfigRepo.find({ where: { userId } })
  }

  /**
   * 删除用户 AI 配置
   */
  async deleteConfig(userId: string, configId: string) {
    await this.aiConfigRepo.delete({ id: configId, userId })
  }

  /**
   * 测试 API 连通性
   * @param apiEndpoint API 地址
   * @param apiKey 用户临时传入的密钥（不存储）
   */
  async testConnection(apiEndpoint: string, apiKey: string) {
    try {
      const client = this.createAIClient(apiEndpoint, apiKey)
      const response = await client.post('/models', {}, { timeout: 10000 })
      return { connected: true, status: response.status }
    } catch (error) {
      const err = error as { response?: { status: number }; code?: string }
      return {
        connected: false,
        error: err.code === 'ECONNABORTED' ? '连接超时' : `连接失败: ${err.response?.status || err.code}`,
      }
    }
  }

  /**
   * 中转调用用户私有大模型
   * @param apiEndpoint API 地址
   * @param apiKey 临时密钥（用完即清）
   * @param payload 请求体（含 Prompt + 数据）
   */
  async proxyAiRequest(apiEndpoint: string, apiKey: string, payload: Record<string, unknown>) {
    const maxRetries = this.configService.get<number>('AI_MAX_RETRIES', 3)
    const timeout = this.configService.get<number>('AI_REQUEST_TIMEOUT', 60000)
    let lastError: Error | null = null

    // 分级重试机制
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const client = this.createAIClient(apiEndpoint, apiKey)
        const response = await client.post('/chat/completions', payload, { timeout })
        return response.data
      } catch (error) {
        lastError = error as Error
        // 非重试类错误直接抛出
        const axiosErr = error as { response?: { status: number } }
        if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
          throw new Error('API 密钥无效或无权限')
        }
        // 等待后重试
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
        }
      }
    }

    throw new Error(`AI 调用失败（已重试 ${maxRetries} 次）: ${lastError?.message}`)
  }

  /**
   * 创建 Axios 客户端
   */
  private createAIClient(apiEndpoint: string, apiKey: string): AxiosInstance {
    return axios.create({
      baseURL: apiEndpoint,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    })
  }
}
