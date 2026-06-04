/**
 * CupAI 公共工具函数
 * 前后端共享的工具方法
 */

// ============ 算法模块 ============
export * from './algorithms'

// ============ 时间工具 ============

/**
 * 多时区时间格式化
 * @param date 日期对象或时间戳
 * @param timezone 目标时区（如 'Asia/Shanghai'）
 * @returns 格式化后的时间字符串
 */
export function formatTimezoneDate(
  date: Date | string | number,
  timezone: string = 'Asia/Shanghai',
): string {
  const d = new Date(date)
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d)
  } catch {
    return d.toLocaleString('zh-CN')
  }
}
