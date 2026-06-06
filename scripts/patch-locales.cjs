#!/usr/bin/env node
/**
 * 批量给 7 套 locale（en-US / es-ES / fr-FR / pt-BR / ar-SA / ja-JP / ko-KR）
 * 追加首页 4 大模块 + 排行榜 PRD 字段的英文/西语/法语/葡语/阿拉伯语/日语/韩语翻译
 *
 * zh-CN 已经手动更新过，此脚本不处理。
 */
const fs = require('fs')
const path = require('path')

const LOCALES_DIR = path.resolve(__dirname, '../apps/web/src/locales')

/** 7 套非中文 locale 的新字段翻译 */
const TRANSLATIONS = {
  'en-US': {
    home: {
      matchDynamics: 'Match Dynamics',
      todayUpcoming: "Today's Upcoming",
      recentFinished: 'Recently Finished',
      noLive: 'No live matches right now',
      noUpcoming: "No upcoming matches today",
      noFinished: 'No recently finished matches',
      aiBrief: 'AI Hot Analysis Brief',
      noBrief: 'No hot analysis briefs',
      avgAccuracy: 'Avg. Accuracy',
      rankingSummary: 'Ranking Summary',
      topUsers: 'TOP 10 High-Accuracy Users',
      topModels: 'Popular Models',
      topPlatforms: 'Popular Agent Platforms',
      noData: 'No data',
      predCount: 'predictions',
      userCount: 'users',
      guide: 'Platform User Guide',
      guideStep1Title: 'Copy Analysis Instruction',
      guideStep1Desc: "Pick the analysis dimensions you need on a match detail page and copy a one-click Markdown instruction (with data snapshot + options + callback URL).",
      guideStep1Cta: 'Go to Match Center',
      guideStep2Title: 'Agent Smart Analysis',
      guideStep2Desc: 'Paste the instruction into your own AI client (ChatGPT / Claude / DeepSeek / Cursor …) and let the Agent output a structured conclusion.',
      guideStep2Hint: 'Compatible with any OpenAI / Anthropic-protocol Agent',
      guideStep3Title: 'Dedicated Callback API',
      guideStep3Desc: 'The Agent posts per-dimension results back to a dedicated callback via your unique API key. The platform auto-renders charts, tracks accuracy, and updates the ranking.',
      guideStep3Cta: 'View Ranking',
    },
    ranking: {
      totalAccuracy: 'Total Accuracy',
      exactScoreRate: 'Exact-Score Hit Rate',
      funnyDataRate: 'Fun-Data Hit Rate',
      sortBy: 'Sort by',
    },
  },
  'es-ES': {
    home: {
      matchDynamics: 'Dinámica de partidos',
      todayUpcoming: 'Próximos de hoy',
      recentFinished: 'Finalizados recientes',
      noLive: 'No hay partidos en vivo',
      noUpcoming: 'Sin partidos próximos hoy',
      noFinished: 'Sin partidos finalizados recientes',
      aiBrief: 'Resumen de análisis IA populares',
      noBrief: 'Sin resúmenes populares',
      avgAccuracy: 'Precisión media',
      rankingSummary: 'Resumen de ranking',
      topUsers: 'TOP 10 usuarios más precisos',
      topModels: 'Modelos populares',
      topPlatforms: 'Plataformas Agent populares',
      noData: 'Sin datos',
      predCount: 'predicciones',
      userCount: 'usuarios',
      guide: 'Guía de uso',
      guideStep1Title: 'Copiar instrucción',
      guideStep1Desc: 'Elige las dimensiones en la página del partido y copia una instrucción Markdown con datos + opciones + URL de callback.',
      guideStep1Cta: 'Ir al centro de partidos',
      guideStep2Title: 'Análisis con Agent',
      guideStep2Desc: 'Pega la instrucción en tu cliente IA (ChatGPT / Claude / DeepSeek / Cursor …) para obtener una conclusión estructurada.',
      guideStep2Hint: 'Compatible con cualquier Agent sobre OpenAI / Anthropic',
      guideStep3Title: 'Callback API dedicado',
      guideStep3Desc: 'El Agent envía resultados por dimensión a un callback dedicado con tu API Key. La plataforma actualiza gráficos, precisión y ranking.',
      guideStep3Cta: 'Ver ranking',
    },
    ranking: {
      totalAccuracy: 'Precisión total',
      exactScoreRate: 'Acierto de resultado exacto',
      funnyDataRate: 'Acierto de datos secundarios',
      sortBy: 'Ordenar por',
    },
  },
  'fr-FR': {
    home: {
      matchDynamics: 'Dynamique des matchs',
      todayUpcoming: "Aujourd'hui à venir",
      recentFinished: 'Récemment terminés',
      noLive: 'Aucun match en direct',
      noUpcoming: "Aucun match à venir aujourd'hui",
      noFinished: 'Aucun match terminé récemment',
      aiBrief: 'Analyses IA populaires',
      noBrief: 'Aucun résumé populaire',
      avgAccuracy: 'Précision moyenne',
      rankingSummary: 'Résumé du classement',
      topUsers: 'TOP 10 utilisateurs les plus précis',
      topModels: 'Modèles populaires',
      topPlatforms: 'Plateformes Agent populaires',
      noData: 'Aucune donnée',
      predCount: 'prédictions',
      userCount: 'utilisateurs',
      guide: "Guide d'utilisation",
      guideStep1Title: "Copier l'instruction d'analyse",
      guideStep1Desc: "Choisissez les dimensions sur la page du match et copiez une instruction Markdown (données + options + URL de callback).",
      guideStep1Cta: 'Aller au centre des matchs',
      guideStep2Title: 'Analyse par Agent',
      guideStep2Desc: "Collez l'instruction dans votre client IA (ChatGPT / Claude / DeepSeek / Cursor …) pour obtenir une conclusion structurée.",
      guideStep2Hint: 'Compatible avec tout Agent OpenAI / Anthropic',
      guideStep3Title: 'API de callback dédiée',
      guideStep3Desc: "L'Agent envoie les résultats par dimension via votre API Key. La plateforme met à jour graphiques, précision et classement.",
      guideStep3Cta: 'Voir le classement',
    },
    ranking: {
      totalAccuracy: 'Précision totale',
      exactScoreRate: 'Taux de score exact',
      funnyDataRate: 'Taux de données annexes',
      sortBy: 'Trier par',
    },
  },
  'pt-BR': {
    home: {
      matchDynamics: 'Dinâmica de partidas',
      todayUpcoming: 'Próximas hoje',
      recentFinished: 'Finalizadas recentes',
      noLive: 'Nenhuma partida ao vivo',
      noUpcoming: 'Nenhuma partida próxima hoje',
      noFinished: 'Nenhuma partida finalizada recente',
      aiBrief: 'Análises IA em alta',
      noBrief: 'Sem análises em alta',
      avgAccuracy: 'Precisão média',
      rankingSummary: 'Resumo do ranking',
      topUsers: 'TOP 10 usuários mais precisos',
      topModels: 'Modelos populares',
      topPlatforms: 'Plataformas Agent populares',
      noData: 'Sem dados',
      predCount: 'previsões',
      userCount: 'usuários',
      guide: 'Guia de uso',
      guideStep1Title: 'Copiar instrução',
      guideStep1Desc: 'Escolha as dimensões na página da partida e copie uma instrução Markdown com dados + opções + URL de callback.',
      guideStep1Cta: 'Ir ao centro de partidas',
      guideStep2Title: 'Análise por Agent',
      guideStep2Desc: 'Cole a instrução no seu cliente IA (ChatGPT / Claude / DeepSeek / Cursor …) para obter uma conclusão estruturada.',
      guideStep2Hint: 'Compatível com qualquer Agent OpenAI / Anthropic',
      guideStep3Title: 'API de callback dedicada',
      guideStep3Desc: 'O Agent envia resultados por dimensão via sua API Key. A plataforma atualiza gráficos, precisão e ranking.',
      guideStep3Cta: 'Ver ranking',
    },
    ranking: {
      totalAccuracy: 'Precisão total',
      exactScoreRate: 'Acerto de placar exato',
      funnyDataRate: 'Acerto de dados secundários',
      sortBy: 'Ordenar por',
    },
  },
  'ar-SA': {
    home: {
      matchDynamics: 'ديناميكية المباريات',
      todayUpcoming: 'قادمة اليوم',
      recentFinished: 'المنتهية مؤخراً',
      noLive: 'لا توجد مباريات مباشرة',
      noUpcoming: 'لا توجد مباريات قادمة اليوم',
      noFinished: 'لا توجد مباريات منتهية مؤخراً',
      aiBrief: 'ملخصات تحليلات AI الرائجة',
      noBrief: 'لا توجد ملخصات رائجة',
      avgAccuracy: 'متوسط الدقة',
      rankingSummary: 'ملخص الترتيب',
      topUsers: 'أفضل 10 مستخدمين دقة',
      topModels: 'النماذج الرائجة',
      topPlatforms: 'منصات Agent الرائجة',
      noData: 'لا توجد بيانات',
      predCount: 'توقعات',
      userCount: 'مستخدمين',
      guide: 'دليل الاستخدام',
      guideStep1Title: 'نسخ تعليمات التحليل',
      guideStep1Desc: 'اختر أبعاد التحليل في صفحة المباراة وانسخ تعليمة Markdown (بيانات + خيارات + رابط رد).',
      guideStep1Cta: 'الانتقال لمركز المباريات',
      guideStep2Title: 'تحليل Agent ذكي',
      guideStep2Desc: 'الصق التعليمة في عميل AI الخاص بك (ChatGPT / Claude / DeepSeek / Cursor …) للحصول على نتيجة منظمة.',
      guideStep2Hint: 'متوافق مع أي Agent يدعم بروتوكول OpenAI / Anthropic',
      guideStep3Title: 'API رد مخصص',
      guideStep3Desc: 'يرسل Agent النتائج لكل بُعد عبر API Key مخصص. تقوم المنصة بتحديث الرسوم والدقة والترتيب تلقائياً.',
      guideStep3Cta: 'عرض الترتيب',
    },
    ranking: {
      totalAccuracy: 'الدقة الإجمالية',
      exactScoreRate: 'معدل إصابة النتيجة الدقيقة',
      funnyDataRate: 'معدل إصابة البيانات الجانبية',
      sortBy: 'ترتيب حسب',
    },
  },
  'ja-JP': {
    home: {
      matchDynamics: '試合の動態',
      todayUpcoming: '本日の予定',
      recentFinished: '最近の終了',
      noLive: '現在進行中の試合はありません',
      noUpcoming: '本日の予定試合はありません',
      noFinished: '最近の終了試合はありません',
      aiBrief: '人気 AI 分析ブリーフ',
      noBrief: '人気ブリーフはありません',
      avgAccuracy: '平均正解率',
      rankingSummary: 'ランキング概要',
      topUsers: 'TOP10 高正解率ユーザー',
      topModels: '人気モデル',
      topPlatforms: '人気 Agent プラットフォーム',
      noData: 'データなし',
      predCount: '予測',
      userCount: 'ユーザー',
      guide: 'プラットフォーム使い方',
      guideStep1Title: '分析指示をコピー',
      guideStep1Desc: '試合詳細ページで分析ディメンションを選び、Markdown 指示（データ + 選択肢 + コールバック URL）をワンクリックでコピー。',
      guideStep1Cta: '試合センターへ',
      guideStep2Title: 'Agent 智能分析',
      guideStep2Desc: 'お好みの AI クライアント（ChatGPT / Claude / DeepSeek / Cursor …）に指示を貼り付け、構造化結果を取得。',
      guideStep2Hint: 'OpenAI / Anthropic プロトコル対応の Agent 全て互換',
      guideStep3Title: '独立コールバック API',
      guideStep3Desc: 'Agent が API Key でディメンション毎の結果をコールバック。プラットフォームが自動的にグラフ・正解率・ランキングを更新。',
      guideStep3Cta: 'ランキングを見る',
    },
    ranking: {
      totalAccuracy: '総合正解率',
      exactScoreRate: '完全一致的中率',
      funnyDataRate: '周辺データ的中率',
      sortBy: '並び替え',
    },
  },
  'ko-KR': {
    home: {
      matchDynamics: '경기 동향',
      todayUpcoming: '오늘 예정',
      recentFinished: '최근 종료',
      noLive: '현재 진행 중인 경기가 없습니다',
      noUpcoming: '오늘 예정된 경기가 없습니다',
      noFinished: '최근 종료된 경기가 없습니다',
      aiBrief: '인기 AI 분석 브리핑',
      noBrief: '인기 브리핑이 없습니다',
      avgAccuracy: '평균 정확도',
      rankingSummary: '랭킹 요약',
      topUsers: 'TOP 10 고 정확도 사용자',
      topModels: '인기 모델',
      topPlatforms: '인기 Agent 플랫폼',
      noData: '데이터 없음',
      predCount: '예측',
      userCount: '사용자',
      guide: '플랫폼 사용 안내',
      guideStep1Title: '분석 지시문 복사',
      guideStep1Desc: '경기 상세 페이지에서 분석 차원을 선택하고, Markdown 지시문(데이터 + 선택지 + 콜백 URL)을 원클릭 복사.',
      guideStep1Cta: '경기 센터로',
      guideStep2Title: 'Agent 스마트 분석',
      guideStep2Desc: '본인 AI 클라이언트(ChatGPT / Claude / DeepSeek / Cursor …)에 지시문을 붙여넣고 구조화된 결론을 받습니다.',
      guideStep2Hint: 'OpenAI / Anthropic 프로토콜 호환 Agent 모두 지원',
      guideStep3Title: '독립 콜백 API',
      guideStep3Desc: 'Agent 가 API Key 로 차원별 결과를 콜백합니다. 플랫폼이 차트·정확도·랭킹을 자동 갱신.',
      guideStep3Cta: '랭킹 보기',
    },
    ranking: {
      totalAccuracy: '총 예측 정확도',
      exactScoreRate: '정확한 스코어 적중률',
      funnyDataRate: '부가 데이터 적중률',
      sortBy: '정렬',
    },
  },
}

/** 序列化为 TS 字面量（值统一加单引号；含撇号/反斜杠/换行的值安全转义） */
function serialize(obj, indent = '    ') {
  const lines = []
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      // 嵌套对象：单独成块
      lines.push(`${indent}${k}: {`)
      lines.push(serialize(v, indent + '  '))
      lines.push(`${indent}},`)
    } else {
      const escaped = String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
      lines.push(`${indent}${k}: '${escaped}',`)
    }
  }
  return lines.join('\n')
}

/** 在 home 段最后（hostMx 之后、 `},` 闭合前）插入新字段（幂等：已存在则跳过） */
function patchHome(content, homeAdd) {
  // 幂等：检查 marker 注释
  if (content.includes('// PRD 3.1.2 首页 4 大模块')) return content
  const lines = content.split('\n')
  let insertIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('hostMxDesc:')) {
      insertIdx = i + 1
      break
    }
  }
  if (insertIdx < 0) throw new Error('hostMxDesc anchor not found')
  while (insertIdx < lines.length && lines[insertIdx].trim() === '') insertIdx++
  const block = [
    `    // PRD 3.1.2 首页 4 大模块`,
    serialize(homeAdd, '    '),
  ].join('\n')
  lines.splice(insertIdx, 0, block)
  return lines.join('\n')
}

/** 在 ranking 段 accuracyRate 之后插入新字段（兼容所有 locale，幂等） */
function patchRanking(content, rankAdd) {
  if (content.includes('// PRD 3.3.2 / 3.3.3 字段配套')) return content
  const lines = content.split('\n')
  // 找 accuracyRate 行（所有 locale 都有）
  let insertIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*accuracyRate:/.test(lines[i])) {
      insertIdx = i + 1
      break
    }
  }
  if (insertIdx < 0) throw new Error('accuracyRate anchor not found')
  // 跳过其后的 myRanking / overview 等无关行，直到遇到 overview 块前一行
  // 我们要在 overview: { 之前插入
  for (let i = insertIdx; i < lines.length; i++) {
    if (/^\s*overview: \{/.test(lines[i])) {
      insertIdx = i
      break
    }
  }
  // 在 overview 之前插入
  const block = [
    `    // PRD 3.3.2 / 3.3.3 字段配套`,
    serialize(rankAdd, '    '),
    '',
  ].join('\n')
  lines.splice(insertIdx, 0, block)
  return lines.join('\n')
}

let updated = 0
for (const [locale, data] of Object.entries(TRANSLATIONS)) {
  const file = path.join(LOCALES_DIR, `${locale}.ts`)
  let content = fs.readFileSync(file, 'utf-8')
  content = patchHome(content, data.home)
  content = patchRanking(content, data.ranking)
  fs.writeFileSync(file, content)
  console.log(`✓ ${locale}.ts updated`)
  updated++
}

console.log(`\nUpdated ${updated} locale files`)
