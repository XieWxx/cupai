<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>开源 可自定义 AI 足球赛事分析预测平台</strong><br>
  <em>Open-Source Customizable AI Football Match Analysis Platform</em>
</p>

<p align="center">
  <a href="https://github.com/XieWxx/cupai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XieWxx/cupai?style=flat-square&color=2563eb" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue"></a>
  <a href="#"><img src="https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="#"><img src="https://img.shields.io/badge/i18n-8_languages-brightgreen?style=flat-square" alt="i18n"></a>
</p>

<p align="center">
  🌐 多语言 README /
  <a href="./README.zh-CN.md">🇨🇳 中文</a> ·
  <a href="./README.en-US.md">🇬🇧 English</a> ·
  <a href="./README.es-ES.md">🇪🇸 Español</a> ·
  <a href="./README.fr-FR.md">🇫🇷 Français</a> ·
  <a href="./README.pt-BR.md">🇧🇷 Português</a> ·
  <a href="./README.ar-SA.md">🇸🇦 العربية</a> ·
  <a href="./README.ja-JP.md">🇯🇵 日本語</a> ·
  <a href="./README.ko-KR.md">🇰🇷 한국어</a>
</p>

---

## ✨ CupAI 是什么？

**CupAI** 是一个**完全开源、纯数据驱动的足球赛事分析平台**，核心理念是 **BYOAK（Bring Your Own API Key — 用户自备大模型）**。它不是博彩、不是投注，它是一个**足球数据服务 + 分析工具箱**：

- 🛰️ **同步每一次触球** — 接入 BSD v2 15+ 端点（实时比分/统计/阵容/事件流/赔率/历史交锋/社媒/精彩集锦/天气等）写入自有数据库
- 🧠 **接入自有大模型** — DeepSeek / 豆包 / GPT / 通义千问 / GLM / Claude，用户自备 API Key
- 📝 **市场化的 Prompt** — 共享、复用最优质足球分析模板
- ⚖️ **可调权重因子** — 8 大类分析因子（状态/历史/天气/伤停等）0%-100% 自由配比
- 🏆 **三个维度排行** — 用户 / 大模型 / Agent 平台（均按预测次数排序）
- 🌍 **8 种语言** — 中/英/西/法/葡/阿/日/韩，覆盖世界杯主要参赛国

> 面向独立开发者、足球迷、开源社区。100% 非商业、零博彩、零赌博 — 纯粹的战术复盘与数据推演。

---

## 🎯 核心差异化

| 特色 | 为什么重要 |
|---|---|
| 🔑 **BYOAK 用户私有大模型** | 平台永远不付 AI 调用费。用户自带 API Key（DeepSeek/OpenAI/Qwen/豆包），运营方零成本。 |
| 🧩 **Prompt 市场** | 创建、分享、版本化、复用足球分析 Prompt 模板。专业用户贡献最优质 Prompt。 |
| ⚖️ **因子权重引擎** | 8 大类分析因子（状态/历史交锋/天气/伤停/阵容/主场优势/舆情/资讯）— 自由配比 0–100%。 |
| 🤖 **AI Agent 全自动推演** | 5 大自研算法驱动，零操作完成 Agent 回调协议全自动分析。 |
| 📊 **三 Tab 排行榜** | 用户（预测数）/ 大模型（平台用户数）/ Agent 平台（受欢迎度），均按总预测次数排序。 |
| 🛡️ **纯合规** | 无博彩、无投注、无胜负预判。硬编码敏感词过滤。GDPR + 中国法律法规双重合规。 |
| 🌍 **8 种语言** | 中/英/西/法/葡/阿/日/韩，覆盖世界杯主要参赛地区。 |

---

## 🧩 技术栈

| 层级 | 技术 | 用途 |
|---|---|---|
| 🖥️ **前端** | Vue 3 + Vite + Element Plus | 响应式 UI、看板、排行榜 |
| ⚡ **实时通信** | Socket.io | 实时比分、即时推送 |
| 📊 **图表** | ECharts | 准确率趋势、权重分布、舆情评分 |
| 🖼️ **图标** | LobeHub Icons（本地 SVG） | 大模型/Agent 平台品牌徽标 |
| 🌐 **国际化** | vue-i18n (8 语言) | 多语言、多时区 |
| 🛣️ **路由** | Vue Router | 13 个核心页面 |
| 📦 **状态管理** | Pinia | 跨页面数据流 |
| 🔧 **后端** | NestJS 10 + TypeORM (TypeScript) | 模块化 API、AI 中转、数据编排 |
| 🗄️ **数据库** | MySQL 8.0 | 用户、模板、报告、排行 |
| ⚡ **缓存** | Redis 7 | 实时缓存、API 限流、热数据 |
| ⏰ **调度** | node-schedule | BSD 同步（5min）、Agent 扫描、报告生成 |
| 🌐 **数据源** | BSD API v2 | 15+ 端点：events / teams / players / standings / stats / incidents / lineups / odds / H2H / social / metadata / weather / highlights |
| 🐳 **部署** | Docker + Docker Compose + Nginx | 一键部署、反向代理、SSL |

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose**（推荐）

### 方式 A：Docker 一键部署

```bash
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
# 编辑 .env 填入 MySQL 密码与 BSD API Token
docker compose up -d
```

浏览器访问：<http://localhost:3000>

### 方式 B：本地开发（pnpm monorepo）

```bash
pnpm install

# 终端 1：后端 :3002
cd apps/server && pnpm dev

# 终端 2：前端 :5173
cd apps/web && pnpm dev
```

> 首次启动：复制 `apps/server/.env.example` → `apps/server/.env`，确保 MySQL 和 Redis 已运行。

---

## 🏗️ 项目结构

```
cupai/
├── apps/
│   ├── web/                       # 前端 (Vue 3 + Vite)
│   │   └── src/
│   │       ├── views/             # 13 个核心页面
│   │       │   ├── HomeView           - 首页（赛事动态 + 排行榜摘要）
│   │       │   ├── MatchCenterView    - 赛事列表
│   │       │   ├── MatchDetailView    - 赛事详情（比分/阵容/统计/AI 预测/精彩集锦/天气/分享）
│   │       │   ├── MatchDataCenterView- 赛事数据中心（小组赛程 + 赛程日历）
│   │       │   ├── StandingsView      - 积分榜
│   │       │   ├── AnalysisCenterView - 分析创建中心（Prompt + 权重配置）
│   │       │   ├── AnalysisSquareView - 分析广场（公开报告流）
│   │       │   ├── PromptMarketView   - Prompt 市场
│   │       │   ├── RankingView        - 排行榜（用户 / 大模型 / Agent 平台）
│   │       │   ├── SentimentView      - 舆情分析
│   │       │   ├── SponsorView        - 赞助页
│   │       │   ├── ProfileView        - 个人中心
│   │       │   └── LoginView          - 登录/注册
│   │       ├── components/        # 公共组件
│   │       ├── stores/            # Pinia
│   │       ├── locales/           # 8 种语言
│   │       ├── api/               # HTTP + WebSocket
│   │       └── utils/             # agentPlatform / copyInstruction / flag / markdown
│   └── server/                    # 后端 (NestJS)
│       └── src/
│           ├── modules/           # 12 controllers / 8 modules
│           │   ├── user/              - 用户注册/登录/JWT
│           │   ├── ai/                - 多模型 AI 中转
│           │   ├── match/             - 赛事详情/积分榜/阵容/事件流/赔率
│           │   ├── prompt/            - Prompt CRUD + 适配校验
│           │   ├── ranking/           - 用户/模型/平台排行
│           │   ├── agent/             - Agent 调度 + 公开回调
│           │   ├── bsd/               - BSD 数据源（sync + external）
│           │   └── risk/              - 风控 + 敏感词
│           ├── services/          # WeatherService, PlayerAvatarService
│           ├── utils/             # 球员英中名映射
│           ├── config/            # Redis + Throttler
│           └── common/            # Guards + Interceptors + Filters
├── packages/
│   ├── types/                     # 统一类型
│   ├── constants/                 # 业务常量
│   └── utils/                     # 5 大算法
├── docs/                          # API 文档 + BSD 数据缺失
├── docker/                        # Nginx 配置
├── deploy/                        # init.sql
└── docker-compose.yml
```

---

## 🗺️ 版本路线图

### V1.0 — 基础闭环版 ✅

- [x] Monorepo 工程结构搭建（pnpm workspace）
- [x] 前后端骨架（Vue3 + NestJS + TypeScript）
- [x] 用户注册/登录/JWT 认证
- [x] AI 配置管理（多模型 API Key 加密）
- [x] 权重模型管理（8 因子自定义）
- [x] Prompt 模板 CRUD + 市场基础
- [x] 赛事数据中心（球队/球星/历史/环境）
- [x] 手动分析生成 + 公私权限管控
- [x] 分析广场基础功能
- [x] Docker 部署方案

### V1.1 — 生态优化版 ✅

- [x] Redis 缓存替换内存缓存
- [x] API 限流守卫（三级策略）
- [x] AI 分析完整闭环（组装 Prompt → 调 AI → 保存报告）
- [x] 社区点赞/收藏互动
- [x] 排行榜体系（用户排行 + 大模型排行）
- [x] Agent 定时任务接入真实 AI 调用
- [x] Agent 授权协议 + 用户手动触发
- [x] 风控升级：AI 内容二次审核 + 敏感词持久化
- [x] 前端暗色主题 + WebSocket 实时推送

### V1.2 — 深度体验版 ✅

- [x] 赛事详情页增强（比分板 + 8 因子数据 + 数据源溯源）
- [x] Prompt 模板适配校验（变量检测 + 预览 + 创建时校验）
- [x] 积分榜功能（小组积分 + 出线形势分析）
- [x] 用户收藏管理
- [x] 分析广场 Markdown 渲染 + 权重快照溯源
- [x] 国际化扩展至 8 种语言（中/英/西/法/葡/阿/日/韩）
- [x] 多语言 README 分文件

### V1.3 — 数据驱动版 ✅

- [x] BSD 数据源接入（赛事/球队/积分榜/赔率实时同步）
- [x] 舆情分析模块（情感概览 + 时间线 + 多维度聚合）
- [x] 前端全面对接后端真实接口（移除 Mock 默认启用）
- [x] 接口文档标准化（api-spec.md v1.5）
- [x] 赛事详情页全后端数据（AI 预测 + 舆情 + 维度报告 + 球员阵容）

### V1.4 — 赛事数据完整化 ✅

- [x] **球员中文名**（200+ 映射表 + 三级回退）
- [x] **球员头像**（TheSportsDB API，30 天缓存）
- [x] **比赛天气**（Open-Meteo API，免费无需 key）
- [x] **精彩集锦**（BSD event detail.highlights）
- [x] **赛事阵容端点** `GET /matches/:id/lineups`
- [x] **赛事事件流端点** `GET /matches/:id/incidents`
- [x] **赛事赔率端点** `GET /matches/:id/odds`
- [x] BSD 4 张子表同步端到端验证（Crystal Palace 1-1 Fulham 真实赛事）

### V1.5 — Agent 生态 + 社区 ✅

- [x] **Agent 公开回调** `POST /agent/open/dimension/submit`
- [x] **Skill.md API** `GET /agent/open/skill.md`
- [x] **Agent 平台排行榜**（第 3 个 Tab）
- [x] **全部按预测次数排序**（不再按准确率）
- [x] **LobeHub Icons**（大模型/Agent 平台徽标，三级降级）
- [x] **赞助页**（赞助商位 + 微信/支付宝收款码 + 邮箱）
- [x] **分享栏**（Twitter / Facebook / WhatsApp / 微信 / Telegram / 链接复制）
- [x] **国旗放大 + 双方分置** 赛事详情
- [x] **国旗滚动** 首页去边框铺满

### V1.6 — 规划中

- [ ] 海外舆情精准识别
- [ ] 跨境合规体系完善
- [ ] 数据监控告警、异常自动修复
- [ ] 运营方指标看板（Grafana）

---

## 🛰️ BSD 数据集成现状

15+ BSD v2 端点接入并验证。4 张详情表（`event_stats` / `event_incidents` / `event_lineups` / `event_odds`）在真实已完赛赛事（Crystal Palace 1-1 Fulham，2026-01-01）上端到端验证通过。

| 表 | 记录数 | 验证 | 备注 |
|---|---|---|---|
| matches | 202 | ✅ | 当前全部为 upcoming |
| teams | 1502 | ✅ | — |
| group_standings | 1094 | ✅ | 101 条已更新为正确小组名 |
| event_lineups | 0 | ✅ | E2E 验证 40 条（11首发+9替补×2 队） |
| event_stats | 0 | ✅ | E2E 验证 16 指标 + 28 shotmap + 92 momentum + 14 xg/min |
| event_incidents | 0 | ✅ | E2E 验证 15 事件（5 黄牌+2 进球+8 换人） |
| event_odds | 0 | ✅ | E2E 验证 schema，BSD 完赛返 null |
| dimension_submissions | 20 | ✅ | platform 从 model 名推断 |

详见 [docs/bsd-data-gaps.md](./docs/bsd-data-gaps.md)。

---

## 🛡️ 合规声明

本平台所有 AI 分析结果**仅为体育赛事数据娱乐分析与战术参考**，不构成任何投注、博弈、胜负预判建议。平台：

- ❌ 无博彩/无投注/无胜负预判功能
- ✅ 硬编码敏感词过滤
- ✅ AI 生成内容二次审核
- ✅ GDPR + 中国法律法规双重合规
- ✅ 所有用户内容自动风控审核

---

## 🤝 参与贡献

我们非常欢迎社区贡献！无论是代码、文档、翻译还是 Bug 反馈。

1. **Fork** 本仓库
2. 创建特性分支：`git checkout -b feat/amazing-feature`
3. 提交代码：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feat/amazing-feature`
5. 提交 **Pull Request**

> 详细贡献指南请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)
> 参与前请阅读 [行为准则](./CODE_OF_CONDUCT.md)

### 贡献方向

| 方向 | 说明 |
|---|---|
| 💻 **代码开发** | 前后端功能开发、算法优化、Bug 修复 |
| 🎨 **UI/UX 设计** | 页面设计优化、交互体验提升 |
| 🌍 **国际化翻译** | 8 种语言文案翻译与校对 |
| 📝 **文档完善** | 开发指南、使用教程 |
| 🧪 **测试** | 单元测试、E2E 测试、性能测试 |
| 🐛 **Bug 反馈** | Issue 提交、问题复现 |
| 📣 **社区运营** | Prompt 模板贡献、社区内容分享 |

### 贡献者

<a href="https://github.com/XieWxx/cupai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XieWxx/cupai" />
</a>

---

## 🌐 免费部署方案

CupAI 的 `docker-compose.yml` 可运行在任何支持 Docker 的环境。零成本部署详细对比见 **[docs/deployment.md](./docs/deployment.md)**（5 大类：PaaS / VPS / Serverless / 容器平台 / 国内平台）。

**TL;DR** Top 3 推荐：

| 提供方 | 免费额度 | 适用 | 注意点 |
|---|---|---|---|
| 🥇 **Fly.io** | 3 × shared-cpu-1x 256MB | 完整 Docker Compose | 需信用卡认证 |
| 🥈 **Koyeb** | 1 × nano + 免费 DB | 单容器后端 | 空闲 5min 冷启动 |
| 🥉 **雨云 / 腾讯云学生机** | ¥10-30/月 学生机 | 国内访问 + Docker Compose | 需学生认证 |

> ⚠️ **本项目不推荐**：Render（15min 强制休眠会破坏 BSD 5min 同步）、Vercel Functions（不支持 WebSocket / 持久化 node-schedule）。

---

## 💖 打赏支持

如果 CupAI 对你有帮助，欢迎小额打赏支持我们持续开发 ☕
所有打赏将用于 BSD 数据 API 续费、服务器维护与社区运营。

| 微信支付 | 支付宝 |
| :---: | :---: |
| ![微信收款码](./weixin.JPG) | ![支付宝收款码](./zhifubao.JPG) |

> ⚠️ 打赏纯属自愿，不提供任何额外权益，也**不构成**任何商业合作或服务承诺。
> 平台始终坚持 **零博彩、零投注** 原则，请知悉。

---

## 📄 开源协议

本项目基于 [Apache License 2.0](./LICENSE) 开源。

CupAI © 2024-2026 — Made with ❤️ by the CupAI community & contributors.

---

<p align="center">
  <sub>如果这个项目对你有帮助，请给我们一个 ⭐ Star！</sub>
  <br><br>
  <a href="https://star-history.com/#XieWxx/cupai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date&theme=dark" />
      <img width="500" alt="Star History Chart" src="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date" />
    </picture>
  </a>
</p>
