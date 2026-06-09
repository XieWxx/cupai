import { useI18n } from 'vue-i18n'

/** 根据当前语言返回队伍名称的组合式函数 */
export function useTeamName() {
  const { locale } = useI18n()

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
   * @returns 当前语言对应的队伍名称，fallback 到 nameEn → name
   */
  function getTeamName(team: any): string {
    if (!team) return ''
    const field = localeFieldMap[locale.value] || 'name'
    return team[field] || team.nameEn || team.name || ''
  }

  return { getTeamName }
}
