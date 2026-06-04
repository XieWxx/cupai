import MarkdownIt from 'markdown-it'

/**
 * Markdown 渲染器
 * 用于渲染 AI 分析报告内容
 */

// 初始化 markdown-it 实例
const md = new MarkdownIt({
  html: false, // 禁止 HTML 标签（安全考虑）
  linkify: true, // 自动识别链接
  typographer: true, // 优化排版
  breaks: true, // 换行符转 <br>
})

/**
 * 渲染 Markdown 文本为 HTML
 * @param text Markdown 原始文本
 * @returns 渲染后的 HTML 字符串
 */
export function renderMarkdown(text: string): string {
  if (!text) return ''
  return md.render(text)
}

/**
 * 渲染行内 Markdown（不包裹 <p> 标签）
 * @param text Markdown 原始文本
 * @returns 渲染后的 HTML 字符串
 */
export function renderInlineMarkdown(text: string): string {
  if (!text) return ''
  return md.renderInline(text)
}

export default md
