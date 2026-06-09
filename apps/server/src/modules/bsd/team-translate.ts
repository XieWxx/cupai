/**
 * 球队英文名 -> 多语言名称映射工具
 * 数据来源：team-name-*.json（2026 世界杯参赛队伍）
 * 对未命中队伍返回 null，由调用方决定 fallback 策略
 *
 * 使用方式：
 *   import { translateTeamName, translateTeamNameTo } from './team-translate'
 *   const nameZh = translateTeamName(bsTeam.name) || bsTeam.name
 *   const nameJa = translateTeamNameTo(bsTeam.name, 'ja') || bsTeam.name
 */
import teamZhMap from './team-name-zh.json'
import teamJaMap from './team-name-ja.json'
import teamKoMap from './team-name-ko.json'
import teamEsMap from './team-name-es.json'
import teamFrMap from './team-name-fr.json'
import teamPtMap from './team-name-pt.json'
import teamArMap from './team-name-ar.json'

/** 英文名 -> 中文名 映射表 */
const ZH_MAP: Record<string, string> = teamZhMap as Record<string, string>

/** 多语言队名翻译映射表 */
const teamNameMaps: Record<string, Record<string, string>> = {
  zh: teamZhMap as Record<string, string>,
  ja: teamJaMap as Record<string, string>,
  ko: teamKoMap as Record<string, string>,
  es: teamEsMap as Record<string, string>,
  fr: teamFrMap as Record<string, string>,
  pt: teamPtMap as Record<string, string>,
  ar: teamArMap as Record<string, string>,
}

/**
 * 将球队英文名翻译为中文名
 *
 * 匹配策略（按优先级）：
 *   1. 精确匹配
 *   2. 忽略大小写匹配
 *   3. 全部失败时返回 null
 *
 * @param enName 球队英文名
 * @returns 中文名或 null
 */
export function translateTeamName(enName: string | null | undefined): string | null {
  if (!enName) return null
  // 1. 精确匹配
  if (ZH_MAP[enName]) return ZH_MAP[enName]
  // 2. 忽略大小写匹配
  const lower = enName.toLowerCase()
  for (const [key, value] of Object.entries(ZH_MAP)) {
    if (key.toLowerCase() === lower) return value
  }
  // 3. 未命中
  return null
}

/**
 * 翻译队伍名称到指定语言
 *
 * 匹配策略（按优先级）：
 *   1. 精确匹配
 *   2. 忽略大小写匹配
 *   3. 全部失败时返回 null
 *
 * @param enName 球队英文名
 * @param lang 目标语言代码（zh/ja/ko/es/fr/pt/ar）
 * @returns 翻译后的名称或 null
 */
export function translateTeamNameTo(enName: string | null | undefined, lang: string): string | null {
  if (!enName) return null
  const map = teamNameMaps[lang]
  if (!map) return null
  // 1. 精确匹配
  if (map[enName]) return map[enName]
  // 2. 忽略大小写匹配
  const lower = enName.toLowerCase()
  for (const [key, value] of Object.entries(map)) {
    if (key.toLowerCase() === lower) return value
  }
  // 3. 未命中
  return null
}
