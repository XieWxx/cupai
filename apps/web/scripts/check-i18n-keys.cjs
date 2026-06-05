/**
 * 全面扫描 $t() 调用，检查所有 key 在 8 个语言文件中的有效性
 * 同时扫描 t('xxx') 调用（setup 语法）
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = '/Users/mac/work/cupai/apps/web/src';
const LOCALES_DIR = path.join(SRC_DIR, 'locales');
const LANGS = ['zh-CN', 'en-US', 'es-ES', 'fr-FR', 'pt-BR', 'ar-SA', 'ja-JP', 'ko-KR'];

// 1. 递归收集所有 .vue / .ts / .js 文件
function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.vite') continue;
    const fp = path.join(dir, name);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) walk(fp, files);
    else if (/\.(vue|ts|js)$/.test(name)) files.push(fp);
  }
  return files;
}

// 2. 从文件提取所有 t('xxx') / $t('xxx') 调用
const tCallRegex = /(?:\$t|t)\(\s*['"]([\w.]+)['"]/g;

function extractKeysFromFile(fp) {
  const text = fs.readFileSync(fp, 'utf-8');
  const keys = new Set();
  let m;
  while ((m = tCallRegex.exec(text)) !== null) keys.add(m[1]);
  return Array.from(keys);
}

// 3. 从翻译文件中提取所有可用的 key 路径
function extractAllKeyPaths(obj, prefix = '', result = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      extractAllKeyPaths(v, path, result);
    } else {
      result.add(path);
    }
  }
  return result;
}

const allFiles = walk(SRC_DIR);
const usedKeys = new Map();
for (const fp of allFiles) {
  const keys = extractKeysFromFile(fp);
  if (keys.length) usedKeys.set(fp, keys);
}

// 4. 加载各语言文件，提取所有可用 key
const langKeys = {};
for (const lang of LANGS) {
  const content = fs.readFileSync(path.join(LOCALES_DIR, `${lang}.ts`), 'utf-8');
  // 移除 export default
  const cleaned = content.replace(/^export\s+default\s+/m, '');
  // 简单的对象解析（针对翻译文件结构）
  // 使用 eval 安全风险低（本地脚本），但要包装
  let data;
  try {
    data = eval('(' + cleaned + ')');
  } catch (e) {
    console.error(`解析 ${lang}.ts 失败:`, e.message);
    continue;
  }
  langKeys[lang] = extractAllKeyPaths(data);
}

// 5. 比对
const allUsedKeys = new Set();
for (const keys of usedKeys.values()) for (const k of keys) allUsedKeys.add(k);

console.log(`\n=== 共发现 ${allUsedKeys.size} 个不重复的 i18n key ===\n`);

// 检查每个 key 在每个语言中的存在性
const missing = {}; // { key: [lang1, lang2, ...] }
for (const key of allUsedKeys) {
  for (const lang of LANGS) {
    if (!langKeys[lang] || !langKeys[lang].has(key)) {
      if (!missing[key]) missing[key] = [];
      missing[key].push(lang);
    }
  }
}

const missingKeys = Object.keys(missing);
if (missingKeys.length === 0) {
  console.log('✅ 所有 key 在 8 个语言文件中都存在！');
} else {
  console.log(`❌ 发现 ${missingKeys.length} 个 key 在某些语言文件中缺失：\n`);
  for (const key of missingKeys) {
    console.log(`  ${key}: 缺失于 [${missing[key].join(', ')}]`);
  }
}

// 6. 统计每个语言文件的 key 数量
console.log('\n=== 各语言文件 key 数量 ===');
for (const lang of LANGS) {
  console.log(`  ${lang}: ${langKeys[lang] ? langKeys[lang].size : 0}`);
}
