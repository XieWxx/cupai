<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>World Cup Custom AI Match Analysis Platform</strong><br>
  <em>世界杯自定义 AI 赛事分析预测平台</em>
</p>

<p align="center">
  <a href="https://cupai.asia/"><img src="https://img.shields.io/badge/Live_Demo-cupai.asia-2563eb?style=flat-square&logo=globe&logoColor=white" alt="Live Demo"></a>
  <a href="https://github.com/XieWxx/cupai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XieWxx/cupai?style=flat-square&color=2563eb" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue"></a>
  <a href="#"><img src="https://img.shields.io/badge/NestJS-latest-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/Redis-latest-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
</p>

<p align="center">
  🌐 Multilingual README /
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

## Overview

**CupAI** is a **purely data-driven + user-private-AI** World Cup match analysis platform for football fans worldwide. The platform does not include built-in AI generation capabilities — instead, it positions itself as a "comprehensive match data service provider + analysis tool carrier." It delivers complete, real-time, and precise underlying match data, while users configure their own private LLMs, customize Prompts, adjust match factor weights, and independently perform in-depth match analysis.

### Key Differentiators

| Feature | Description |
|---------|-------------|
| 🔑 **User-Private LLMs** | Supports Doubao, DeepSeek, GPT, Qwen and more — users bring their own API Keys, zero AI cost for the platform |
| 🧩 **Custom Prompt Marketplace** | Create, share, and reuse Prompt templates — building the best football analysis template library |
| ⚖️ **Adjustable Factor Weights** | 8 analysis factor categories with 0%-100% free allocation — build your own analysis model |
| 🤖 **AI Agent Automated Reasoning** | Powered by 5 proprietary algorithms — fully automated match analysis with zero manual operation |
| 🌍 **8-Language Internationalization** | zh-CN / en-US / es-ES / fr-FR / pt-BR / ar-SA / ja-JP / ko-KR — covering major World Cup nations |
| 🛡️ **Fully Compliant Sports Analysis** | No gambling, no betting — pure tactical review and data-driven reasoning |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🖥️ **Frontend** | Vue 3 + Vite + Element Plus | Responsive UI, data dashboards, rankings |
| ⚡ **Real-time** | Socket.io | Live scores, instant push notifications |
| 📊 **Charts** | ECharts | Accuracy trends, weight distribution, sentiment scores |
| 🌐 **i18n** | vue-i18n (8 languages) | Multi-language, multi-timezone, global adaptation |
| 🔧 **Backend** | NestJS + TypeORM (TypeScript) | Modular APIs, AI relay, data processing |
| 🗄️ **Database** | MySQL 8.0 | Structured data: users, templates, reports, rankings |
| ⚡ **Cache** | Redis | Real-time caching, API rate limiting, hot data |
| ⏰ **Scheduler** | node-schedule | Agent auto-scanning, report generation, data inspection |
| 🌐 **Data Source** | BSD API | Real-time sync of matches/teams/standings/odds |
| 🐳 **Deployment** | Docker + Docker Compose + Nginx | One-click deployment, reverse proxy, SSL |

---

## Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose** (optional)

### Docker One-Click Deployment

```bash
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
docker compose up -d
```

Visit in browser: `http://localhost:3000`

### Local Development

```bash
pnpm install
pnpm dev:server   # Start backend (port 3002)
pnpm dev:web      # Start frontend (port 5173)
```

> First-time setup requires configuring `apps/server/.env` (refer to `.env.example`), and ensure MySQL and Redis are running

---

## Project Structure

```
cupai/
├── apps/
│   ├── web/                   # Frontend (Vue 3 + Vite)
│   │   └── src/
│   │       ├── views/         # Pages (12 core views)
│   │       ├── stores/        # Pinia state management
│   │       ├── locales/       # 8-language i18n
│   │       ├── api/           # API request layer + WebSocket
│   │       └── components/    # Shared components
│   └── server/                # Backend (NestJS)
│       └── src/
│           ├── modules/       # 8 business modules
│           │   ├── user/      # User module
│           │   ├── ai/        # AI relay module
│           │   ├── match/     # Match data + standings + sentiment
│           │   ├── prompt/    # Prompt marketplace + validation
│           │   ├── ranking/   # Rankings
│           │   ├── agent/     # Agent + interaction + analysis
│           │   ├── bsd/       # BSD data source sync
│           │   └── risk/      # Risk control + sensitive words
│           ├── config/        # Redis + rate limiting config
│           └── common/        # Guards + filters
├── packages/
│   ├── types/                 # Unified type definitions
│   ├── constants/             # Business constants
│   └── utils/                 # Common utility functions
├── docs/                      # API docs + data source solutions
├── docker/                    # Nginx configuration
├── deploy/                    # init.sql seed data
└── docker-compose.yml
```

---

## Version Roadmap

### V1.0 — Foundation Release ✅

- [x] Monorepo project structure (pnpm workspace)
- [x] Frontend & backend skeleton (Vue3 + NestJS + TypeScript)
- [x] User registration/login/JWT authentication
- [x] AI config management (multi-model API Key encryption)
- [x] Weight model management (8-factor customization)
- [x] Prompt template CRUD + marketplace basics
- [x] Match data center (teams/players/history/environment)
- [x] Manual analysis generation + public/private access control
- [x] Analysis square basic features
- [x] Docker deployment solution

### V1.1 — Ecosystem Enhancement ✅

- [x] Redis cache replacing in-memory cache
- [x] API rate limiting guard (3-tier strategy)
- [x] AI analysis full loop (assemble Prompt → call AI → save report)
- [x] Community likes/favorites interaction
- [x] Ranking system (user ranking + model ranking)
- [x] Agent scheduled tasks with real AI calls
- [x] Agent authorization protocol + manual trigger
- [x] Risk control upgrade: AI content secondary review + persistent sensitive words
- [x] Frontend dark theme + WebSocket real-time push

### V1.2 — Deep Experience ✅

- [x] Match detail page enhancement (scoreboard + 8-factor data + data source tracing)
- [x] Prompt template validation (variable detection + preview + creation validation)
- [x] Standings feature (group points + qualification scenario analysis)
- [x] User favorites management
- [x] Analysis square Markdown rendering + weight snapshot tracing
- [x] i18n expansion to 8 languages (zh/en/es/fr/pt/ar/ja/ko)
- [x] Multilingual README files

### V1.3 — Data-Driven Edition ✅

- [x] BSD data source integration (real-time sync of matches/teams/standings/odds)
- [x] Sentiment analysis module (sentiment overview + timeline + multi-dimensional aggregation)
- [x] Frontend fully connected to backend real APIs (removed Mock as default)
- [x] API documentation standardization (api-spec.md v1.5)
- [x] Match detail page with full backend data (AI prediction + sentiment + dimension report + player lineup)

### V1.4 — Global Complete Edition (Planned)

- [ ] Overseas sentiment precise identification
- [ ] Cross-border compliance system refinement
- [ ] Data monitoring & alerting, auto-recovery from anomalies

---

## Contributing

We warmly welcome community contributions! Whether it's code, documentation, translations, or bug reports — every contribution matters.

### How to Contribute

1. **Fork** this repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push the branch: `git push origin feat/amazing-feature`
5. Submit a **Pull Request**

> For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)
> Please read the [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing

### Contribution Areas

| Area | Description |
|------|-------------|
| 💻 **Code Development** | Frontend/backend feature development, algorithm optimization, bug fixes |
| 🎨 **UI/UX Design** | Page design improvements, interaction experience enhancements |
| 🌍 **Internationalization** | Translation and proofreading for 8 languages |
| 📝 **Documentation** | Development guides, usage tutorials |
| 🧪 **Testing** | Unit tests, E2E tests, performance tests |
| 🐛 **Bug Reports** | Issue submission, problem reproduction |
| 📣 **Community** | Prompt template contributions, community content sharing |

### Contributors

<a href="https://github.com/XieWxx/cupai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XieWxx/cupai" />
</a>

---

## Compliance Statement

All AI analysis results on this platform are **for sports data entertainment analysis and tactical reference only**, and do not constitute any betting, gambling, or match outcome prediction advice. The platform completely blocks gambling-related terms and features. All user-generated content is automatically reviewed by risk control, fully complying with Chinese laws and regulations as well as GDPR privacy compliance requirements.

---

## 💖 Sponsor / Donate

If CupAI helps you, consider a small donation to fuel ongoing development ☕
All donations go to BSD data API renewal, server maintenance, and community operations.

| WeChat Pay | Alipay |
| :---: | :---: |
| ![WeChat Pay](./weixin.JPG) | ![Alipay](./zhifubao.JPG) |

> ⚠️ Donations are purely voluntary and grant no additional entitlements or commercial commitments.
> The platform is committed to a **zero-betting, zero-gambling** policy.

---

## License

This project is licensed under the [Apache License 2.0](./LICENSE).

CupAI © 2024-2026 — Made with ❤️ by the CupAI community & contributors.

---

<p align="center">
  <sub>If this project helps you, please give us a ⭐ Star!</sub>
  <br><br>
  <a href="https://star-history.com/#XieWxx/cupai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date&theme=dark" />
      <img width="500" alt="Star History Chart" src="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date" />
    </picture>
  </a>
</p>
