/**
 * 国旗工具函数
 * 处理 countryCode 到 flag-icons 类名的映射
 */

/** 无效的 countryCode，不应渲染国旗 */
const INVALID_CODES = new Set(['INT', 'TBD', 'XXX', 'XX', ''])

/**
 * 获取 flag-icons 的 CSS 类名
 * @param code - ISO 3166-1 alpha-2 国家代码
 * @returns flag-icons 类名字符串，无效代码返回空字符串
 */
export function getFlagClass(code: string | undefined | null): string {
  if (!code || INVALID_CODES.has(code.toUpperCase())) return ''
  return `fi fi-${code.toLowerCase()}`
}

/**
 * 判断 countryCode 是否可以显示国旗
 * @param code - ISO 3166-1 alpha-2 国家代码
 * @returns 是否有效
 */
export function isValidFlagCode(code: string | undefined | null): boolean {
  return !!code && !INVALID_CODES.has(code.toUpperCase())
}
