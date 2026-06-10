# CupAI：开源可定制的 AI 足球赛事分析平台

<p align="center">
  <strong>让每一位足球爱好者拥有自己的 AI 分析引擎</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vuedotjs" alt="Vue">
  <img src="https://img.shields.io/badge/NestJS-11.x-E0234E?style=flat-square&logo=nestjs" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/i18n-8_languages-brightgreen?style=flat-square" alt="i18n">
</p>

---

## 1. 项目概述

### 1.1 背景与定位

在体育数据分析领域，高质量的 AI 赛事分析长期以来被商业平台垄断，普通开发者和球迷难以获得可定制、可审计的分析工具。**CupAI** 应运而生 —— 它是一款 **完全开源、数据驱动** 的足球赛事分析平台，核心理念是 **"用户拥有 AI"**（BYOAK — Bring Your Own API Key）。

CupAI 不是博彩或赌博产品，而是一个 **体育数据服务 + 分析工具包**。平台不参与任何形式的赔率推荐或投注引导，所有功能均围绕纯粹的战术分析与数据洞察展开。

### 1.2 核心理念：BYOAK（自带密钥）

CupAI 最大的差异化设计在于 **平台零 AI 推理成本**。用户自行提供大模型 API 密钥（支持 DeepSeek / OpenAI / Qwen / 豆包 / Claude 等），平台仅负责：

- 赛事数据的采集、清洗与同步
- 分析权重的算法处理与优化
- Prompt 模板的管理与复用
- AI 请求的安全中转与结果展示

这种架构使得运营者无需承担高昂的 AI 推理费用，同时让用户完全掌控自己的数据和模型选择。

### 1.3 项目规模

| 维度 | 数据 |
| --- | --- |
| 代码仓库 | Monorepo（pnpm workspace） |
| 核心页面 | 13 个 |
| 后端模块 | 8 个核心模块 |
| 数据源端点 | 15+ BSD API v2 端点 |
| 支持语言 | 8 种（zh / en / es / fr / pt / ar / ja / ko） |
| 自研算法 | 5 大核心算法 |
| 版本迭代 | V1.0 → V1.5，持续演进中 |

---

## 2. 核心功能与特性

### 2.1 赛事数据全维度同步

平台通过 BSD（体育数据服务商）API 实现了 15+ 端点的数据同步，覆盖赛事的每一个细节：

| 数据类别 | 具体内容 | 同步频率 |
| --- | --- | --- |
| 基础赛事 | 赛程、比分、阶段 | 5 分钟 |
| 球队/球员 | 名单、历史战绩、球员头像 | 每日 |
| 积分榜 | 小组排名、晋级分析 | 5 分钟 |
| 事件流 | 进球、红黄牌、换人 | 实时 |
| 阵容 | 首发 11 人 + 替补 | 赛前 |
| 技术统计 | 16 项指标 + 射门图 + 动量 | 赛中实时 |
| 赔率 | 赛前/赛中赔率 | 5 分钟 |
| 天气 | 温度、湿度、风速、天气状况 | 每小时 |
| 舆情 | 社交媒体情感分析 | 30 分钟 |
| 集锦 | 赛事精彩片段 | 赛后 |

### 2.2 AI Agent 智能分析引擎

Agent 系统是 CupAI 的核心竞争力，它实现了一条完整的自动化分析闭环：

**分析流程（五步闭环）：**

```
获取赛事数据 → 算法处理权重 → 组装 Prompt → 调用 AI 中转 → 保存报告
```

1. **数据聚合**：从数据库拉取赛事完整信息（对阵双方、历史战绩、天气、阵容、赔率等）
2. **权重处理**：将用户配置的 8 大分析因子权重经过四步算法处理
3. **Prompt 注入**：将处理后的数据和权重注入 Prompt 模板
4. **AI 推理**：通过用户自带的 API Key 调用大模型生成分析报告
5. **结果存储**：报告持久化到数据库，可选择公开分享

### 2.3 八大分析因子权重引擎

CupAI 提供 8 个可自由调节的分析维度，每个因子权重可在 0–100% 之间滑动：

| 因子 | 说明 | 典型应用场景 |
| --- | --- | --- |
| 历史战绩 (Form) | 近 N 场比赛表现 | 评估状态趋势 |
| 球队实力 (Team Strength) | 阵容身价、世界排名 | 纸面实力对比 |
| 球员状态 (Player Status) | 伤病、体能、停赛 | 关键球员缺失影响 |
| 实时动态 (Realtime Dynamic) | 控球率、射门、角球 | 场面主动方判断 |
| 环境因素 (Environment) | 天气、场地、海拔 | 极端环境影响 |
| 战术克制度 (Tactical Counter) | 阵型相克、打法适配 | 战术层面博弈 |
| 舆情热度 (Social Sentiment) | 球迷情绪、媒体关注 | 心理压力评估 |
| 隐性因素 (Hidden Factors) | 裁判、赛程密度、德比 | 非技术变量考量 |

### 2.4 Prompt 市场

CupAI 内置了 Prompt 模板市场，用户可以：

- **创建与发布**：编写足球分析 Prompt 模板，设置变量占位符（`{{weights}}`、`{{matchData}}`、`{{timestamp}}`）
- **浏览与复用**：查看社区公开模板，一键复用到自己的分析中
- **收藏与管理**：收藏优质模板，建立自己的分析工具箱
- **版本追踪**：模板使用量统计，热门模板排行

### 2.5 三维排行榜体系

CupAI 设计了三种维度的排行榜，均按 **分析总数** 排序：

| 排行榜 | 统计对象 | 排序依据 |
| --- | --- | --- |
| 用户榜 (User) | 平台注册用户 | 分析报告生成量 |
| 模型榜 (Model) | 大模型（DeepSeek / GPT 等） | 平台用户使用频次 |
| Agent 平台榜 (Platform) | 第三方 Agent 平台 | 回调提交的分析数 |

### 2.6 多语言与国际化

平台支持 8 种语言，覆盖世界杯主要参赛地区。不仅前端 UI 实现完整 i18n，README 文档也提供了 8 种语言的独立版本。

---

## 3. 技术架构与实现细节

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    用户浏览器                          │
│              Vue 3 + Element Plus + ECharts           │
└────────────┬────────────────────────┬────────────────┘
             │ HTTP/REST              │ WebSocket
             ▼                        ▼
┌─────────────────────────────────────────────────────┐
│                   Nginx (反向代理)                     │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              NestJS 后端服务 (:3001)                   │
│  ┌─────────┐ ┌──────┐ ┌────────┐ ┌──────────────┐  │
│  │  User   │ │  AI  │ │ Match  │ │    Agent     │  │
│  │ Module  │ │Module│ │ Module │ │   Module     │  │
│  └─────────┘ └──────┘ └────────┘ └──────────────┘  │
│  ┌─────────┐ ┌──────┐ ┌────────┐ ┌──────────────┐  │
│  │ Prompt  │ │Ranking│ │  BSD   │ │    Risk      │  │
│  │ Module  │ │Module│ │ Module │ │   Module     │  │
│  └─────────┘ └──────┘ └────────┘ └──────────────┘  │
└──────┬────────────────────┬─────────────────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐   ┌────────────────┐
│  MySQL 8.0   │   │   Redis 7      │
│  (持久化存储)  │   │  (缓存/限流)    │
└──────────────┘   └────────────────┘
```

### 3.2 技术栈详解

| 层级 | 技术选型 | 选型理由 |
| --- | --- | --- |
| **前端框架** | Vue 3 + Vite | 响应式数据绑定，构建速度快，生态成熟 |
| **UI 组件库** | Element Plus | 企业级中后台 UI，中文社区活跃 |
| **图表** | ECharts | 高性能可视化，支持复杂交互图表 |
| **国际化** | vue-i18n | Vue 生态原生 i18n 方案，支持懒加载 |
| **状态管理** | Pinia | Vue 3 官方推荐，TypeScript 友好 |
| **后端框架** | NestJS 11 | 模块化架构，装饰器风格，企业级 Node.js |
| **ORM** | TypeORM | TypeScript 原生支持，Active Record + Data Mapper |
| **数据库** | MySQL 8.0 | 事务支持完善，社区成熟，utf8mb4 全字符集 |
| **缓存** | Redis 7 | 高性能 KV 存储，支持发布订阅、限流 |
| **实时通信** | Socket.io | 自动降级兼容，WebSocket 首选方案 |
| **定时任务** | @nestjs/schedule | 内置 cron 支持，数据同步调度 |
| **容器化** | Docker + Compose | 一键部署，环境一致，水平扩展友好 |

### 3.3 五大自研算法

CupAI 最核心的技术资产是位于 `packages/utils` 中的五大算法，它们共同构成了权重处理和数据分析的基础：

#### 算法一：权重归一化 (Normalize)

将用户配置的原始权重转换为 0–100 标准化区间，确保所有因子权重之和为 100%。

```typescript
// 归一化处理：确保权重在有效范围内且总和为 100
const normalized = normalizeWeights(rawWeights)
```

#### 算法二：极值修正 (Smooth Extreme)

检测并修正用户设置的极端权重（如某因子设为 100%，其他为 0%），防止单一因子主导分析结果。

```typescript
// 极值修正：平滑过度集中的权重分布
const smoothed = smoothExtremeWeights(normalized)
```

#### 算法三：跨因子制衡 (Cross-Factor Balance)

识别相互关联的分析因子（如"球队实力"与"球员状态"），在二者权重失衡时自动引入制衡系数。

```typescript
// 跨因子制衡：平衡关联因子间的权重关系
const balanced = crossFactorBalance(smoothed)
```

#### 算法四：冲突检测 (Conflict Detection)

检测权重配置中存在的逻辑矛盾（如"历史战绩"和"实时动态"同时设为极低值，而"球队实力"极高）。

```typescript
// 冲突检测：识别矛盾的权重配置并给出警告
const conflicts = detectConflicts(rawWeights)
```

#### 算法五：场景自适应 (Adaptive Adjustment)

根据赛事场景（小组赛/淘汰赛/德比/中立场等）自动微调权重，例如淘汰赛阶段自动提升"隐性因素"权重。

```typescript
// 场景自适应：根据赛事阶段和环境动态调整权重
const scene = detectScene(stage, isDerby, isNeutral)
const finalWeights = adaptiveAdjust(balanced, scene, envContext)
```

**完整权重处理流水线：**

```typescript
// 四步完整处理流程
processWeights(rawWeights, scene, envContext) {
  const normalized  = normalizeWeights(rawWeights)     // 步骤1：归一化
  const smoothed    = smoothExtremeWeights(normalized)  // 步骤2：极值修正
  const balanced    = crossFactorBalance(smoothed)      // 步骤3：跨因子制衡
  const finalWeights = scene                            // 步骤4：场景自适应
    ? adaptiveAdjust(balanced, scene, envContext)
    : balanced
  const conflicts   = detectConflicts(rawWeights)      // 附加：冲突检测
  return { original, normalized, smoothed, balanced, final, conflicts, scene }
}
```

### 3.4 AI 中转服务设计

AI 中转服务是 CupAI 架构中的关键组件，实现了用户私有模型的安全代理调用：

```typescript
// AI 中转服务核心逻辑
async proxyAiRequest(apiEndpoint: string, apiKey: string, payload: Record<string, unknown>) {
  const maxRetries = 3  // 最大重试次数
  const timeout = 60000 // 超时时间 60s

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = axios.create({
        baseURL: apiEndpoint,
        headers: { Authorization: `Bearer ${apiKey}` }
      })
      const response = await client.post('/chat/completions', payload, { timeout })
      return response.data
    } catch (error) {
      // 401/403 不重试，直接抛出
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('API 密钥无效或无权限')
      }
      // 其他错误分级重试（1s / 2s / 3s 间隔）
      await new Promise(resolve => setTimeout(resolve, attempt * 1000))
    }
  }
}
```

**关键设计决策：**

- **密钥不落盘**：用户 API Key 仅在前端加密存储，后端以临时参数形式接收，用完即清
- **分级重试**：网络类错误指数退避重试，鉴权类错误即时失败
- **多模型兼容**：统一 OpenAI 兼容格式，支持 DeepSeek / Qwen / GPT / Claude / 豆包

### 3.5 BSD 数据同步机制

BSD 数据同步是平台的"血液"，通过 `@nestjs/schedule` 定时任务驱动：

```
┌──────────────┐     5min cron      ┌──────────────────┐
│  Scheduler   │ ──────────────────▶ │  BSD Sync Service │
└──────────────┘                    └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
             ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
             │ 赛事列表同步  │         │ 积分榜同步    │         │ 球队详情同步  │
             │ /events      │         │ /standings   │         │ /teams       │
             └─────────────┘         └─────────────┘         └─────────────┘
```

**同步策略：**

- 基础数据（赛事、球队、球员）：定时全量同步
- 实时数据（比分、事件）：高频增量同步
- 赛后数据（统计、阵容、赔率）：赛后单次同步并归档
- 缓存层：Redis 缓存热数据，减少数据库查询压力

### 3.6 Docker 容器化部署

CupAI 提供完整的 Docker Compose 一键部署方案，包含四个核心服务：

```yaml
services:
  mysql:    # MySQL 8.0 数据库
  redis:    # Redis 7 缓存
  server:   # NestJS 后端服务 (:3001)
  web:      # Nginx + Vue 前端 (:80/:443)
```

每个服务均配置了健康检查 (`healthcheck`)，后端服务依赖数据库和 Redis 的健康状态后才启动，前端的 Nginx 在后端就绪后才对外暴露，确保启动顺序正确。

---

## 4. 开发亮点与挑战

### 4.1 技术亮点

#### 1. Monorepo 工程化架构

采用 pnpm workspace 管理三个子包（`apps/web`、`apps/server`、`packages/*`），共享类型定义（`@cupai/types`）、业务常量（`@cupai/constants`）和工具算法（`@cupai/utils`），消除了前后端类型不一致的问题。

#### 2. 五步权重处理流水线

并非简单地将用户权重直接传入 AI，而是经过"归一化 → 极值修正 → 跨因子制衡 → 场景自适应"四步算法处理，同时输出冲突检测报告。这套流程在 V1.5 经过真实验证比赛（Crystal Palace 1-1 Fulham）的端到端校验。

#### 3. 三方 Agent 开放生态

CupAI 不仅是一个分析平台，更是一个开放的 Agent 生态。通过公开回调接口 (`POST /agent/open/dimension/submit`) 和 Skill.md API (`GET /agent/open/skill.md`)，第三方 Agent 平台可以集成 CupAI 的分析能力，提交分析结果并参与排行榜竞争。

#### 4. 多层级数据校验

BSD 数据同步经过 4 层级校验：

- **Schema 校验**：TypeORM Entity 定义即数据契约
- **业务校验**：比分范围、时间线逻辑一致性
- **端到端校验**：真实验证比赛完整数据链路
- **异常告警**：同步失败自动重试 + 日志记录

#### 5. 合规优先设计

内建风控模块 (`RiskModule`)，包含：

- 硬编码敏感词过滤器
- AI 生成内容二次审核
- GDPR + 中国法律法规双重合规
- 零博彩、零赌博的功能边界硬约束

### 4.2 关键挑战与解决方案

| 挑战 | 解决方案 |
| --- | --- |
| **多模型 API 格式不一致** | 统一 OpenAI 兼容格式作为中间层，各模型差异在 AI 中转服务中适配 |
| **球员中文名称缺失** | 建立 200+ 球员英中名映射表 + 3 级回退策略（中文映射 → 英文名 → 音译） |
| **实时数据推送延迟** | Redis 缓存热数据 + WebSocket 推送，BSD 数据 5 分钟同步周期 |
| **权重配置极端化** | 五步算法流水线自动修正极端权重，同时保留用户原始配置快照 |
| **国际化维护成本高** | 8 种语言的翻译文件集中管理，README 文档按语言独立维护 |
| **Agent 报告的隐私与公开平衡** | Agent 报告强制公开且不可逆转为私密，手动报告可自由切换 |

---

## 5. 使用指南

### 5.1 环境要求

| 依赖 | 最低版本 |
| --- | --- |
| Node.js | >= 18.x |
| MySQL | >= 8.0 |
| Redis | >= 6.x |
| Docker & Docker Compose | 推荐（简化部署） |

### 5.2 快速部署（Docker）

```bash
# 克隆项目
git clone https://github.com/XieWxx/cupai.git
cd cupai

# 配置环境变量
cp .env.example .env
# 编辑 .env：填入 MySQL 密码、BSD API Token、Agent AI Key 等

# 一键启动
docker compose up -d
```

启动后访问 `http://localhost:3000` 即可使用。

### 5.3 本地开发

```bash
# 安装依赖
pnpm install

# 终端 1：启动后端 (:3002)
cd apps/server && pnpm dev

# 终端 2：启动前端 (:5173)
cd apps/web && pnpm dev
```

> 首次启动需将 `apps/server/.env.example` 复制为 `apps/server/.env`，并确保本地 MySQL 和 Redis 服务运行中。

### 5.4 核心使用流程

1. **注册登录** → 创建个人账号
2. **配置 AI** → 在个人中心添加大模型 API Key（支持 DeepSeek / OpenAI / Qwen 等）
3. **浏览赛事** → 在赛事中心查看即将进行的比赛
4. **创建分析** → 选择赛事、配置 8 因子权重、选择 Prompt 模板
5. **生成报告** → 系统自动调用算法处理权重，通过你的 AI Key 生成分析报告
6. **分享社区** → 将报告设为公开，在分析广场与他人交流

### 5.5 自定义 Prompt 模板

Prompt 模板支持三个内置变量占位符：

| 变量 | 说明 |
| --- | --- |
| `{{weights}}` | 处理后的大因子权重数据 |
| `{{matchData}}` | 赛事完整数据 JSON |
| `{{timestamp}}` | 分析生成时间戳 |

示例 Prompt 模板：

```markdown
你是一位专业的足球赛事分析师。请基于以下数据进行深度分析：

## 权重配置
{{weights}}

## 赛事数据
{{matchData}}

## 分析要求
1. 按权重优先级逐项分析各维度数据
2. 双方优势与劣势对比
3. 综合预测结论
4. 标注数据置信度和不确定性因素

分析时间：{{timestamp}}
```

---

## 6. 未来发展规划

### 6.1 V1.6（规划中）

| 任务 | 优先级 | 说明 |
| --- | --- | --- |
| 跨境合规增强 | 高 | GDPR 深度适配，海外舆情数据合规处理 |
| 数据监控告警 | 高 | BSD 同步异常自动告警 + 数据修复机制 |
| 运维监控面板 | 中 | Grafana 集成，运营侧指标可视化 |

### 6.2 中长期规划

| 方向 | 描述 |
| --- | --- |
| **多运动扩展** | 架构已预留扩展点，支持篮球、网球等更多运动品类的数据接入与分析 |
| **分析模型市场** | 将权重模型作为可交易/可共享的数字资产，构建分析模型的创作者经济 |
| **移动端适配** | PWA 或 React Native 移动端，支持赛事推送与轻量分析 |
| **社区治理** | DAO 化的社区治理模型，Prompt 模板、权重模型的去中心化策展 |
| **数据源扩展** | 接入更多免费/开放的体育数据源，降低对单一 BSD 源的依赖 |

### 6.3 社区贡献方向

CupAI 欢迎各种形式的贡献：

| 贡献领域 | 内容 |
| --- | --- |
| 代码开发 | 前后端功能开发、Bug 修复、算法优化 |
| UI/UX 设计 | 交互优化、暗色主题完善、移动端适配 |
| 国际化 | 8 语言翻译校对与新语言支持 |
| 文档 | 开发指南、API 文档、教程编写 |
| 测试 | 单元测试、E2E 测试、性能测试 |
| Prompt 生态 | 创建优质分析 Prompt 模板，丰富模板市场 |

---

## 结语

CupAI 的愿景是打造一个 **开放、透明、用户自主** 的体育数据分析生态。在这个生态中——

- **开发者** 可以学习现代化的全栈架构实践（NestJS + Vue 3 + Docker）
- **球迷** 可以获得不输商业平台的 AI 分析能力
- **AI 从业者** 可以探索"用户自带模型"这一新型 SaaS 架构范式
- **数据爱好者** 可以基于开源算法进行二次创新

如果你对体育数据分析感兴趣，欢迎 Star、Fork、PR，一起构建更好的 CupAI！

---

<p align="center">
  <a href="https://github.com/XieWxx/cupai">GitHub: github.com/XieWxx/cupai</a>
  <br>
  <sub>Apache License 2.0 · CupAI © 2024-2026</sub>
</p>