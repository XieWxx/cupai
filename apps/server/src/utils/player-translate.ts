/**
 * 球员英文名 -> 中文名映射工具
 * 数据来源：apps/server/src/data/player-name-zh.json
 * 覆盖 ~400+ 名常见球员，对未命中球员返回原英文名
 *
 * 使用方式：
 *   import { getPlayerChineseName } from '../../utils/player-translate'
 *   const nameZh = getPlayerChineseName(bsPlayer.name)
 */
import playerZhMap from '../data/player-name-zh.json'

/** 英文名 -> 中文名 映射表 */
const ZH_MAP: Record<string, string> = playerZhMap as Record<string, string>

/**
 * 去除特殊引号并将多个空白字符压缩为单个空格
 * 用于兼容 BSD API 返回名中可能出现的特殊字符（如 ’ ‘ ‘ ’ 等）
 */
function normalizeName(name: string): string {
  return name
    .replace(/[''‘]/g, "'")
    .replace(/[""“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 获取球员中文名（如果映射表中有）
 *
 * 匹配策略（按优先级）：
 *   1. 精确匹配
 *   2. 归一化后匹配（处理特殊引号 / 多余空白）
 *   3. 去掉 Jr / Junior / Sr / Senior / II / III / IV 等后缀后匹配
 *   4. 全部失败时返回原英文名
 *
 * @param nameEn 球员英文名
 * @returns 中文名或原英文名
 */
export function getPlayerChineseName(nameEn: string | null | undefined): string {
  if (!nameEn) return ''
  // 1. 精确匹配
  if (ZH_MAP[nameEn]) return ZH_MAP[nameEn]
  // 2. 归一化后匹配
  const normalized = normalizeName(nameEn)
  if (normalized !== nameEn && ZH_MAP[normalized]) return ZH_MAP[normalized]
  // 3. 去掉常见后缀后匹配
  const stripped = normalized.replace(/\s+(Jr\.?|Junior|Sr\.?|Senior|II|III|IV)$/i, '').trim()
  if (stripped && stripped !== normalized && ZH_MAP[stripped]) return ZH_MAP[stripped]
  // 4. 全部失败：返回原英文名
  return nameEn
}

/**
 * 批量翻译球员名（保留未命中的原名）
 * @param names 英文名数组
 * @returns 与入参等长的中文名数组
 */
export function getPlayerChineseNames(names: (string | null | undefined)[]): string[] {
  return names.map(getPlayerChineseName)
}
