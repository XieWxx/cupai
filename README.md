<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>Open-Source Customizable AI Football Match Analysis Platform</strong><br>
  <em>世界杯自定义 AI 赛事分析预测平台</em>
</p>

<p align="center">
  <a href="https://cupai.asia/"><img src="https://img.shields.io/badge/Live_Demo-cupai.asia-2563eb?style=flat-square&logo=globe&logoColor=white" alt="Live Demo"></a>
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
  🌐 Multi-language README /
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

## ✨ What is CupAI?

**CupAI** is a **fully open-source, data-driven football match analysis platform** where **users own the AI** (BYOAK — Bring Your Own API Key). It is not a betting or gambling product — it is a *sports data service + analysis toolkit* that:

- 🛰️ **Syncs every ball** — 15+ endpoints from BSD (live scores, stats, lineups, incidents, odds, H2H, social, highlights, weather, etc.) into your own database
- 🧠 **Plugs in your own LLM** — DeepSeek / Doubao / GPT / Qwen / GLM / Claude via user-supplied API Key
- 📝 **Markets the prompts** — share and reuse the best analysis templates
- ⚖️ **Tunes the weights** — 8 analysis factors (form, H2H, weather, injuries, etc.) adjustable from 0–100%
- 🏆 **Ranks everyone** — User / Model / Agent-Platform three leaderboards
- 🌍 **Speaks 8 languages** — zh / en / es / fr / pt / ar / ja / ko

> Built for indie devs, football fans, and the open-source community. 100% non-commercial, no betting, no gambling — pure tactical analysis.

---

## 🎯 Core Differentiators

| Feature | Why it matters |
|---|---|
| 🔑 **BYOAK (User-owned LLM)** | The platform never pays for AI inference. Users bring their own API key (DeepSeek / OpenAI / Qwen / Doubao). Zero AI cost to operators. |
| 🧩 **Prompt Marketplace** | Create, share, version, and reuse football-analysis prompt templates. Power users curate the best prompts. |
| ⚖️ **Factor Weight Engine** | 8 analysis factors (form, H2H, weather, injuries, lineups, home advantage, sentiment, news) — freely mix to 0–100%. |
| 🤖 **AI Agent Auto-Analysis** | 5 self-developed algorithms drive zero-touch match analysis via the Agent callback protocol. |
| 📊 **3-Tab Leaderboard** | User (predictions) / Model (platform users) / Agent-Platform (popularity) — all sorted by total predictions. |
| 🛡️ **Compliance-Only** | No betting, no gambling, no odds-tipping. Hard-coded sensitive-word filter. GDPR + 中国合规 dual-compliant. |
| 🌍 **8 Languages** | zh / en / es / fr / pt / ar / ja / ko — covers World Cup's main participating regions. |

---

## 🧩 Tech Stack

| Layer | Tech | Purpose |
|---|---|---|
| 🖥️ **Frontend** | Vue 3 + Vite + Element Plus | Responsive UI, dashboards, leaderboards |
| ⚡ **Real-time** | Socket.io | Live scores, instant push |
| 📊 **Charts** | ECharts | Accuracy trend, weight distribution, sentiment |
| 🖼️ **Icons** | LobeHub Icons (local SVG) | Brand badges for models / agent platforms |
| 🌐 **i18n** | vue-i18n (8 langs) | Multi-language, multi-timezone |
| 🛣️ **Routing** | Vue Router | 13 core pages |
| 📦 **State** | Pinia | Cross-page data flow |
| 🔧 **Backend** | NestJS 10 + TypeORM (TypeScript) | Modular API, AI relay, data orchestration |
| 🗄️ **Database** | MySQL 8.0 | Users, templates, reports, rankings |
| ⚡ **Cache** | Redis 7 | Real-time cache, rate limiting, hot data |
| ⏰ **Scheduler** | node-schedule | BSD sync (5 min), agent scanning, report generation |
| 🌐 **Data Source** | BSD API v2 | 15+ endpoints: events / teams / players / standings / stats / incidents / lineups / odds / H2H / social / metadata / weather / highlights |
| 🐳 **Deployment** | Docker + Docker Compose + Nginx | One-command deployment, reverse proxy, SSL |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose** (recommended)

### Option A: One-command Docker Deploy

```bash
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
# Edit .env with your MySQL password and BSD API token
docker compose up -d
```

Open: <http://localhost:3000>

### Option B: Local Dev (pnpm monorepo)

```bash
pnpm install

# Terminal 1: backend on :3002
cd apps/server && pnpm dev

# Terminal 2: frontend on :5173
cd apps/web && pnpm dev
```

> First-time setup: copy `apps/server/.env.example` → `apps/server/.env`, then ensure MySQL & Redis are running locally.

---

## 🏗️ Project Structure

```
cupai/
├── apps/
│   ├── web/                       # Frontend (Vue 3 + Vite)
│   │   └── src/
│   │       ├── views/             # 13 core pages
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
│   │       ├── locales/           # 8 languages
│   │       ├── api/               # HTTP + WebSocket
│   │       └── utils/             # agentPlatform / copyInstruction / flag / markdown
│   └── server/                    # Backend (NestJS)
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
├── docs/                          # API spec / BSD data gaps
├── docker/                        # Nginx config
├── deploy/                        # init.sql
└── docker-compose.yml
```

---

## 🗺️ Version Roadmap

### V1.0 — Foundation ✅

- [x] Monorepo skeleton (pnpm workspace)
- [x] Frontend + Backend scaffolds
- [x] User auth (register / login / JWT)
- [x] AI config (multi-model API key, encrypted)
- [x] Weight model (8 factors)
- [x] Prompt template CRUD + marketplace basics
- [x] Match data center (teams / players / history / venue)
- [x] Manual analysis + public/private permissions
- [x] Analysis square basics
- [x] Docker deployment

### V1.1 — Ecosystem ✅

- [x] Redis cache replaces in-memory
- [x] Three-tier API throttler
- [x] Full AI analysis loop (Prompt → AI → save)
- [x] Community likes / favorites
- [x] Leaderboards (user / model)
- [x] Agent scheduler with real AI calls
- [x] Agent consent flow + manual trigger
- [x] Risk control v2 (AI re-moderation + persistent sensitive words)
- [x] Dark theme + WebSocket push

### V1.2 — Deep UX ✅

- [x] Match detail v2 (scoreboard + 8 factors + data-source traceability)
- [x] Prompt template adapter (variable detection + preview + validate-on-create)
- [x] Group standings + advancement analysis
- [x] User favorites
- [x] Markdown rendering + weight snapshot
- [x] i18n expanded to 8 languages
- [x] Per-language README

### V1.3 — Data-Driven ✅

- [x] BSD data source (events / teams / standings / odds sync)
- [x] Sentiment module (overview + timeline + multi-dim aggregation)
- [x] Frontend fully on real APIs (Mock disabled by default)
- [x] API spec standardized (api-spec.md v1.5)
- [x] Match detail fully on backend (AI prediction + sentiment + dimension report + lineup)

### V1.4 — Match Data Complete ✅

- [x] **Player Chinese names** (200+ mapping table + 3-tier fallback)
- [x] **Player avatars** (TheSportsDB API, cached 30 days)
- [x] **Match weather** (Open-Meteo API, free, no key)
- [x] **Match highlights** (BSD event detail.highlights)
- [x] **Match lineups endpoint** (`GET /matches/:id/lineups`)
- [x] **Match incidents endpoint** (`GET /matches/:id/incidents`)
- [x] **Match odds endpoint** (`GET /matches/:id/odds`)
- [x] BSD 4-table sync verified end-to-end (Crystal Palace 1-1 Fulham)

### V1.5 — Agent Ecosystem + Community ✅

- [x] **Agent open callback** (`POST /agent/open/dimension/submit`)
- [x] **Skill.md API** (`GET /agent/open/skill.md`)
- [x] **Agent platform leaderboard** (3rd tab)
- [x] **Sort by predictions** (not accuracy) across all 3 leaderboards
- [x] **LobeHub Icons** (model/agent platform badges, 3-tier fallback)
- [x] **Sponsor page** (sponsor slots + WeChat/Alipay QR + email)
- [x] **Share bar** (Twitter / Facebook / WhatsApp / WeChat / Telegram / link copy)
- [x] **Flag zoom + dual-side placement** on match detail
- [x] **National flag ticker** (no border, full-width on home page)

### V1.6 — Planned

- [ ] Cross-border compliance (GDPR / 海外舆情)
- [ ] Data monitoring alerts + anomaly auto-repair
- [ ] Operator-side metrics dashboard (Grafana)

---

## 🛰️ BSD Data Integration Status

15+ BSD v2 endpoints integrated and verified. 4 detail tables (`event_stats` / `event_incidents` / `event_lineups` / `event_odds`) sync verified end-to-end on a real finished match (Crystal Palace 1-1 Fulham, 2026-01-01).

| Table | Records | Verified? | Notes |
|---|---|---|---|
| matches | 202 | ✅ | All `upcoming` for now |
| teams | 1502 | ✅ | — |
| group_standings | 1094 | ✅ | 101 records updated with correct group name |
| event_lineups | 0 | ✅ | E2E verified 40 records (11 starters + 9 subs × 2) |
| event_stats | 0 | ✅ | E2E verified 16 metrics + 28 shotmap + 92 momentum + 14 xg/min |
| event_incidents | 0 | ✅ | E2E verified 15 events (5 cards + 2 goals + 8 subs) |
| event_odds | 0 | ✅ | E2E verified schema; BSD returns null after match ends |
| dimension_submissions | 20 | ✅ | Platform inferred from model name |

See `docs/bsd-data-gaps.md` for the full data audit.

---

## 🛡️ Compliance

This platform provides **sports data entertainment and tactical analysis only**. It does **not** constitute betting, gambling, or wagering advice. The platform:

- ❌ No betting / gambling / odds-tipping functionality
- ✅ Hard-coded sensitive-word filter
- ✅ AI-generated content re-moderated
- ✅ GDPR + 中国法律法规 dual-compliant
- ✅ All user content subject to risk control

---

## 🤝 Contributing

We welcome all forms of contribution — code, docs, translations, bug reports.

1. **Fork** this repo
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a **Pull Request**

> See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide, and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community rules.

### Contribution Areas

| Area | Description |
|---|---|
| 💻 **Code** | Frontend / backend / algorithms / bug fix |
| 🎨 **Design** | UI/UX polish, interaction optimization |
| 🌍 **i18n** | 8-language translation & review |
| 📝 **Docs** | Dev guide, tutorials |
| 🧪 **Testing** | Unit / E2E / performance |
| 🐛 **Bug reports** | Issue, repro, fix |
| 📣 **Community** | Prompt templates, content, sharing |

### Contributors

<a href="https://github.com/XieWxx/cupai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XieWxx/cupai" />
</a>

---

## 🌐 Free Deployment Options

CupAI's `docker-compose.yml` can run anywhere Docker is supported. For zero-cost deployment, see **[docs/deployment.md](./docs/deployment.md)** for a full comparison of 5 categories (PaaS / VPS / Serverless / Container / 国内平台).

**TL;DR** (top 3 picks):

| Provider | Free Tier | Best For | Caveat |
|---|---|---|---|
| 🥇 **Fly.io** | 3 shared-cpu-1x 256MB VMs | Full Docker Compose | Card verification required |
| 🥈 **Koyeb** | 1 nano service + free DB | Single-container backend | 5-min cold start after idle |
| 🥉 **雨云 / 腾讯云学生机** | ¥10-30/月 学生机 | 国内访问 + Docker Compose | 需学生认证 |

> ⚠️ **NOT recommended for this project**: Render (15-min forced sleep breaks BSD 5-min sync), Vercel Functions (no WebSocket / no node-schedule persistence).

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

## 📄 License

This project is open-sourced under the [Apache License 2.0](./LICENSE).

CupAI © 2024-2026 — Made with ❤️ by the CupAI community & contributors.

---

<p align="center">
  <sub>If this project helps you, please give it a ⭐ Star!</sub>
  <br><br>
  <a href="https://star-history.com/#XieWxx/cupai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date&theme=dark" />
      <img width="500" alt="Star History Chart" src="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date" />
    </picture>
  </a>
</p>
