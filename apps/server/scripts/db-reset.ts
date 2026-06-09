/**
 * 本地数据库重置脚本
 *
 * 用法：
 *   pnpm --filter @cupai/server db:reset      # DROP + CREATE 数据库（不含种子）
 *   pnpm --filter @cupai/server db:seed       # 灌入 deploy/init.sql 种子数据
 *   pnpm --filter @cupai/server db:reset && pnpm --filter @cupai/server db:seed
 *
 * 行为：
 *  1. 读取项目根 .env（DB_HOST/PORT/USERNAME/PASSWORD/DATABASE）
 *  2. DROP DATABASE + CREATE DATABASE（清掉全部表/视图/触发器/外键）
 *  3. 提示：TypeORM synchronize 会在后端首次启动时按实体自动建表
 *  4. 跑 deploy/init.sql 的种子数据（球队/球员/赛事/Prompt 模板）
 *
 * 安全闸：
 *  - 仅在 NODE_ENV=development 时执行，否则直接退出
 *  - 默认要求 DB_HOST=localhost 或 127.0.0.1（防止误删生产）
 *  - 若 DB_HOST 是其他值且未设置 DB_RESET_FORCE=1，则拒绝执行
 *
 * 这是一份代码级别的清理工具：两个环境只要都通过这套脚本即可保证一致。
 */
import * as fs from 'fs'
import * as path from 'path'
import * as mysql from 'mysql2/promise'

const RESET_TABLE_BLACKLIST: string[] = [] // 预留扩展位

async function loadEnv(): Promise<Record<string, string>> {
  // 优先用项目根 .env
  const envPath = path.resolve(__dirname, '../../../.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2]
      }
    }
  }
  return {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || '3306',
    DB_USERNAME: process.env.DB_USERNAME || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || 'cupai',
    NODE_ENV: process.env.NODE_ENV || 'development',
  }
}

function assertSafe(env: Record<string, string>): void {
  if (env.NODE_ENV !== 'development') {
    console.error(`❌ NODE_ENV=${env.NODE_ENV} 拒绝执行。仅允许在 development 环境下重置数据库。`)
    process.exit(1)
  }
  const host = env.DB_HOST
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1'
  const forced = process.env.DB_RESET_FORCE === '1'
  if (!isLocal && !forced) {
    console.error(`❌ DB_HOST=${host} 看起来是远程数据库，重置将清空所有数据。`)
    console.error('   如确实需要，请设置 DB_RESET_FORCE=1 后重试。')
    process.exit(1)
  }
  if (!isLocal && forced) {
    console.warn(`⚠️  DB_RESET_FORCE=1 已设置，将对远程数据库 ${host} 执行重置！`)
  }
}

async function resetDatabase(env: Record<string, string>): Promise<void> {
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    multipleStatements: true,
  })

  try {
    console.log(`🔌 已连接 MySQL ${env.DB_HOST}:${env.DB_PORT} as ${env.DB_USERNAME}`)

    // 关闭该库上的现有连接，让 DROP DATABASE 可以进行
    const [killRows] = (await conn.query(
      `SELECT id FROM information_schema.processlist
       WHERE db = ? AND id <> CONNECTION_ID()`,
      [env.DB_DATABASE],
    )) as any
    for (const row of killRows ?? []) {
      try {
        await conn.query(`KILL ${row.id}`)
      } catch {
        // 忽略已经关闭的连接
      }
    }

    console.log(`💥 DROP DATABASE \`${env.DB_DATABASE}\``)
    await conn.query(`DROP DATABASE IF EXISTS \`${env.DB_DATABASE}\``)
    console.log(`🏗  CREATE DATABASE \`${env.DB_DATABASE}\` (utf8mb4_unicode_ci)`)
    await conn.query(
      `CREATE DATABASE \`${env.DB_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    )
  } finally {
    await conn.end()
  }
}

async function applySeed(env: Record<string, string>): Promise<void> {
  const initSqlPath = path.resolve(__dirname, '../../../deploy/init.sql')
  if (!fs.existsSync(initSqlPath)) {
    console.warn(`⚠️  未找到种子脚本: ${initSqlPath}，跳过 init.sql 注入`)
    return
  }
  const sql = fs.readFileSync(initSqlPath, 'utf8')
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    multipleStatements: true,
  })
  try {
    console.log(`🌱 执行种子脚本: deploy/init.sql`)
    await conn.query(sql)
    console.log(`✅ 种子数据写入完成`)
  } finally {
    await conn.end()
  }
}

function parseFlags(): { skipSeed: boolean; onlySeed: boolean } {
  const args = process.argv.slice(2)
  return {
    skipSeed: args.includes('--no-seed'),
    onlySeed: args.includes('--seed-only'),
  }
}

;(async () => {
  const env = await loadEnv()
  const flags = parseFlags()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  CupAI 本地数据库工具')
  console.log(`  目标: ${env.DB_HOST}:${env.DB_PORT} / ${env.DB_DATABASE}`)
  console.log(`  跳过表: ${RESET_TABLE_BLACKLIST.join(', ') || '(无)'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  assertSafe(env)

  if (!flags.onlySeed) {
    await resetDatabase(env)
  }
  if (!flags.skipSeed) {
    // ⚠️ init.sql 是 INSERT 语句，依赖已有表结构
    // 正确顺序：db:reset → 启动后端（TypeORM 建表）→ db:seed
    await applySeed(env)
  } else {
    console.log('⏭  已跳过种子（--no-seed）')
  }
  console.log('🎉 完成。TypeORM 同步的表结构会在后端启动时自动建立（synchronize=true）。')
  process.exit(0)
})().catch((err) => {
  console.error('❌ 失败:', err)
  process.exit(1)
})
