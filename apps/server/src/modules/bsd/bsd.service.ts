import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { BsPaginated, BsEvent, BsLeague, BsTeam, BsOdds, BsBestOdds, BsPrediction, BsStanding, BsEventDetail, BsIncidents, BsLineups, BsStats } from './bsd.interfaces'

/**
 * BSD (Bzzoiro Sports Data) API v2 客户端
 * 负责统一请求、鉴权、基础缓存
 */
@Injectable()
export class BsdcService {
  private readonly logger = new Logger(BsdcService.name)
  private readonly baseUrl: string
  private readonly apiToken: string
  private readonly cacheTtl: number

  // 简易内存缓存
  private readonly memCache = new Map<string, { data: unknown; expiresAt: number }>()

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BSD_BASE_URL')!
    this.apiToken = this.configService.get<string>('BSD_API_KEY')!
    this.cacheTtl = 300
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
   */
  async getAll<T>(path: string, params?: Record<string, string | number | boolean>, maxPages = 50): Promise<T[]> {
    const allResults: T[] = []
    let offset = 0
    const limit = 200
    let page = 0

    while (page < maxPages) {
      const response = await this.get<BsPaginated<T>>(path, {
        ...params,
        limit,
        offset,
      })

      allResults.push(...response.results)

      if (!response.next || response.results.length < limit) {
        break
      }

      offset += limit
      page++
    }

    return allResults
  }
}
