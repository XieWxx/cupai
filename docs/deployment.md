# CupAI 免费部署方案指南

> 适用版本：V1.5+
> 最后更新：2026-06-08

## 一、需求画像

在选择部署平台前，先明确 CupAI 的运行特征：

| 资源 | 用量 | 备注 |
|---|---|---|
| **MySQL 8.0** | 必有 | TypeORM 强依赖，5 张主子表 + 7 张子表 |
| **Redis 7** | 必有 | 实时缓存、API 限流、WebSocket Adapter |
| **后端 Node.js** | 3001/3002 端口 | NestJS + node-schedule + Socket.io |
| **前端 Nginx** | 80/443 端口 | Vite 构建产物静态托管 |
| **BSD 同步调度** | 5min 一次 | 长期驻留进程（不能冷启动） |
| **WebSocket** | 实时比分推送 | 需长连接支持 |
| **定时任务** | 1m-1h 不等 | 不可丢失状态 |

**强需求**：
- ① **长期运行**（BSD 5min 同步不能被打断）
- ② **MySQL + Redis**（不能用 Serverless 替代）
- ③ **WebSocket**（不能用纯静态 Functions 替代）

**弱需求**：
- 大流量（开源早期流量小）
- 国内访问速度（V1.5 主要用户群为国内）
- 域名 + SSL（建议但不强制）

---

## 二、5 大类方案对比

### 📊 总览

| # | 类别 | 推荐指数 | 免费稳定性 | 适合 CupAI | 国内访问 |
|---|---|---|---|---|---|
| 1 | **PaaS 容器平台** | ⭐⭐⭐⭐ | 高 | ✅ 最佳 | 良 |
| 2 | **国内云学生机** | ⭐⭐⭐⭐ | 中 | ✅ 推荐 | ✅ 优 |
| 3 | **海外 Serverless** | ⭐⭐ | 中 | ❌ 不推荐 BSD 调度 | 差 |
| 4 | **海外静态托管** | ⭐ | 高 | ❌ 只能挂前端 | — |
| 5 | **永久免费虚拟主机** | ⭐ | 低 | ❌ 不支持 Node | — |

---

### 1️⃣ PaaS 容器平台（推荐 Top 3）

#### 🥇 Fly.io — **最推荐**

| 项 | 详情 |
|---|---|
| **官网** | https://fly.io |
| **免费额度** | 3 × shared-cpu-1x 256MB RAM + 3GB 持久卷 + 160GB 出口流量 |
| **支持** | Dockerfile、docker-compose、Postgres、Redis |
| **认证** | ⚠️ 需信用卡（不扣费，仅认证） |
| **优势** | 1. 全球边缘节点；2. 支持 docker-compose 完整部署；3. 内置免费 Postgres；4. 5min 内冷启动 |
| **劣势** | 免费 Redis 需自己用 `fly redis` 起；MySQL 同理（推荐用 Postgres 替代） |
| **适配度** | ✅ **完美**。但需将 MySQL 改 Postgres（TypeORM 支持） |

**快速部署**：
```bash
# 安装 flyctl
curl -L https://fly.io/install.sh | sh

# 初始化
cd cupai
fly launch --copy-config --name cupai

# 创建 Postgres（替代 MySQL）
fly postgres create --name cupai-db
fly postgres attach cupai-db

# 创建 Redis
fly redis create --name cupai-cache

# 部署
fly deploy
```

**⚠️ 注意事项**：
- 若坚持 MySQL，需要自己用 Docker 镜像跑 `mysql:8.0`
- 建议改用 Postgres：TypeORM 只需改 `type: 'mysql'` → `type: 'postgres'`，SQL 语法微调

#### 🥈 Koyeb — 单容器友好

| 项 | 详情 |
|---|---|
| **官网** | https://koyeb.com |
| **免费额度** | 1 × nano service 256MB + 1 × 免费 Postgres 256MB + 0.1 CPU |
| **支持** | Dockerfile、GitHub 自动部署 |
| **认证** | 需邮箱，无需信用卡 |
| **优势** | 1. 完全免卡；2. 简单易用；3. 全球边缘网络 |
| **劣势** | 1. 单容器限制（不能直接跑 docker-compose，需拆分）；2. 无免费 Redis；3. 空闲后冷启动 5-15s |
| **适配度** | ⚠️ 可用，但需拆分 docker-compose 为单服务部署 |

**快速部署**：
```bash
# 拆分方案：后端+前端 合并一个镜像（多阶段构建）
# MySQL 用 Koyeb 免费 Postgres 替代
# Redis 用 Upstash 免费 tier（10k 命令/天）
```

#### 🥉 Render（⚠️ 谨慎）

| 项 | 详情 |
|---|---|
| **官网** | https://render.com |
| **免费额度** | 750h/月 + 免费 Postgres 90 天（过期删除） + 免费 Redis 25MB |
| **支持** | Web Service、Postgres、Redis、Static |
| **认证** | 邮箱，无需信用卡 |
| **优势** | 1. 易用；2. 自动 HTTPS；3. GitHub 自动部署 |
| **劣势** | 1. **15 分钟无访问强制休眠**（BSD 5min 同步会断）；2. 免费 Postgres 90 天后删除；3. 免费 Redis 仅 25MB |
| **适配度** | ❌ **不推荐**。休眠机制破坏 BSD 同步 |

> 💡 若仍想用 Render：购买 Render Starter $7/月，或在 cron-job.org 设置每 5min 访问一次保活（灰色地带）。

---

### 2️⃣ 国内云学生机（国内访问最优）

#### 推荐方案对比

| 提供方 | 活动 | 月费 | 性能 | 难度 | 备注 |
|---|---|---|---|---|---|
| **腾讯云** | 学生机 2核2G | ¥10/月 | 优 | 低 | 需 25 岁以下 + 学信网 |
| **阿里云** | 学生机 2核2G | ¥10/月 | 优 | 低 | 需学生认证 |
| **雨云** | 公益免费机 | ¥0-5 | 中 | 中 | 需每月续期 |
| **阿贝云** | 永久免费云服务器 | ¥0 | 弱 | 低 | 1核1G + 免备案 |
| **蓝队云** | 免费虚拟主机 | ¥0 | 弱 | 低 | 仅 PHP，不支持 Node |
| **UCloud** | 个人免费体验 | ¥0 | 中 | 中 | 邀请制 |

#### 🥉 雨云 / 阿贝云 — **国内零成本首推**

| 提供方 | 配置 | 流量 | 备案 | 适合 |
|---|---|---|---|---|
| **雨云** | 1-2 核 / 1-2G | 5M 不限 | 需 | 学生 + 个人 |
| **阿贝云** | 1 核 / 1G / 20G | 5M 不限 | 免 | 个人 Demo |

**部署命令**（任一国内云通用）：
```bash
# 1. SSH 登录
ssh root@your-server-ip

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# 3. 部署
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
# 编辑 .env 填入 BSD_TOKEN 等
docker compose up -d

# 4. 验证
curl http://localhost:3000
```

**优势**：
- ✅ Docker Compose 完整支持
- ✅ MySQL + Redis 都在容器内
- ✅ BSD 5min 同步可正常
- ✅ 国内访问秒开
- ✅ 完全自主可控

**劣势**：
- 需自己配置 Nginx + Let's Encrypt SSL
- 需自己监控运行状态

---

### 3️⃣ 海外 Serverless（不推荐本项目）

| 平台 | 适合 | 原因 |
|---|---|---|
| **Vercel** | Next.js / Vue 静态 | 1. NestJS Functions 不支持 WebSocket；2. 5min 冷启动破坏 BSD 同步 |
| **Netlify** | 静态 + Functions | 1. Functions 限制 10s 超时；2. 不支持 node-schedule 持久 |
| **Cloudflare Pages** | 静态 | 1. Workers 无 Node.js 完整运行时；2. 不能跑 MySQL |

**💡 但可用于拆分部署**：
- **前端** → Vercel / Cloudflare Pages（**完美**）
- **后端** → Fly.io / Render（牺牲冷启动）

---

### 4️⃣ 海外静态托管

仅适合**只挂前端 demo**，不能跑后端。

| 平台 | 免费 | 适合 |
|---|---|---|
| **GitHub Pages** | 1GB / 100GB 流量 | 仅静态 |
| **Cloudflare Pages** | 无限带宽 | 仅静态 |
| **Netlify** | 100GB | 仅静态 |
| **Surge.sh** | 无限 | 仅静态 |

**应用场景**：将 `apps/web/dist` 推到这些平台作为前端 Demo，但后端 API 仍需另寻方案。

---

### 5️⃣ 永久免费虚拟主机（❌ 不支持 Node）

| 提供方 | 类型 | 不支持的原因 |
|---|---|---|
| **InfinityFree** | PHP 主机 | 不支持 Node.js |
| **蓝队云** | PHP 主机 | 仅 PHP / ASP.NET |
| **000webhost** | PHP 主机 | 同上 |
| **AwardSpace** | PHP 主机 | 同上 |

---

## 三、CupAI 推荐方案（按场景）

### 场景 A：海外用户为主 + 不想花钱
**→ Fly.io（首选）**
- 改用 Postgres 替代 MySQL（TypeORM 一行代码）
- 5min 完成部署
- 全球边缘加速

### 场景 B：国内用户为主 + 愿意小投入
**→ 腾讯云/阿里云学生机 ¥10/月**
- Docker Compose 完整支持
- 国内访问秒开
- 完全自主可控

### 场景 C：纯展示 / 演示 Demo
**→ 前端 Vercel + 后端 Render（保活 cron）**
- Vercel 部署前端
- Render 部署后端（加 cron-job 保活）
- ⚠️ 需注意 Render 90 天 Postgres 过期

### 场景 D：长期零成本运营
**→ 雨云 / 阿贝云（公益免费）**
- 需每月续期（雨云）或长期免卡（阿贝云）
- Docker Compose 全功能
- 性能较弱，适合早期推广

---

## 四、迁移到 Postgres 的最小改动

Fly.io 推荐使用 Postgres。若从 MySQL 迁移：

```typescript
// apps/server/src/config/database.config.ts
// 仅改 type 即可（TypeORM 兼容 90% SQL）
{
  type: 'postgres',  // 原 mysql
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // 移除以下 MySQL 特有配置
  // charset: 'utf8mb4',
  // timezone: '+08:00',
  // supportBigNumbers: true,
}
```

**注意 SQL 差异**：
- `AUTO_INCREMENT` → `SERIAL` / `BIGSERIAL`
- `TINYINT(1)` → `BOOLEAN`
- 反引号 `` ` `` → 双引号 `"`
- `JSON` → `JSONB`（Postgres 特有，性能更好）

---

## 五、监控与维护

无论选哪种方案，都要：

1. **日志收集**：用 `docker compose logs -f` 或装 Loki + Grafana
2. **健康检查**：每分钟 `curl /api/v1/health`，挂掉自动重启
3. **数据库备份**：每周 `mysqldump` 或 `pg_dump` 一次
4. **SSL 证书**：用 Let's Encrypt + certbot，90 天自动续期
5. **BSD Token 监控**：BSD 配额有限，每月查看用量

---

## 六、总结

| 你的角色 | 首选方案 | 备选 |
|---|---|---|
| 🌍 海外独立开发者 | **Fly.io + Postgres** | Koyeb + Upstash Redis |
| 🇨🇳 国内开发者 | **腾讯云/阿里云学生机 + Docker** | 雨云/阿贝云 |
| 🎓 学生/学习 | **雨云免费机** | 阿贝云永久免费 |
| 🏢 团队/商业 | 阿里云 ECS ¥50/月起 | 腾讯云 CVM |

**最简单 + 最稳的路径**（**5 分钟部署**）：

```bash
# 任何支持 Docker 的 Linux 服务器
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
vim .env  # 填 BSD_TOKEN 和 DB_PASSWORD
docker compose up -d
# 访问 http://your-server-ip:3000
```

> 📌 提醒：BSD API Token 申请：https://sports.bzzoiro.com

---

## 参考资料

- [Fly.io 文档](https://fly.io/docs)
- [Koyeb 部署指南](https://www.koyeb.com/docs)
- [Render 免费层注意事项](https://render.com/docs/free)
- [腾讯云学生机](https://cloud.tencent.com/act/campus)
- [雨云](https://www.rainyun.com)
- [阿贝云](https://www.abeiyun.com)
- [Let's Encrypt](https://letsencrypt.org)
