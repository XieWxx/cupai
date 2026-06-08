import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { BsPaginated, BsEvent, BsLeague, BsTeam, BsOdds, BsBestOdds, BsPrediction, BsStanding, BsEventDetail, BsIncidents, BsLineups, BsStats } from './bsd.interfaces'

/**
 * BSD (Bzzoiro Sports Data) API v2 客户端
 * 负责统一请求、鉴权、基础缓存
 *
 * 配置：
 *   BSD_BASE_URL    BSD API 根地址（默认 https://api.bzzoiro.com）
 *   BSD_API_KEY     BSD API Token（必需；缺失时本服务会降级为 no-op）
 *   BSD_ENABLED     是否启用（true/false，默认 true）
 */
@Injectable()
export class BsdcService {
  private readonly logger = new Logger(BsdcService.name)
  private readonly baseUrl: string
  private readonly apiToken: string
  private readonly enabled: boolean
  private readonly cacheTtl: number

  // 简易内存缓存
  private readonly memCache = new Map<string, { data: unknown; expiresAt: number }>()

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // BSD 根地址（不含 /api，调用方在 path 里自带路径前缀）
    this.baseUrl = (this.configService.get<string>('BSD_BASE_URL') ?? 'https://sports.bzzoiro.com').replace(/\/+$/, '')
    this.apiToken = this.configService.get<string>('BSD_API_KEY') ?? ''
    this.enabled = (this.configService.get<string>('BSD_ENABLED') ?? 'true') !== 'false'
    this.cacheTtl = 300

    if (!this.apiToken) {
      this.logger.warn(
        '⚠️  BSD_API_KEY 未配置 — BSD 数据同步将全部跳过。\n' +
        '   申请 Token: https://sports.bzzoiro.com\n' +
        '   配置方式: 在服务器 /opt/cupai/.env 中添加 BSD_API_KEY=你的token，然后重启容器:\n' +
        '   /opt/cupai/ops.sh rebuild server',
      )
    } else if (!this.enabled) {
      this.logger.warn('BSD_ENABLED=false — BSD 数据同步已禁用')
    } else {
      this.logger.log(`BSD 客户端已初始化 → ${this.baseUrl}`)
    }
  }

  /** BSD 服务是否可用（已配置 Token 且未禁用） */
  isAvailable(): boolean {
    return this.enabled && this.apiToken.length > 0
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Token ${this.apiToken}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * GET 请求 — 带简易内存缓存
   */
  private filterParams(params?: Record<string, string | number | boolean>): Record<string, string | number | boolean> | undefined {
    if (!params) return undefined
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
    )
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    // 尝试从内存缓存读取
    const cacheKey = `${path}${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
    const cached = this.memCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T
    }

    try {
      const fullUrl = `${this.baseUrl}${path}`
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.get(fullUrl, {
          headers: this.getHeaders(),
          params: this.filterParams(params),
          timeout: 15000,
        }),
      )

      // 写入缓存
      this.memCache.set(cacheKey, {
        data: response.data,
        expiresAt: Date.now() + this.cacheTtl * 1000,
      })

      return response.data
    } catch (error) {
      this.logger.error(`BSD API request failed: GET ${path}`, error?.message)
      throw error
    }
  }

  /**
   * 分页获取所有数据（自动翻页）
   * 兼容 BSD API 的两种分页风格：
   *   - next URL 自带参数（最常见）
   *   - page=N（少部分端点）
   * 任一种生效即停止翻页
   */
  async getAll<T>(path: string, params?: Record<string, string | number | boolean>, maxPages = 50): Promise<T[]> {
    const allResults: T[] = []
    const limit = 200
    let page = 1

    while (page <= maxPages) {
      const response = await this.get<BsPaginated<T>>(path, {
        ...params,
        limit,
        page,
      })

      allResults.push(...response.results)

      // 优先使用 BSD 返回的 next URL 判断是否还有下一页
      if (!response.next) break
      // 部分端点 next 存在但 results 为空
      if (response.results.length < limit) break

      page++
    }

    return allResults
  }
}
