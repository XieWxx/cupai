import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

/**
 * 天气服务
 * 数据源：Open-Meteo（https://open-meteo.com/）
 * 免费、无需 key、无需注册
 */
@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name)
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast'
  private cache = new Map<string, { data: WeatherInfo; at: number }>()
  private readonly cacheTtl = 30 * 60 * 1000

  constructor(private readonly http: HttpService) {}

  /**
   * 根据经纬度获取比赛时段的天气信息（含湿度）
   */
  async getWeatherAt(lat: number, lon: number, eventDate: string): Promise<WeatherInfo | null> {
    const cacheKey = `${lat},${lon},${eventDate}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.at < this.cacheTtl) {
      return cached.data
    }

    try {
      const date = new Date(eventDate)
      const dateStr = date.toISOString().slice(0, 10)
      const url = `${this.baseUrl}?latitude=${lat}&longitude=${lon}&hourly=relative_humidity_2m,temperature_2m,wind_speed_10m,weather_code&start_date=${dateStr}&end_date=${dateStr}&timezone=auto`
      const resp = await firstValueFrom(this.http.get(url))
      const data = resp.data
      if (!data?.hourly) return null

      const times: string[] = data.hourly.time ?? []
      const targetTime = Math.floor(date.getTime() / 1000)
      let bestIdx = 0
      let bestDiff = Infinity
      times.forEach((t, i) => {
        const diff = Math.abs(new Date(t).getTime() / 1000 - targetTime)
        if (diff < bestDiff) {
          bestDiff = diff
          bestIdx = i
        }
      })

      const weatherCode = data.hourly.weather_code?.[bestIdx] ?? 0
      const result: WeatherInfo = {
        humidity: data.hourly.relative_humidity_2m?.[bestIdx] ?? null,
        temperature: data.hourly.temperature_2m?.[bestIdx] ?? null,
        windSpeed: data.hourly.wind_speed_10m?.[bestIdx] ?? null,
        weatherCode,
        weatherDescription: this.describeCode(weatherCode),
        forecastAt: times[bestIdx] ?? null,
      }

      this.cache.set(cacheKey, { data: result, at: Date.now() })
      return result
    } catch (e) {
      this.logger.warn(`getWeatherAt ${lat},${lon} failed: ${(e as Error).message}`)
      return null
    }
  }

  private describeCode(code: number): string {
    if (code === 0) return '晴朗'
    if (code === 1) return '基本晴朗'
    if (code === 2) return '局部多云'
    if (code === 3) return '阴天'
    if (code >= 45 && code <= 48) return '雾'
    if (code >= 51 && code <= 55) return '毛毛雨'
    if (code >= 56 && code <= 57) return '冻雨'
    if (code >= 61 && code <= 65) return '雨'
    if (code >= 66 && code <= 67) return '冻雨'
    if (code >= 71 && code <= 75) return '雪'
    if (code === 77) return '米雪'
    if (code >= 80 && code <= 82) return '阵雨'
    if (code >= 85 && code <= 86) return '阵雪'
    if (code >= 95 && code <= 99) return '雷暴'
    return '未知'
  }
}

export interface WeatherInfo {
  /** 相对湿度（0-100 %） */
  humidity: number | null
  /** 温度（摄氏度） */
  temperature: number | null
  /** 风速（km/h） */
  windSpeed: number | null
  /** WMO 天气代码 */
  weatherCode: number
  /** 天气描述（中文） */
  weatherDescription: string
  /** 实际查询到的时间点（ISO） */
  forecastAt: string | null
}
