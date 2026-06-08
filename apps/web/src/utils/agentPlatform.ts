/**
 * Agent 平台识别工具
 *
 * 职责：
 * 1. 根据 AI 配置的 apiEndpoint 域名识别 Agent 平台（OpenAI / Anthropic / DeepSeek ...）
 * 2. 根据 modelName 识别大模型系列（GPT / Claude / Gemini ...）
 * 3. 提供统一的展示资源（key、name、nameEn、color、iconUrl、字母 badge）
 *
 * 设计原则：
 * - 三级降级：LobeHub CDN → 本地 SVG（@lobehub/icons-static-svg） → 字母 badge
 * - 离线降级：识别失败时返回 unknown 平台（首字母 badge fallback）
 * - 纯函数：方便在模板和 setup 中复用
 */

/* ============================================================
 *  本地 SVG 资源（通过 Vite ?url import，打包后为本地文件）
 *  来源：@lobehub/icons-static-svg（MIT 协议）
 * ============================================================ */
import ICON_URL_OPENAI from '@lobehub/icons-static-svg/icons/openai.svg?url'
import ICON_URL_ANTHROPIC from '@lobehub/icons-static-svg/icons/anthropic.svg?url'
import ICON_URL_GOOGLE from '@lobehub/icons-static-svg/icons/google.svg?url'
import ICON_URL_DEEPSEEK from '@lobehub/icons-static-svg/icons/deepseek.svg?url'
import ICON_URL_QWEN from '@lobehub/icons-static-svg/icons/qwen.svg?url'
import ICON_URL_BAIDU from '@lobehub/icons-static-svg/icons/baidu.svg?url'
import ICON_URL_SPARK from '@lobehub/icons-static-svg/icons/spark.svg?url'
import ICON_URL_ZHIPU from '@lobehub/icons-static-svg/icons/zhipu.svg?url'
import ICON_URL_MOONSHOT from '@lobehub/icons-static-svg/icons/moonshot.svg?url'
import ICON_URL_COHERE from '@lobehub/icons-static-svg/icons/cohere.svg?url'
import ICON_URL_CURSOR from '@lobehub/icons-static-svg/icons/cursor.svg?url'
import ICON_URL_WINDSURF from '@lobehub/icons-static-svg/icons/windsurf.svg?url'
import ICON_URL_CLINE from '@lobehub/icons-static-svg/icons/cline.svg?url'
import ICON_URL_TRAE from '@lobehub/icons-static-svg/icons/trae.svg?url'
import ICON_URL_DOUBAO from '@lobehub/icons-static-svg/icons/doubao.svg?url'
import ICON_URL_HUNYUAN from '@lobehub/icons-static-svg/icons/hunyuan.svg?url'
import ICON_URL_STEPFUN from '@lobehub/icons-static-svg/icons/stepfun.svg?url'
import ICON_URL_YI from '@lobehub/icons-static-svg/icons/yi.svg?url'
import ICON_URL_META from '@lobehub/icons-static-svg/icons/meta.svg?url'
import ICON_URL_MISTRAL from '@lobehub/icons-static-svg/icons/mistral.svg?url'
import ICON_URL_BAICHUAN from '@lobehub/icons-static-svg/icons/baichuan.svg?url'

/** Agent 平台 / 大模型展示元数据 */
export interface AgentPlatform {
  /** 唯一 key（用于匹配与 i18n 兜底文案） */
  key: string
  /** i18n key（格式为 platform.xxx，通过 t() 解析为本地化名称） */
  name: string
  /** 英文名（非 i18n 环境的回退） */
  nameEn: string
  /** 主题色（用于 badge / 进度条） */
  color: string
  /**
   * 本地 SVG 文件 URL（通过 Vite ?url import）
   * 来自 @lobehub/icons-static-svg，打包后为本地资源
   */
  iconUrl: string
  /** 首字母 badge 用（fallback） */
  letter: string
}

/* ============================================================
 *  平台字典（按域名子串匹配，按顺序匹配）
 * ============================================================ */
const PLATFORM_RULES: Array<{ key: string; match: (host: string) => boolean; meta: AgentPlatform }> = [
  {
    key: 'openai',
    match: (h) => /openai\.com/.test(h),
    meta: {
      key: 'openai',
      name: 'platform.openai',
      nameEn: 'OpenAI',
      color: '#10a37f',
      iconUrl: ICON_URL_OPENAI,
      letter: 'O',

    },
  },
  {
    key: 'anthropic',
    match: (h) => /anthropic\.com/.test(h),
    meta: {
      key: 'anthropic',
      name: 'platform.anthropic',
      nameEn: 'Anthropic',
      color: '#d97706',
      iconUrl: ICON_URL_ANTHROPIC,
      letter: 'A',

    },
  },
  {
    key: 'gemini',
    match: (h) => /googleapis\.com|gemini|google\.com/.test(h),
    meta: {
      key: 'gemini',
      name: 'platform.gemini',
      nameEn: 'Google Gemini',
      color: '#4285f4',
      iconUrl: ICON_URL_GOOGLE,
      letter: 'G',
    },
  },
  {
    key: 'deepseek',
    match: (h) => /deepseek\.com/.test(h),
    meta: {
      key: 'deepseek',
      name: 'platform.deepseek',
      nameEn: 'DeepSeek',
      color: '#0066cc',
      iconUrl: ICON_URL_DEEPSEEK,
      letter: 'D',
    },
  },
  {
    key: 'qwen',
    match: (h) => /dashscope|aliyuncs\.com|qwen/.test(h),
    meta: {
      key: 'qwen',
      name: 'platform.qwen',
      nameEn: 'Qwen',
      color: '#615ced',
      iconUrl: ICON_URL_QWEN,
      letter: 'Q',
    },
  },
  {
    key: 'ernie',
    match: (h) => /qianfan|baidubce\.com|baidu/.test(h),
    meta: {
      key: 'ernie',
      name: 'platform.ernie',
      nameEn: 'ERNIE Bot',
      color: '#2932e1',
      iconUrl: ICON_URL_BAIDU,
      letter: 'E',
    },
  },
  {
    key: 'spark',
    match: (h) => /spark-api|xf-yun\.com|iflytek/.test(h),
    meta: {
      key: 'spark',
      name: 'platform.spark',
      nameEn: 'iFlytek Spark',
      color: '#1c64f2',
      iconUrl: ICON_URL_SPARK,
      letter: 'S',
    },
  },
  {
    key: 'glm',
    match: (h) => /bigmodel\.cn|zhipu/.test(h),
    meta: {
      key: 'glm',
      name: 'platform.glm',
      nameEn: 'Zhipu GLM',
      color: '#3862ec',
      iconUrl: ICON_URL_ZHIPU,
      letter: 'Z',
    },
  },
  {
    key: 'moonshot',
    match: (h) => /moonshot\.cn|kimi/.test(h),
    meta: {
      key: 'moonshot',
      name: 'platform.moonshot',
      nameEn: 'Moonshot (Kimi)',
      color: '#000000',
      iconUrl: ICON_URL_MOONSHOT,
      letter: 'M',
    },
  },
  {
    key: 'cohere',
    match: (h) => /cohere\.ai/.test(h),
    meta: {
      key: 'cohere',
      name: 'platform.cohere',
      nameEn: 'Cohere',
      color: '#ff5c4d',
      iconUrl: ICON_URL_COHERE,
      letter: 'C',
    },
  },
  {
    key: 'codex-cli',
    match: (h) => /codex-cli|codex/i.test(h),
    meta: {
      key: 'codex-cli',
      name: 'platform.codexCli',
      nameEn: 'Codex CLI',
      color: '#1a7f37',
      iconUrl: ICON_URL_OPENAI,
      letter: 'C',

    },
  },
  {
    key: 'cursor',
    match: (h) => /cursor/i.test(h),
    meta: {
      key: 'cursor',
      name: 'platform.cursor',
      nameEn: 'Cursor',
      color: '#6366f1',
      iconUrl: ICON_URL_CURSOR,
      letter: 'C',
    },
  },
  {
    key: 'windsurf',
    match: (h) => /windsurf/i.test(h),
    meta: {
      key: 'windsurf',
      name: 'platform.windsurf',
      nameEn: 'Windsurf',
      color: '#0ea5e9',
      iconUrl: ICON_URL_WINDSURF,
      letter: 'W',
    },
  },
  {
    key: 'cline',
    match: (h) => /cline/i.test(h),
    meta: {
      key: 'cline',
      name: 'platform.cline',
      nameEn: 'Cline',
      color: '#8b5cf6',
      iconUrl: ICON_URL_CLINE,
      letter: 'C',
    },
  },
  {
    key: 'trae',
    match: (h) => /trae/i.test(h),
    meta: {
      key: 'trae',
      name: 'platform.trae',
      nameEn: 'Trae',
      color: '#f97316',
      iconUrl: ICON_URL_TRAE,
      letter: 'T',
    },
  },
  {
    key: 'workbuddy',
    match: (h) => /workbuddy/i.test(h),
    meta: {
      key: 'workbuddy',
      name: 'platform.workbuddy',
      nameEn: 'WorkBuddy',
      color: '#10b981',
      iconUrl: '',
      letter: 'W',
    },
  },
  {
    key: 'agnes',
    match: (h) => /agnes/i.test(h),
    meta: {
      key: 'agnes',
      name: 'platform.agnes',
      nameEn: 'Agnes',
      color: '#8b5cf6',
      iconUrl: '',
      letter: 'A',
    },
  },
  {
    key: 'coze',
    match: (h) => /coze/i.test(h),
    meta: {
      key: 'coze',
      name: 'platform.coze',
      nameEn: 'Coze',
      color: '#f97316',
      iconUrl: '',
      letter: 'C',
    },
  },
  {
    key: 'doubao',
    match: (h) => /doubao|volcengine|bytedance/i.test(h),
    meta: {
      key: 'doubao',
      name: 'platform.doubao',
      nameEn: 'Doubao',
      color: '#0064ff',
      iconUrl: ICON_URL_DOUBAO,
      letter: 'D',
    },
  },
  {
    key: 'hunyuan',
    match: (h) => /hunyuan|tencent/i.test(h),
    meta: {
      key: 'hunyuan',
      name: 'platform.hunyuan',
      nameEn: 'Hunyuan',
      color: '#007bff',
      iconUrl: ICON_URL_HUNYUAN,
      letter: 'H',
    },
  },
  {
    key: 'stepfun',
    match: (h) => /stepfun|step/i.test(h),
    meta: {
      key: 'stepfun',
      name: 'platform.stepfun',
      nameEn: 'StepFun',
      color: '#5e3ec4',
      iconUrl: ICON_URL_STEPFUN,
      letter: 'S',
    },
  },
  {
    key: 'yi',
    match: (h) => /\byi-|01\.ai|yi\b/i.test(h),
    meta: {
      key: 'yi',
      name: 'platform.yi',
      nameEn: 'Yi',
      color: '#1a1a2e',
      iconUrl: ICON_URL_YI,
      letter: 'Y',
    },
  },
  {
    key: 'meta',
    match: (h) => /\bllama\b|meta\.com|meta-llama/i.test(h),
    meta: {
      key: 'meta',
      name: 'platform.meta',
      nameEn: 'Meta Llama',
      color: '#0467df',
      iconUrl: ICON_URL_META,
      letter: 'L',
    },
  },
  {
    key: 'mistral',
    match: (h) => /mistral/i.test(h),
    meta: {
      key: 'mistral',
      name: 'platform.mistral',
      nameEn: 'Mistral',
      color: '#ff7000',
      iconUrl: ICON_URL_MISTRAL,
      letter: 'M',
    },
  },
  {
    key: 'baichuan',
    match: (h) => /baichuan/i.test(h),
    meta: {
      key: 'baichuan',
      name: 'platform.baichuan',
      nameEn: 'Baichuan',
      color: '#1e88e5',
      iconUrl: ICON_URL_BAICHUAN,
      letter: 'B',
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
      name: 'platform.gpt',
      nameEn: 'GPT',
      color: '#10a37f',
      iconUrl: ICON_URL_OPENAI,
      letter: 'G',

    },
  },
  {
    key: 'claude',
    match: (n) => /^claude-/i.test(n),
    meta: {
      key: 'claude',
      name: 'platform.claude',
      nameEn: 'Claude',
      color: '#d97706',
      iconUrl: ICON_URL_ANTHROPIC,
      letter: 'C',

    },
  },
  {
    key: 'gemini',
    match: (n) => /gemini-/i.test(n),
    meta: {
      key: 'gemini',
      name: 'platform.gemini',
      nameEn: 'Gemini',
      color: '#4285f4',
      iconUrl: ICON_URL_GOOGLE,
      letter: 'G',
    },
  },
  {
    key: 'deepseek',
    match: (n) => /deepseek-/i.test(n),
    meta: {
      key: 'deepseek',
      name: 'platform.deepseek',
      nameEn: 'DeepSeek',
      color: '#0066cc',
      iconUrl: ICON_URL_DEEPSEEK,
      letter: 'D',
    },
  },
  {
    key: 'qwen',
    match: (n) => /qwen|qwq/i.test(n),
    meta: {
      key: 'qwen',
      name: 'platform.qwen',
      nameEn: 'Qwen',
      color: '#615ced',
      iconUrl: ICON_URL_QWEN,
      letter: 'Q',
    },
  },
  {
    key: 'ernie',
    match: (n) => /ernie-/i.test(n),
    meta: {
      key: 'ernie',
      name: 'platform.ernie',
      nameEn: 'ERNIE',
      color: '#2932e1',
      iconUrl: ICON_URL_BAIDU,
      letter: 'E',
    },
  },
  {
    key: 'spark',
    match: (n) => /spark|iflytek/i.test(n),
    meta: {
      key: 'spark',
      name: 'platform.spark',
      nameEn: 'Spark',
      color: '#1c64f2',
      iconUrl: ICON_URL_SPARK,
      letter: 'S',
    },
  },
  {
    key: 'glm',
    match: (n) => /glm-|chatglm/i.test(n),
    meta: {
      key: 'glm',
      name: 'platform.glm',
      nameEn: 'GLM',
      color: '#3862ec',
      iconUrl: ICON_URL_ZHIPU,
      letter: 'Z',
    },
  },
  {
    key: 'moonshot',
    match: (n) => /moonshot-|kimi/i.test(n),
    meta: {
      key: 'moonshot',
      name: 'platform.moonshot',
      nameEn: 'Moonshot',
      color: '#000000',
      iconUrl: ICON_URL_MOONSHOT,
      letter: 'M',
    },
  },
  {
    key: 'doubao',
    match: (n) => /doubao-|skylark-|volcengine/i.test(n),
    meta: {
      key: 'doubao',
      name: 'platform.doubao',
      nameEn: 'Doubao',
      color: '#0064ff',
      iconUrl: ICON_URL_DOUBAO,
      letter: 'D',
    },
  },
  {
    key: 'hunyuan',
    match: (n) => /hunyuan-/i.test(n),
    meta: {
      key: 'hunyuan',
      name: 'platform.hunyuan',
      nameEn: 'Hunyuan',
      color: '#007bff',
      iconUrl: ICON_URL_HUNYUAN,
      letter: 'H',
    },
  },
  {
    key: 'stepfun',
    match: (n) => /\bstep-1\b|\bstep-2\b|stepfun/i.test(n),
    meta: {
      key: 'stepfun',
      name: 'platform.stepfun',
      nameEn: 'StepFun',
      color: '#5e3ec4',
      iconUrl: ICON_URL_STEPFUN,
      letter: 'S',
    },
  },
  {
    key: 'yi',
    match: (n) => /(^|[-_/])yi-?\d|yi-large|yi-medium|yi-vision|01-ai/i.test(n),
    meta: {
      key: 'yi',
      name: 'platform.yi',
      nameEn: 'Yi',
      color: '#1a1a2e',
      iconUrl: ICON_URL_YI,
      letter: 'Y',
    },
  },
  {
    key: 'meta',
    match: (n) => /llama|meta-llama/i.test(n),
    meta: {
      key: 'meta',
      name: 'platform.meta',
      nameEn: 'Meta Llama',
      color: '#0467df',
      iconUrl: ICON_URL_META,
      letter: 'L',
    },
  },
  {
    key: 'mistral',
    match: (n) => /mistral|mixtral|codestral/i.test(n),
    meta: {
      key: 'mistral',
      name: 'platform.mistral',
      nameEn: 'Mistral',
      color: '#ff7000',
      iconUrl: ICON_URL_MISTRAL,
      letter: 'M',
    },
  },
  {
    key: 'baichuan',
    match: (n) => /baichuan/i.test(n),
    meta: {
      key: 'baichuan',
      name: 'platform.baichuan',
      nameEn: 'Baichuan',
      color: '#1e88e5',
      iconUrl: ICON_URL_BAICHUAN,
      letter: 'B',
    },
  },
]

/* ============================================================
 *  未知兜底
 * ============================================================ */
const UNKNOWN_PLATFORM: AgentPlatform = {
  key: 'unknown',
  name: 'platform.unknown',
  nameEn: 'Unknown',
  color: '#94a3b8',
  iconUrl: '',
  letter: '?',
}

/* ============================================================
 *  别名映射：把"口语化 / 历史 / 第三方"名称归一到 PLATFORM_RULES.key
 *  - 大小写不敏感
 *  - 命中后用 PLATFORM_RULES 中对应 key 的 meta 渲染（带 icon）
 *  - 未命中时回退到首字母 badge
 * ============================================================ */
const PLATFORM_KEY_ALIASES: Record<string, string> = {
  // OpenAI 系
  openai: 'openai',
  chatgpt: 'openai',
  gpt: 'openai',
  'open-ai': 'openai',
  // Anthropic 系
  anthropic: 'anthropic',
  claude: 'anthropic',
  'claude-ai': 'anthropic',
  // Google Gemini 系
  gemini: 'gemini',
  google: 'gemini',
  bard: 'gemini',
  // DeepSeek
  deepseek: 'deepseek',
  // 通义千问
  qwen: 'qwen',
  tongyi: 'qwen',
  // 文心一言（百度）
  ernie: 'ernie',
  wenxin: 'ernie',
  yiyan: 'ernie',
  // 讯飞星火
  spark: 'spark',
  xinghuo: 'spark',
  iflytek: 'spark',
  // 智谱 GLM
  glm: 'glm',
  zhipu: 'glm',
  chatglm: 'glm',
  // Moonshot / Kimi
  moonshot: 'moonshot',
  kimi: 'moonshot',
  // 豆包（字节）
  doubao: 'doubao',
  bytedance: 'doubao',
  volcengine: 'doubao',
  // 腾讯混元
  hunyuan: 'hunyuan',
  tencent: 'hunyuan',
  // 阶跃星辰
  stepfun: 'stepfun',
  // 零一万物
  yi: 'yi',
  '01-ai': 'yi',
  // Meta / Llama
  meta: 'meta',
  llama: 'meta',
  // Mistral
  mistral: 'mistral',
  mixtral: 'mistral',
  // 百川
  baichuan: 'baichuan',
  // Cohere
  cohere: 'cohere',
  // IDE / Agent 客户端
  cursor: 'cursor',
  windsurf: 'windsurf',
  cline: 'cline',
  trae: 'trae',
  'codex-cli': 'codex-cli',
  codex: 'codex-cli',
  workbuddy: 'workbuddy',
  agnes: 'agnes',
  coze: 'coze',
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
 * 根据 API endpoint URL 域名、平台 key 或口语化别名识别 Agent 平台
 *
 * 匹配优先级（命中即返回，不再向下走）：
 *  1. URL 形式（包含 . 或 ://）：按 host 域名匹配 PLATFORM_RULES
 *  2. 平台 key / 别名匹配（后端 platformKey、mock platformValue、用户自定义名称）：
 *     - 先按 PLATFORM_KEY_ALIASES（小写）归一到标准 key
 *     - 再到 PLATFORM_RULES 中取 meta
 *  3. 兜底：用输入值作为展示名 + 首字母 badge
 *
 * @param apiEndpoint 形如 https://api.openai.com/v1、openai、chatgpt、claude
 */
export function detectPlatform(apiEndpoint: string): AgentPlatform {
  if (!apiEndpoint) return { ...UNKNOWN_PLATFORM }
  const input = apiEndpoint.trim()
  // 1) URL 场景：按 host 域名匹配
  const isUrl = input.includes('.') || input.includes('://')
  if (isUrl) {
    const host = extractHost(input)
    for (const rule of PLATFORM_RULES) {
      if (rule.match(host)) return rule.meta
    }
    return { ...UNKNOWN_PLATFORM, letter: host.charAt(0).toUpperCase() || '?' }
  }
  // 2) 平台 key / 别名场景：大小写不敏感归一
  const aliasTarget = PLATFORM_KEY_ALIASES[input.toLowerCase()]
  if (aliasTarget) {
    const rule = PLATFORM_RULES.find((r) => r.key === aliasTarget)
    if (rule) return rule.meta
  }
  // 3) 兜底：用输入值作为平台名 + 首字母 badge
  return {
    ...UNKNOWN_PLATFORM,
    name: input,
    nameEn: input,
    letter: input.charAt(0).toUpperCase() || '?',
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
