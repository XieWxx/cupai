/**
 * Agent 平台识别工具
 *
 * 职责：
 * 1. 根据 AI 配置的 apiEndpoint 域名识别 Agent 平台（OpenAI / Anthropic / DeepSeek ...）
 * 2. 根据 modelName 识别大模型系列（GPT / Claude / Gemini ...）
 * 3. 提供统一的展示资源（key、name、nameEn、color、iconSvg、字母 badge）
 *
 * 设计原则：
 * - 零运行时依赖：内联 SVG path，不引入任何第三方 icon 库
 * - 离线降级：识别失败时返回 unknown 平台（首字母 badge fallback）
 * - 纯函数：方便在模板和 setup 中复用
 */

/** Agent 平台 / 大模型展示元数据 */
export interface AgentPlatform {
  /** 唯一 key（用于匹配与 i18n 兜底文案） */
  key: string
  /** 中文名（前端默认展示） */
  name: string
  /** 英文名 */
  nameEn: string
  /** 主题色（用于 badge / 进度条） */
  color: string
  /**
   * 内联 SVG path（24x24 viewBox）
   * 模板中通过 v-html 注入至 <svg viewBox="0 0 24 24"><path d="..."/></svg>
   */
  iconSvg: string
  /** 首字母 badge 用（fallback） */
  letter: string
  /**
   * LobeHub Icons 对应的 icon ID
   * 用于生成 CDN SVG URL：https://unpkg.com/@lobehub/icons-static-svg@latest/icons/{id}-color.svg
   * 完整列表：https://icons.lobehub.com
   */
  lobeIconId?: string
}

/** 根据 LobeHub icon ID 生成 CDN SVG URL */
export function getLobeIconUrl(lobeIconId: string): string {
  return `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${lobeIconId}-color.svg`
}

/* ============================================================
 *  内联 SVG path 库（24x24，Simple Icons 风格简化）
 *  仅用于"圆形 badge 上的白色 logo"，已尽可能接近官方 logo
 * ============================================================ */
const ICON_OPENAI =
  'M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.787a4.495 4.495 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.685zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0l-5.843 3.369V7.012a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.682 4.66zM9.776 14.628l-2.02-1.164a.08.08 0 0 1-.038-.057V7.829a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z'
const ICON_ANTHROPIC =
  'M12 2L2 22h4.5l1.5-4h6l1.5 4H20L12 2zm-2.5 12L12 8l2.5 6h-5z'
const ICON_GOOGLE =
  'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
const ICON_DEEPSEEK =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H7v-4h4v4zm0-6H7V6h4v4zm6 6h-4v-4h4v4zm0-6h-4V6h4v4z'
const ICON_QWEN =
  'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z'
const ICON_BAIDU =
  'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 14.5c-2.5 0-4.5-2-4.5-4.5S8.5 7.5 11 7.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5z'
const ICON_XFYUN =
  'M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4zm-1 14H8l3-7 3 7h-3z'
const ICON_ZHIPU =
  'M3 3h18v18H3V3zm5 5v8h2v-3h2v3h2V8h-2v3h-2V8H8zm10 0h-2v8h4v-2h-2V8z'
const ICON_MOONSHOT =
  'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'
const ICON_COHERE =
  'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-5 9c0-1.1.9-2 2-2h2v2H9c-.6 0-1-.4-1-1zm10 0c0 .6-.4 1-1 1h-2v-2h2c1.1 0 1 .9 1 1zm-5 5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z'

/* ============================================================
 *  平台字典（按域名子串匹配，按顺序匹配）
 * ============================================================ */
const PLATFORM_RULES: Array<{ key: string; match: (host: string) => boolean; meta: AgentPlatform }> = [
  {
    key: 'openai',
    match: (h) => /openai\.com/.test(h),
    meta: {
      key: 'openai',
      name: 'OpenAI',
      nameEn: 'OpenAI',
      color: '#10a37f',
      iconSvg: ICON_OPENAI,
      letter: 'O',
      lobeIconId: 'openai',
    },
  },
  {
    key: 'anthropic',
    match: (h) => /anthropic\.com/.test(h),
    meta: {
      key: 'anthropic',
      name: 'Anthropic',
      nameEn: 'Anthropic',
      color: '#d97706',
      iconSvg: ICON_ANTHROPIC,
      letter: 'A',
      lobeIconId: 'anthropic',
    },
  },
  {
    key: 'gemini',
    match: (h) => /googleapis\.com|gemini|google\.com/.test(h),
    meta: {
      key: 'gemini',
      name: 'Google Gemini',
      nameEn: 'Google Gemini',
      color: '#4285f4',
      iconSvg: ICON_GOOGLE,
      letter: 'G',
      lobeIconId: 'google',
    },
  },
  {
    key: 'deepseek',
    match: (h) => /deepseek\.com/.test(h),
    meta: {
      key: 'deepseek',
      name: 'DeepSeek',
      nameEn: 'DeepSeek',
      color: '#0066cc',
      iconSvg: ICON_DEEPSEEK,
      letter: 'D',
      lobeIconId: 'deepseek',
    },
  },
  {
    key: 'qwen',
    match: (h) => /dashscope|aliyuncs\.com|qwen/.test(h),
    meta: {
      key: 'qwen',
      name: '通义千问',
      nameEn: 'Qwen',
      color: '#615ced',
      iconSvg: ICON_QWEN,
      letter: 'Q',
      lobeIconId: 'qwen',
    },
  },
  {
    key: 'ernie',
    match: (h) => /qianfan|baidubce\.com|baidu/.test(h),
    meta: {
      key: 'ernie',
      name: '文心一言',
      nameEn: 'ERNIE Bot',
      color: '#2932e1',
      iconSvg: ICON_BAIDU,
      letter: 'E',
      lobeIconId: 'baidu',
    },
  },
  {
    key: 'spark',
    match: (h) => /spark-api|xf-yun\.com|iflytek/.test(h),
    meta: {
      key: 'spark',
      name: '讯飞星火',
      nameEn: 'iFlytek Spark',
      color: '#1c64f2',
      iconSvg: ICON_XFYUN,
      letter: 'S',
      lobeIconId: 'iflytek',
    },
  },
  {
    key: 'glm',
    match: (h) => /bigmodel\.cn|zhipu/.test(h),
    meta: {
      key: 'glm',
      name: '智谱清言',
      nameEn: 'Zhipu GLM',
      color: '#3862ec',
      iconSvg: ICON_ZHIPU,
      letter: 'Z',
      lobeIconId: 'zhipu',
    },
  },
  {
    key: 'moonshot',
    match: (h) => /moonshot\.cn|kimi/.test(h),
    meta: {
      key: 'moonshot',
      name: 'Moonshot',
      nameEn: 'Moonshot (Kimi)',
      color: '#000000',
      iconSvg: ICON_MOONSHOT,
      letter: 'M',
      lobeIconId: 'moonshot',
    },
  },
  {
    key: 'cohere',
    match: (h) => /cohere\.ai/.test(h),
    meta: {
      key: 'cohere',
      name: 'Cohere',
      nameEn: 'Cohere',
      color: '#ff5c4d',
      iconSvg: ICON_COHERE,
      letter: 'C',
      lobeIconId: 'cohere',
    },
  },
  {
    key: 'codex-cli',
    match: (h) => /codex-cli|codex/i.test(h),
    meta: {
      key: 'codex-cli',
      name: 'Codex CLI',
      nameEn: 'Codex CLI',
      color: '#1a7f37',
      iconSvg: '',
      letter: 'C',
      lobeIconId: 'openai',
    },
  },
  {
    key: 'cursor',
    match: (h) => /cursor/i.test(h),
    meta: {
      key: 'cursor',
      name: 'Cursor',
      nameEn: 'Cursor',
      color: '#6366f1',
      iconSvg: '',
      letter: 'C',
      lobeIconId: 'cursor',
    },
  },
  {
    key: 'windsurf',
    match: (h) => /windsurf/i.test(h),
    meta: {
      key: 'windsurf',
      name: 'Windsurf',
      nameEn: 'Windsurf',
      color: '#0ea5e9',
      iconSvg: '',
      letter: 'W',
      lobeIconId: 'windsurf',
    },
  },
  {
    key: 'cline',
    match: (h) => /cline/i.test(h),
    meta: {
      key: 'cline',
      name: 'Cline',
      nameEn: 'Cline',
      color: '#8b5cf6',
      iconSvg: '',
      letter: 'C',
      lobeIconId: 'cline',
    },
  },
  {
    key: 'trae',
    match: (h) => /trae/i.test(h),
    meta: {
      key: 'trae',
      name: 'Trae',
      nameEn: 'Trae',
      color: '#f97316',
      iconSvg: '',
      letter: 'T',
      lobeIconId: 'trae',
    },
  },
  {
    key: 'workbuddy',
    match: (h) => /workbuddy/i.test(h),
    meta: {
      key: 'workbuddy',
      name: 'WorkBuddy',
      nameEn: 'WorkBuddy',
      color: '#10b981',
      iconSvg: '',
      letter: 'W',
    },
  },
]

/* ============================================================
 *  模型字典（按 modelName 前缀/包含匹配）
 * ============================================================ */
const MODEL_RULES: Array<{ key: string; match: (name: string) => boolean; meta: AgentPlatform }> = [
  {
    key: 'gpt',
    match: (n) => /^(gpt-|o1-|o3-|chatgpt)/i.test(n),
    meta: {
      key: 'gpt',
      name: 'GPT',
      nameEn: 'GPT',
      color: '#10a37f',
      iconSvg: ICON_OPENAI,
      letter: 'G',
      lobeIconId: 'openai',
    },
  },
  {
    key: 'claude',
    match: (n) => /^claude-/i.test(n),
    meta: {
      key: 'claude',
      name: 'Claude',
      nameEn: 'Claude',
      color: '#d97706',
      iconSvg: ICON_ANTHROPIC,
      letter: 'C',
      lobeIconId: 'anthropic',
    },
  },
  {
    key: 'gemini',
    match: (n) => /gemini-/i.test(n),
    meta: {
      key: 'gemini',
      name: 'Gemini',
      nameEn: 'Gemini',
      color: '#4285f4',
      iconSvg: ICON_GOOGLE,
      letter: 'G',
      lobeIconId: 'google',
    },
  },
  {
    key: 'deepseek',
    match: (n) => /deepseek-/i.test(n),
    meta: {
      key: 'deepseek',
      name: 'DeepSeek',
      nameEn: 'DeepSeek',
      color: '#0066cc',
      iconSvg: ICON_DEEPSEEK,
      letter: 'D',
      lobeIconId: 'deepseek',
    },
  },
  {
    key: 'qwen',
    match: (n) => /qwen|qwq/i.test(n),
    meta: {
      key: 'qwen',
      name: '通义千问',
      nameEn: 'Qwen',
      color: '#615ced',
      iconSvg: ICON_QWEN,
      letter: 'Q',
      lobeIconId: 'qwen',
    },
  },
  {
    key: 'ernie',
    match: (n) => /ernie-/i.test(n),
    meta: {
      key: 'ernie',
      name: '文心一言',
      nameEn: 'ERNIE',
      color: '#2932e1',
      iconSvg: ICON_BAIDU,
      letter: 'E',
      lobeIconId: 'baidu',
    },
  },
  {
    key: 'spark',
    match: (n) => /spark|iflytek/i.test(n),
    meta: {
      key: 'spark',
      name: '讯飞星火',
      nameEn: 'Spark',
      color: '#1c64f2',
      iconSvg: ICON_XFYUN,
      letter: 'S',
      lobeIconId: 'iflytek',
    },
  },
  {
    key: 'glm',
    match: (n) => /glm-|chatglm/i.test(n),
    meta: {
      key: 'glm',
      name: '智谱清言',
      nameEn: 'GLM',
      color: '#3862ec',
      iconSvg: ICON_ZHIPU,
      letter: 'Z',
      lobeIconId: 'zhipu',
    },
  },
  {
    key: 'moonshot',
    match: (n) => /moonshot-|kimi/i.test(n),
    meta: {
      key: 'moonshot',
      name: 'Moonshot',
      nameEn: 'Moonshot',
      color: '#000000',
      iconSvg: ICON_MOONSHOT,
      letter: 'M',
      lobeIconId: 'moonshot',
    },
  },
]

/* ============================================================
 *  未知兜底
 * ============================================================ */
const UNKNOWN_PLATFORM: AgentPlatform = {
  key: 'unknown',
  name: '未配置',
  nameEn: 'Unknown',
  color: '#94a3b8',
  iconSvg: '',
  letter: '?',
}

/**
 * 提取 URL 主机名（host），支持带/不带协议前缀
 */
function extractHost(url: string): string {
  if (!url) return ''
  let s = url.trim()
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s
  try {
    return new URL(s).host.toLowerCase()
  } catch {
    // 退化：用第一个 / 之前的部分
    return s.split('/')[0].replace(/^https?:\/\//i, '').toLowerCase()
  }
}

/**
 * 根据 API endpoint URL 域名或平台名称识别 Agent 平台
 * @param apiEndpoint 形如 https://api.openai.com/v1 或平台名称（如 codex-cli、cursor）
 */
export function detectPlatform(apiEndpoint: string): AgentPlatform {
  if (!apiEndpoint) return { ...UNKNOWN_PLATFORM }
  // 判断是否为 URL（包含 . 或 ://）
  const isUrl = apiEndpoint.includes('.') || apiEndpoint.includes('://')
  if (isUrl) {
    const host = extractHost(apiEndpoint)
    for (const rule of PLATFORM_RULES) {
      if (rule.match(host)) return rule.meta
    }
    return { ...UNKNOWN_PLATFORM, letter: host.charAt(0).toUpperCase() || '?' }
  }
  // 非 URL：直接作为平台名匹配 PLATFORM_RULES
  for (const rule of PLATFORM_RULES) {
    if (rule.match(apiEndpoint)) return rule.meta
  }
  // 兜底：用输入值作为平台名
  return {
    ...UNKNOWN_PLATFORM,
    name: apiEndpoint,
    nameEn: apiEndpoint,
    letter: apiEndpoint.charAt(0).toUpperCase() || '?',
  }
}

/**
 * 根据 modelName 识别大模型
 * @param modelName 形如 gpt-4o、claude-3-5-sonnet、deepseek-chat
 */
export function detectModel(modelName: string): AgentPlatform {
  if (!modelName) return { ...UNKNOWN_PLATFORM }
  for (const rule of MODEL_RULES) {
    if (rule.match(modelName)) return rule.meta
  }
  // 兜底：把首字母大写作为字母 badge
  return {
    ...UNKNOWN_PLATFORM,
    name: modelName,
    nameEn: modelName,
    letter: modelName.charAt(0).toUpperCase() || '?',
  }
}

/**
 * 把 ISO 3166-1 alpha-2 国家代码转 flag-icons class
 * 例如 US -> 'us', CN -> 'cn'
 */
export function regionToFlagClass(region: string | null | undefined): string {
  if (!region) return 'xx'
  return region.toLowerCase().slice(0, 2)
}
