import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import esES from './es-ES'
import frFR from './fr-FR'
import ptBR from './pt-BR'
import arSA from './ar-SA'
import jaJP from './ja-JP'
import koKR from './ko-KR'

// 支持的语言列表
const SUPPORTED_LOCALES = ['zh-CN', 'en-US', 'es-ES', 'fr-FR', 'pt-BR', 'ar-SA', 'ja-JP', 'ko-KR']

/**
 * 根据浏览器语言自动匹配最接近的支持语言
 * - 精确匹配：navigator.language 直接命中（如 'zh-CN'）
 * - 前缀匹配：navigator.language 取前两位匹配（如 'zh' -> 'zh-CN'）
 * - 兜底：'en-US'
 */
function detectBrowserLocale(): string {
  const browserLangs = navigator?.languages || [navigator?.language || '']
  for (const lang of browserLangs) {
    const lower = lang.toLowerCase()
    // 精确匹配
    const exact = SUPPORTED_LOCALES.find(l => l.toLowerCase() === lower)
    if (exact) return exact
    // 前缀匹配（如 'zh-TW' -> 'zh-CN'，'en-GB' -> 'en-US'）
    const prefix = lower.split('-')[0]
    const prefixMatch = SUPPORTED_LOCALES.find(l => l.toLowerCase().startsWith(prefix))
    if (prefixMatch) return prefixMatch
  }
  return 'en-US'
}

// 优先级：用户手动选择 > 浏览器语言自动检测 > 默认中文
const savedLocale = localStorage.getItem('locale')
const initialLocale = savedLocale || detectBrowserLocale()

// 国际化配置 - 支持 8 种语言（覆盖世界杯主要参赛国和地区）
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: initialLocale,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'es-ES': esES,
    'fr-FR': frFR,
    'pt-BR': ptBR,
    'ar-SA': arSA,
    'ja-JP': jaJP,
    'ko-KR': koKR,
  },
})

export default i18n
