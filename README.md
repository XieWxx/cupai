<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>世界杯自定义 AI 赛事分析预测平台 · World Cup Custom AI Match Analysis Platform</strong>
</p>

<p align="center">
  <a href="https://github.com/cupai/cupai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/cupai/cupai?style=flat-square&color=2563eb" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue"></a>
  <a href="#"><img src="https://img.shields.io/badge/NestJS-latest-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/Redis-latest-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
</p>

<p align="center">
  <a href="#-项目简介">🇨🇳 中文</a> ·
  <a href="#-overview">🇬🇧 English</a> ·
  <a href="#-快速开始">快速开始</a> ·
  <a href="#-技术栈">技术栈</a> ·
  <a href="#-参与贡献">参与贡献</a> ·
  <a href="#-community">Community</a>
</p>

---

## 🇨🇳 项目简介

**CupAI** 是一个面向全球球迷的**纯数据驱动 + 用户私有AI**世界杯赛事分析平台。平台不自带AI生成能力，定位为「全域赛事数据服务商 + 分析工具载体」—— 只输出完整、实时、精准的赛事底层数据，由用户配置私有大模型、自定义 Prompt、调节赛事因子权重，自主完成赛事深度分析。

### 核心差异化

| 特色 | 说明 |
|------|------|
| 🔑 **用户私有化大模型** | 支持豆包、DeepSeek、GPT、通义千问等主流模型，用户自备 API Key，平台零 AI 成本 |
| 🧩 **自定义 Prompt 市场** | 创建、分享、复用 Prompt 模板，沉淀全网最优质的足球分析模板 |
| ⚖️ **因子权重自由调节** | 8 大类分析因子 0%-100% 自由配比，打造专属分析模型 |
| 🤖 **AI Agent 全自动推演** | 5 大自研算法驱动，零操作完成全自动赛事分析 |
| 🌍 **国际化开箱即用** | 中/英/西/葡/法 多语言、多时区、全球数据源适配 |
| 🛡️ **纯合规体育分析** | 无博彩、无投注，纯粹战术复盘与数据推演 |

### 六大核心模块

```
数据层 → 用户配置层 → 自定义AI分析层 → Prompt共享社区层 → UGC内容社区层 → 权限管理层
```

1. **全域赛事数据** — 8 大类全维度赛事影响因子，实时、精准、标准化
2. **私有大模型配置** — 多模型 API Key 加密管理、连接测试、参数自定义
3. **自定义因子权重** — 自由调参、多方案保存、系统自动归一化校验
4. **Prompt 模板市场** — 上传/公开/收藏/复用，去中心化创作生态
5. **分析广场社区** — 公开分析结果共享、点赞评论、排行榜竞技
6. **国际化适配** — 多语言、多时区、全球数据源、跨境合规

---

## 🇬🇧 Overview

**CupAI** is a **data-driven, user-private AI** World Cup match analysis platform for football fans worldwide. The platform positions itself as a "global match data service provider + analysis tool carrier" — delivering only complete, real-time, and accurate raw match data, while users configure their own private LLMs, customize Prompts, and adjust match factor weights to independently conduct in-depth match analysis.

### Key Differentiators

| Feature | Description |
|---------|-------------|
| 🔑 **Bring Your Own LLM** | Supports DeepSeek, GPT, Qwen, Doubao and more. Users bring their own API keys — zero AI cost for the platform |
| 🧩 **Prompt Template Market** | Create, share, and reuse Prompt templates. Crowdsource the best football analysis templates |
| ⚖️ **Custom Factor Weights** | Freely adjust 8 categories of analysis factors (0%-100%), build your own analysis model |
| 🤖 **AI Agent Auto-Analysis** | 5 proprietary algorithms power fully automated match analysis with zero manual effort |
| 🌍 **Internationalization Ready** | Multi-language (EN/ZH/ES/PT/FR), multi-timezone, global data source adaptation |
| 🛡️ **Compliance-First** | Zero gambling content. Pure tactical analysis and data-driven insights only |

---

## 📐 技术栈 / Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🖥️ **Frontend** | Vue 3 + Vite + Element Plus | Reactive UI, data dashboards, leaderboards |
| ⚡ **Real-time** | Socket.io | Live scores, instant leaderboard updates |
| 📊 **Charts** | ECharts | Accuracy trends, weight distribution, sentiment scores |
| 🌐 **i18n** | vue-i18n + flag-icons | Multi-language, global flags |
| 🔧 **Backend** | Node.js + NestJS (TypeScript) | Modular API, AI proxy, data processing |
| 🗄️ **Database** | MySQL 8.0 | Structured data: users, templates, reports, rankings |
| ⚡ **Cache** | Redis | Real-time leaderboard cache, rate limiting, hot data |
| ⏰ **Scheduler** | node-schedule | Agent auto-scan, report generation, data patrol |
| 🐳 **Deploy** | Docker + Docker Compose + Nginx | One-click deployment, reverse proxy, SSL |

### 🧠 五大利器 / Five Proprietary Algorithms

| 算法 / Algorithm | 功能 / Purpose |
|------------------|----------------|
| 📐 动态权重归一化 | 用户自定义权重后自动浮点归一化，杜绝配比失衡 |
| 🎯 场景自适应调参 | Agent 自动识别赛事层级/队伍属性/对局特征，动态调整权重 |
| 🔇 多维数据降噪与置信度 | 过滤无效数据、分级置信度、异常值剔除 |
| 📊 社交舆情量化 | 情绪极性打分(-10~10)、舆论压力指数、专注度评分 |
| ⚖️ 跨因子制衡修正 | 多因子相互制衡互补修正，避免单一数据误导 |

---

## 🚀 快速开始 / Quick Start

### 前置要求 / Prerequisites

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose** (可选 / optional)

### Docker 一键部署 / Docker One-Click Deploy

```bash
# 克隆仓库 / Clone the repository
git clone https://github.com/cupai/cupai.git
cd cupai

# 配置环境变量 / Configure environment variables
cp .env.example .env
# 编辑 .env 填入数据库密码等配置

# 一键启动 / One-click start
docker compose up -d
```

浏览器访问 / Open in browser: `http://localhost:3000`

### 本地开发 / Local Development

```bash
# 安装依赖 / Install dependencies
pnpm install

# 启动后端 / Start backend
cd apps/server
pnpm dev

# 启动前端 / Start frontend
cd apps/web
pnpm dev
```

---

## 📁 项目结构 / Project Structure

```
cupai/
├── apps/                      # 应用工程 / Applications
│   ├── web/                   # 前端 / Frontend (Vue 3 + Vite)
│   │   ├── src/
│   │   │   ├── components/    # 公共组件 / Shared components
│   │   │   ├── views/         # 页面 / Pages
│   │   │   ├── stores/        # 状态管理 / Pinia stores
│   │   │   ├── locales/       # 国际化 / i18n locales
│   │   │   ├── api/           # API 请求层 / API layer
│   │   │   └── utils/         # 工具函数 / Utilities
│   │   └── ...
│   └── server/                # 后端 / Backend (NestJS)
│       ├── src/
│       │   ├── modules/       # 业务模块 / Business modules
│       │   │   ├── user/      # 用户模块
│       │   │   ├── ai/        # AI 中转模块
│       │   │   ├── match/     # 赛事数据模块
│       │   │   ├── prompt/    # Prompt 市场模块
│       │   │   ├── ranking/   # 榜单排行模块
│       │   │   ├── agent/     # Agent 定时任务模块
│       │   │   └── risk/      # 风控模块
│       │   ├── common/        # 公共工具 / Shared utils
│       │   └── config/        # 配置 / Configuration
│       └── ...
├── packages/                  # 共享包 / Shared packages
│   ├── types/                 # 统一类型定义 / Shared TypeScript types
│   ├── constants/             # 常量 / Shared constants
│   └── utils/                 # 公共工具 / Shared utilities
├── docker/                    # Docker 配置 / Docker configs
├── .github/                   # GitHub 配置 / GitHub workflows
├── docker-compose.yml         # 容器编排 / Container orchestration
├── pnpm-workspace.yaml        # Monorepo 工作空间 / Workspace config
├── tsconfig.json              # TypeScript 配置
└── README.md
```

---

## 🗺️ 路线图 / Roadmap

### V1.0 — 基础闭环版 / Core MVP

- [x] 项目仓库初始化与工程规范搭建
- [ ] 全维度赛事数据接入、数据时效性质控
- [ ] 用户私有 API 配置、权重自定义系统
- [ ] Prompt 模板创建、管理、基础市场
- [ ] 手动分析生成、公私权限管控
- [ ] 分析广场社区基础功能
- [ ] 内容风控与隐私安全

### V1.1 — 生态优化版 / Ecosystem Upgrade

- [ ] 完整 Prompt 模板市场（原创保护、筛选排序、优质推荐）
- [ ] Agent 全自动分析系统上线
- [ ] 社区互动功能完善（评论、收藏、热度排行）
- [ ] 数据监控告警、异常自动修复

### V1.2 — 全球化完整版 / Global Edition

- [ ] 全语种适配（西/葡/法/德/阿）
- [ ] 海外舆情精准识别
- [ ] 跨境合规体系完善
- [ ] 商业化功能预留

---

## 🤝 参与贡献 / Contributing

我们非常欢迎社区贡献！无论是代码、文档、翻译还是 Bug 反馈，每一种贡献都弥足珍贵。

We warmly welcome community contributions! Whether code, documentation, translations, or bug reports — every contribution matters.

### 如何参与 / How to Contribute

1. **Fork** 本仓库
2. 创建特性分支：`git checkout -b feat/amazing-feature`
3. 提交代码：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feat/amazing-feature`
5. 提交 **Pull Request**

> 详细贡献指南请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)  
> 参与前请阅读 [行为准则](./CODE_OF_CONDUCT.md)

### 🎯 贡献方向 / Contribution Areas

| 方向 | 说明 |
|------|------|
| 💻 **代码开发** | 前后端功能开发、算法优化、Bug 修复 |
| 🎨 **UI/UX 设计** | 页面设计优化、交互体验提升、组件开发 |
| 🌍 **国际化翻译** | 多语言文案翻译与校对 |
| 📝 **文档完善** | API 文档、开发指南、使用教程 |
| 🧪 **测试** | 单元测试、E2E 测试、性能测试 |
| 🐛 **Bug 反馈** | Issue 提交、问题复现、建议讨论 |
| 📣 **社区运营** | Prompt 模板贡献、社区内容分享、项目推广 |

### 🏅 贡献者 / Contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<a href="https://github.com/cupai/cupai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=cupai/cupai" />
</a>
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 💬 社区 / Community

- 📖 [项目文档 / Documentation](https://github.com/cupai/cupai/wiki)
- 💡 [功能建议 / Feature Requests](https://github.com/cupai/cupai/issues/new?template=feature_request.md)
- 🐛 [Bug 反馈 / Bug Reports](https://github.com/cupai/cupai/issues/new?template=bug_report.md)
- 💬 [讨论区 / Discussions](https://github.com/cupai/cupai/discussions)

---

## ⚖️ 合规声明 / Compliance

本平台所有 AI 分析结果**仅为体育赛事数据娱乐分析与战术参考**，不构成任何投注、博弈、胜负预判建议。平台全程屏蔽博彩相关词汇与功能，所有用户生成内容自动风控审核，完全符合中国法律法规及 GDPR 隐私合规要求。

---

## 📄 开源协议 / License

本项目基于 [Apache License 2.0](./LICENSE) 开源。

CupAI © 2024-2026 — Made with ❤️ by the CupAI community & contributors.

---

<p align="center">
  <sub>如果这个项目对你有帮助，请给我们一个 ⭐ Star！</sub>
  <br>
  <sub>If you find this project helpful, please give us a ⭐ Star!</sub>
  <br><br>
  <a href="https://star-history.com/#cupai/cupai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=cupai/cupai&type=Date&theme=dark" />
      <img width="600" alt="Star History Chart" src="https://api.star-history.com/svg?repos=cupai/cupai&type=Date" />
    </picture>
  </a>
</p>