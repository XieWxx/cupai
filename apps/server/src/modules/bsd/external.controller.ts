import { Controller, Post, Query, Get, Param } from '@nestjs/common'
import { PlayerAvatarService } from '../../services/player-avatar.service'
import { WeatherService } from '../../services/weather.service'

/**
 * 外部数据接入控制器
 * - 球员头像（TheSportsDB）
 * - 比赛天气（Open-Meteo）
 */
@Controller('external')
export class ExternalController {
  constructor(
    private readonly avatarService: PlayerAvatarService,
    private readonly weatherService: WeatherService,
  ) {}

  /** 批量补充球员头像 */
  @Post('avatars/batch')
  async batchAvatars(@Query('limit') limit?: string) {
    const n = await this.avatarService.batchFillAvatars(limit ? parseInt(limit) : 30)
    return { filled: n }
  }

  /** 查询单个球员头像 */
  @Get('avatar/:nameEn')
  async getAvatar(@Param('nameEn') nameEn: string) {
    const url = await this.avatarService.fetchAvatar(nameEn)
    return { nameEn, avatar: url }
  }

  /** 查询指定经纬度/日期的天气 */
  @Get('weather')
  async getWeather(@Query('lat') lat: string, @Query('lon') lon: string, @Query('date') date: string) {
    return await this.weatherService.getWeatherAt(parseFloat(lat), parseFloat(lon), date)
  }
}
