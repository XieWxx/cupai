import { useI18n } from 'vue-i18n'

/** 根据当前语言返回队伍名称的组合式函数 */
export function useTeamName() {
  const { locale, t } = useI18n()

  /** 语言到 team 实体字段的映射 */
  const localeFieldMap: Record<string, string> = {
    'zh-CN': 'name',
    'en-US': 'nameEn',
    'ja-JP': 'nameJa',
    'ko-KR': 'nameKo',
    'es-ES': 'nameEs',
    'fr-FR': 'nameFr',
    'pt-BR': 'namePt',
    'ar-SA': 'nameAr',
  }

  /**
   * 获取队伍名称（根据当前语言自动选择字段）
   * @param team 球队对象，包含 name/nameEn/nameJa 等字段
   * @param placeholder 占位符来源标签（如 "1E", "3A/3B/3C/3D/3F"），由后端 resolvePlaceholderTeams 返回
   * @returns 当前语言对应的队伍名称，占位符队伍显示 "1E (待确认)"
   */
  function getTeamName(team: any, placeholder?: string): string {
    if (!team) return ''
    // 占位符队伍（countryCode === 'INT' 且名称为占位符格式）显示来源标签
    if (team.countryCode === 'INT' && isPlaceholderName(team.nameEn || team.name)) {
      const label = placeholder || team.nameEn || team.name || ''
      return `${label} (${t('bracket.tbd')})`
    }
    const field = localeFieldMap[locale.value] || 'name'
    return team[field] || team.nameEn || team.name || ''
  }

  return { getTeamName }
}

/** 判断是否为占位符队名（如 1A, G1, W73, 3A/3B 等） */
function isPlaceholderName(name: string | undefined): boolean {
  if (!name) return false
  return /^\d[A-Z](\/\d[A-Z])*$/.test(name)
    || /^[A-Z]\d(\/[A-Z]\d)*$/.test(name)
    || /^[WL]\d+$/.test(name)
}
