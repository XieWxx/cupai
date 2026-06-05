/**
 * 实际访问页面，截取关键文本，验证运行时翻译
 */
const { chromium } = require('/Users/mac/.nvm/versions/node/v24.14.0/lib/node_modules/@playwright/test/index.js');

const URL_BASE = 'http://localhost:5173';

const TESTS = [
  { path: '/', name: 'Home', textSelectors: ['nav', 'header', '.el-card'] },
  { path: '/analysis', name: 'AnalysisCenter', textSelectors: ['.el-card__header', '.el-form-item__label', '.el-button'] },
  { path: '/match-center', name: 'MatchCenter', textSelectors: ['.match-card', '.el-tag'] },
  { path: '/sentiment', name: 'Sentiment', textSelectors: ['.stat-card', '.el-card__header'] },
  { path: '/square', name: 'AnalysisSquare', textSelectors: ['.el-card', '.el-button'] },
];

async function findBrokenTranslations(page) {
  return await page.evaluate(() => {
    // 扫描所有可见文本，寻找形如 "xxx.xxx" 的未翻译 key
    const allText = document.body.innerText;
    const brokenKeyPattern = /\b[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)?\b/g;
    const matches = allText.match(brokenKeyPattern) || [];
    // 过滤掉一些合法的点分文本（如数字、版本号）
    const filtered = matches.filter(m => {
      // 排除明显不是 i18n key 的（如 1.2.3, v1.0 等）
      return /^[a-z][a-zA-Z]+\.[a-zA-Z]+/.test(m);
    });
    return Array.from(new Set(filtered));
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then(c => c.newPage());

  // 中文模式
  for (const test of TESTS) {
    console.log(`\n=== 测试 [中文] ${test.name} (${test.path}) ===`);
    await page.goto(URL_BASE + test.path + '?t=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const broken = await findBrokenTranslations(page);
    if (broken.length === 0) {
      console.log('  ✅ 未发现未翻译的 key');
    } else {
      console.log('  ❌ 发现未翻译的 key:');
      for (const k of broken) console.log('     - ' + k);
    }
  }

  // 切换到英文
  console.log('\n\n========== 切换语言为 English ==========');
  await page.goto(URL_BASE + '/?t=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 尝试点击语言切换器
  try {
    const langSelector = page.locator('.lang-selector, .el-dropdown:has-text("语言"), [aria-label*="language"]').first();
    if (await langSelector.isVisible({ timeout: 2000 })) {
      await langSelector.click();
      await page.waitForTimeout(500);
      const enOption = page.locator('text=English').first();
      if (await enOption.isVisible({ timeout: 1000 })) {
        await enOption.click();
        await page.waitForTimeout(2000);
      }
    }
  } catch (e) {
    console.log('  无法通过 UI 切换语言，尝试通过 localStorage 切换');
    await page.evaluate(() => {
      localStorage.setItem('locale', 'en-US');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  }

  for (const test of TESTS) {
    console.log(`\n=== 测试 [English] ${test.name} (${test.path}) ===`);
    await page.goto(URL_BASE + test.path + '?t=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const broken = await findBrokenTranslations(page);
    if (broken.length === 0) {
      console.log('  ✅ 未发现未翻译的 key');
    } else {
      console.log('  ❌ 发现未翻译的 key:');
      for (const k of broken) console.log('     - ' + k);
    }
  }

  await browser.close();
})().catch(e => { console.error('ERROR:', e); process.exit(1); });
