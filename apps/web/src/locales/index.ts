import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import esES from './es-ES'
import frFR from './fr-FR'
import ptBR from './pt-BR'
import arSA from './ar-SA'
import jaJP from './ja-JP'
import koKR from './ko-KR'

// 国际化配置 - 支持 8 种语言（覆盖世界杯主要参赛国和地区）
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: localStorage.getItem('locale') || 'zh-CN', // 默认中文
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
