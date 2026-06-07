<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>世界杯自定义 AI 赛事分析预测平台</strong><br>
  <em>World Cup Custom AI Match Analysis Platform</em>
</p>

<p align="center">
  <a href="https://github.com/XieWxx/cupai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XieWxx/cupai?style=flat-square&color=2563eb" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue"></a>
  <a href="#"><img src="https://img.shields.io/badge/NestJS-latest-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/Redis-latest-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
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

## 项目简介

**CupAI** 是一个面向全球球迷的**纯数据驱动 + 用户私有AI**世界杯赛事分析平台。平台不自带AI生成能力，定位为「全域赛事数据服务商 + 分析工具载体」—— 只输出完整、实时、精准的赛事底层数据，由用户配置私有大模型、自定义 Prompt、调节赛事因子权重，自主完成赛事深度分析。

### 核心差异化

| 特色 | 说明 |
|------|------|
| 🔑 **用户私有化大模型** | 支持豆包、DeepSeek、GPT、通义千问等主流模型，用户自备 API Key，平台零 AI 成本 |
| 🧩 **自定义 Prompt 市场** | 创建、分享、复用 Prompt 模板，沉淀全网最优质的足球分析模板 |
| ⚖️ **因子权重自由调节** | 8 大类分析因子 0%-100% 自由配比，打造专属分析模型 |
| 🤖 **AI Agent 全自动推演** | 5 大自研算法驱动，零操作完成全自动赛事分析 |
| 🌍 **8 种语言国际化** | 中/英/西/法/葡/阿/日/韩，覆盖世界杯主要参赛国和地区 |
| 🛡️ **纯合规体育分析** | 无博彩、无投注，纯粹战术复盘与数据推演 |

---

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 🖥️ **前端** | Vue 3 + Vite + Element Plus | 响应式 UI、数据看板、排行榜 |
| ⚡ **实时通信** | Socket.io | 实时比分、即时推送 |
| 📊 **图表** | ECharts | 准确率趋势、权重分布、舆情评分 |
| 🌐 **国际化** | vue-i18n (8 语言) | 多语言、多时区、全球适配 |
| 🔧 **后端** | NestJS + TypeORM (TypeScript) | 模块化 API、AI 中转、数据处理 |
| 🗄️ **数据库** | MySQL 8.0 | 结构化数据：用户、模板、报告、排行 |
| ⚡ **缓存** | Redis | 实时缓存、API 限流、热数据 |
| ⏰ **调度** | node-schedule | Agent 自动扫描、报告生成、数据巡检 |
| 🌐 **数据源** | BSD API | 赛事/球队/积分榜/赔率实时同步 |
| 🐳 **部署** | Docker + Docker Compose + Nginx | 一键部署、反向代理、SSL |

---

## 快速开始

### 前置要求

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose**（可选）

### Docker 一键部署

```bash
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
docker compose up -d
```

浏览器访问: `http://localhost:3000`

### 本地开发

```bash
pnpm install
pnpm dev:server   # 启动后端（端口 3002）
pnpm dev:web      # 启动前端（端口 5173）
```

> 首次启动需配置 `apps/server/.env`（参考 `.env.example`），并确保 MySQL 和 Redis 已运行

---

## 项目结构

```
cupai/
├── apps/
│   ├── web/                   # 前端 (Vue 3 + Vite)
│   │   └── src/
│   │       ├── views/         # 页面（12 个核心页面）
│   │       ├── stores/        # Pinia 状态管理
│   │       ├── locales/       # 8 种语言国际化
│   │       ├── api/           # API 请求层 + WebSocket
│   │       └── components/    # 公共组件
│   └── server/                # 后端 (NestJS)
│       └── src/
│           ├── modules/       # 8 个业务模块
│           │   ├── user/      # 用户模块
│           │   ├── ai/        # AI 中转模块
│           │   ├── match/     # 赛事数据 + 积分榜 + 舆情
│           │   ├── prompt/    # Prompt 市场 + 校验
│           │   ├── ranking/   # 排行榜
│           │   ├── agent/     # Agent + 互动 + 分析
│           │   ├── bsd/       # BSD 数据源同步
│           │   └── risk/      # 风控 + 敏感词
│           ├── config/        # Redis + 限流配置
│           └── common/        # 守卫 + 过滤器
├── packages/
│   ├── types/                 # 统一类型定义
│   ├── constants/             # 业务常量
│   └── utils/                 # 公共工具函数
├── docs/                      # 接口文档 + 数据源方案
├── docker/                    # Nginx 配置
├── deploy/                    # init.sql 种子数据
└── docker-compose.yml
```

---

## 版本路线图

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

### V1.4 — 全球化完整版（规划中）

- [ ] 海外舆情精准识别
- [ ] 跨境合规体系完善
- [ ] 数据监控告警、异常自动修复

---

## 参与贡献

我们非常欢迎社区贡献！无论是代码、文档、翻译还是 Bug 反馈，每一种贡献都弥足珍贵。

### 如何参与

1. **Fork** 本仓库
2. 创建特性分支：`git checkout -b feat/amazing-feature`
3. 提交代码：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feat/amazing-feature`
5. 提交 **Pull Request**

> 详细贡献指南请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)
> 参与前请阅读 [行为准则](./CODE_OF_CONDUCT.md)

### 贡献方向

| 方向 | 说明 |
|------|------|
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

## 合规声明

本平台所有 AI 分析结果**仅为体育赛事数据娱乐分析与战术参考**，不构成任何投注、博弈、胜负预判建议。平台全程屏蔽博彩相关词汇与功能，所有用户生成内容自动风控审核，完全符合中国法律法规及 GDPR 隐私合规要求。

---

## 开源协议

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
