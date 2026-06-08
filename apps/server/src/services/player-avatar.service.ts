import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { PlayerEntity } from '../modules/match/entities/player.entity'

/**
 * 球员头像服务
 * 数据源：TheSportsDB（https://www.thesportsdb.com/api/）
 * 免费 API key：3（开发者公开测试 key，仅供非商业使用）
 * 接口：searchplayers.php?p=<name> → 返回 strThumb/strCutout
 */
@Injectable()
export class PlayerAvatarService {
  private readonly logger = new Logger(PlayerAvatarService.name)
  private readonly baseUrl = 'https://www.thesportsdb.com/api/v1/json/3'
  private cache = new Map<string, string>()

  constructor(
    private readonly http: HttpService,
    @InjectRepository(PlayerEntity) private readonly playerRepo: Repository<PlayerEntity>,
  ) {}

  /**
   * 根据球员英文名查询头像 URL
   * 优先使用本地缓存，未命中则请求 TheSportsDB
   */
  async fetchAvatar(nameEn: string): Promise<string | null> {
    if (!nameEn) return null
    if (this.cache.has(nameEn)) return this.cache.get(nameEn)!

    try {
      const url = `${this.baseUrl}/searchplayers.php?p=${encodeURIComponent(nameEn)}`
      const resp = await firstValueFrom(this.http.get(url))
      const players = resp.data?.player ?? []
      if (Array.isArray(players) && players.length > 0) {
        const first = players[0]
        const avatar = first.strCutout || first.strThumb || first.strRender || null
        if (avatar) {
          this.cache.set(nameEn, avatar)
          return avatar
        }
      }
      this.cache.set(nameEn, '')
      return null
    } catch (e) {
      this.logger.warn(`fetchAvatar ${nameEn} failed: ${(e as Error).message}`)
      return null
    }
  }

  /**
   * 批量为球员补充头像
   * 仅处理 nameEn 非空且 avatar 字段为空的球员
   */
  async batchFillAvatars(limit = 30): Promise<number> {
    const players = await this.playerRepo
      .createQueryBuilder('p')
      .where('p.name_en IS NOT NULL')
      .andWhere('p.avatar IS NULL OR p.avatar = \'\'')
      .limit(limit)
      .getMany()

    let filled = 0
    for (const p of players) {
      const url = await this.fetchAvatar(p.nameEn)
      if (url) {
        p.avatar = url
        await this.playerRepo.save(p)
        filled++
      }
    }
    this.logger.log(`batchFillAvatars: ${filled}/${players.length} filled`)
    return filled
  }
}
