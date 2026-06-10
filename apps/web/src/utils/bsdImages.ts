/**
 * BSD Static Data API 图片 URL 工具函数
 * 文档：https://sports.bzzoiro.com/docs/static-data/
 *
 * 提供球队 Logo、球员头像、场馆照片等图片 URL 拼接
 * 无需认证，直接拼接 ID 即可访问
 */

/** BSD Static Data API 基础域名 */
const BSD_STATIC_BASE = 'https://sports.bzzoiro.com'

/**
 * 获取球队 Logo URL
 * @param bsTeamId BSD 球队 ID（TeamEntity.bsTeamId）
 * @param options 可选参数
 * @returns 球队 Logo 图片 URL，无 ID 时返回空字符串
 */
export function getTeamLogoUrl(
  bsTeamId: number | null | undefined,
  options?: { bg?: string; size?: number }
): string {
  if (!bsTeamId) return ''
  const params = new URLSearchParams()
  if (options?.bg) params.set('bg', options.bg)
  if (options?.size) params.set('size', String(options.size))
  const qs = params.toString()
  return `${BSD_STATIC_BASE}/img/team/${bsTeamId}/${qs ? `?${qs}` : ''}`
}

/**
 * 获取球员头像 URL
 * @param bsPlayerId BSD 球员 ID（PlayerEntity.bsdPlayerId / EventLineupEntity.bsPlayerId）
 * @param options 可选参数
 * @returns 球员头像图片 URL，无 ID 时返回空字符串
 */
export function getPlayerAvatarUrl(
  bsPlayerId: number | null | undefined,
  options?: { size?: number }
): string {
  if (!bsPlayerId) return ''
  const params = new URLSearchParams()
  if (options?.size) params.set('size', String(options.size))
  const qs = params.toString()
  return `${BSD_STATIC_BASE}/img/player/${bsPlayerId}/${qs ? `?${qs}` : ''}`
}

/**
 * 获取场馆照片 URL
 * @param venueId BSD 场馆 ID（MatchEntity.venueId）
 * @param options 可选参数
 * @returns 场馆照片 URL，无 ID 时返回空字符串
 */
export function getVenueImageUrl(
  venueId: number | null | undefined,
  options?: { size?: number }
): string {
  if (!venueId) return ''
  const params = new URLSearchParams()
  if (options?.size) params.set('size', String(options.size))
  const qs = params.toString()
  return `${BSD_STATIC_BASE}/img/venue/${venueId}/${qs ? `?${qs}` : ''}`
}

/**
 * 获取联赛 Logo URL
 * @param leagueId BSD 联赛 ID
 * @returns 联赛 Logo URL，无 ID 时返回空字符串
 */
export function getLeagueLogoUrl(leagueId: number | null | undefined): string {
  if (!leagueId) return ''
  return `${BSD_STATIC_BASE}/img/league/${leagueId}/`
}
