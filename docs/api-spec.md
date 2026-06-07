# CupAI 前端接口规范文档

> **版本**：v1.5 · **最后更新**：2026-06-07
> **适用项目**：`apps/web` (Vue 3 + Pinia) ↔ `apps/server` (NestJS)
> **文档维护**：前端 / 后端共同维护 · 任何接口变更须同步更新本文档

---

## 0. 阅读指引

本文档共分四部分：

1. [§1 全局约定](#1-全局约定) — `baseURL`、鉴权、响应结构、分页、错误码
2. [§2 页面 × 接口总览](#2-页面--接口总览) — 按前端页面汇总所用接口
3. [§3 接口详细规范](#3-接口详细规范) — 按后端模块给出每个接口的请求 / 响应 / 字段说明
4. [§4 附录](#4-附录) — 未实现接口、Mock 说明、变更记录

---

## 1. 全局约定

### 1.1 基础信息

| 项目 | 值 |
|---|---|
| API 前缀 | `/api/v1`（由 `VITE_API_BASE_URL` 覆盖） |
| 超时 | 30 000 ms |
| 内容类型 | `application/json; charset=utf-8` |
| 字符集 | UTF-8 |
| 时区 | 所有时间字段统一返回 ISO 8601（`2026-06-07T10:00:00.000Z`），前端按需 `new Date(...)` 格式化 |

### 1.2 请求头

| Header | 是否必填 | 说明 |
|---|---|---|
| `Content-Type` | ✅ | `application/json`（由 Axios 自动注入） |
| `Authorization` | 视接口 | `Bearer <jwt-token>`，受保护接口必须携带 |

前端请求拦截器（`apps/web/src/api/request.ts`）自动从 `localStorage.cupai_token` 注入 `Authorization`；未登录接口可不携带。

### 1.3 统一响应结构

后端 `TransformInterceptor` 统一返回以下结构：

```ts
interface ApiResponse<T> {
  code: number        // 业务状态码：0 成功；非 0 失败
  message: string     // 提示信息（i18n 由前端处理）
  data: T             // 业务负载
}
```

- 前端 `http` 工具自动 `unwrap`：`code === 0` 时直接返回 `data`；否则 `ElMessage.error(message)` 并 `Promise.reject`
- 分页接口的 `data` 通常是 `{ list, total, page, pageSize }`

### 1.4 鉴权约定

- `AuthGuard('jwt')` 守卫的接口必须登录
- 401 响应：前端自动清空 token + 跳转 `/login`
- 403 响应：提示 `common.noPermission`

### 1.5 分页约定

| Query 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `page` | number | `1` | 页码（从 1 开始） |
| `pageSize` | number | `20` | 每页条数 |

响应：

```ts
{
  list: T[],
  total: number,
  page: number,
  pageSize: number
}
```

### 1.6 错误码

| `code` | `HTTP status` | 含义 |
|---|---|---|
| `0` | 200 | 成功 |
| `400` | 400 | 请求参数错误（`BadRequestException`） |
| `401` | 401 | 未登录 / token 失效 |
| `403` | 403 | 无权限 |
| `404` | 404 | 资源不存在 |
| `409` | 409 | 业务冲突（如：重复创建默认模型） |
| `500` | 500 | 服务器内部错误 |

> ⚠️ 业务 `code` 字段约定与 HTTP status 解耦；前端以 HTTP status 判断权限与登录态（见 §1.4），以 `message` 字段提示用户。

---

## 2. 页面 × 接口总览

### 2.1 页面清单

| # | 路由 | 页面文件 | 主要职责 |
|---|---|---|---|
| 1 | `/` | `HomeView.vue` | 首页：赛事动态、排行榜摘要（高准确率用户 / 热门大模型 / 热门 Agent 平台） |
| 2 | `/match` | `MatchCenterView.vue` | 赛事数据中心：列表 + 状态 / 阶段筛选 |
| 3 | `/match/:id` | `MatchDetailView.vue` | 赛事详情：比分、AI 预测、用户预测排行 |
| 3' | `/match-center` | `MatchDataCenterView.vue` | 赛事数据中心：积分榜 / 小组赛程 / 淘汰赛对阵图 三 Tab |
| 4 | `/standings` | `StandingsView.vue` | 积分榜 / 出线形势 |
| 5 | `/ranking` | `RankingView.vue` | 排行榜：用户 / 大模型 / Agent 平台 |
| 6 | `/analysis` | `AnalysisCenterView.vue` | AI 分析中心：AI 配置 + 权重模型 + 手动分析 |
| 7 | `/square` | `AnalysisSquareView.vue` | 分析广场：公开报告 + 点赞 / 收藏 |
| 8 | `/prompt` | `PromptMarketView.vue` | 提示词市场 |
| 9 | `/sentiment` | `SentimentView.vue` | 海外舆情数据 |
| 10 | `/profile` | `ProfileView.vue` | 个人中心：信息 + API Key |
| 11 | `/login` | `LoginView.vue` | 登录 / 注册 |

### 2.2 总览矩阵

| 页面 | 调用接口（方法 + 路径） | 鉴权 |
|---|---|---|
| **HomeView** | `GET /match/dynamics` · `GET /ranking/users` · `GET /ranking/models` · `GET /ranking/platforms` | ❌ |
| **MatchCenterView** | `GET /match` | ❌ |
| **MatchDetailView** | `GET /match/{id}` · `GET /matches/{id}/prediction` · `GET /match/teams/{id}` · `GET /sentiment/match/{matchId}` · `GET /sentiment/team/{teamId}` | ❌ |
| **MatchDataCenterView** | `GET /match/standings` · `GET /match` · `GET /match/bracket` | ❌ |
| **StandingsView** | `GET /match/standings` · `GET /match/advance/{group}` | ❌ |
| **RankingView** | `GET /ranking/users` · `GET /ranking/models` · `GET /ranking/my` | ❌ / ✅ |
| **AnalysisCenterView** | `GET /ai/config` · `POST /ai/config` · `DELETE /ai/config/{id}` · `POST /ai/test-connection` · `GET /ranking/model` · `POST /ranking/model` · `PUT /ranking/model/{id}` · `DELETE /ranking/model/{id}` · `PUT /ranking/model/{id}/default` · `POST /analysis/manual` | ✅ |
| **AnalysisSquareView** | `GET /analysis/square` · `POST /analysis/interaction` · WebSocket：`/ws/square` | ❌ / ✅ |
| **PromptMarketView** | `GET /prompt/market` · `POST /prompt` · `POST /prompt/{id}/collect` | ❌ / ✅ |
| **SentimentView** | `GET /sentiment/overview` · `GET /sentiment/timeline` · `GET /sentiment/charts`¹ | ❌ |
| **ProfileView** | `GET /user/profile` · `PUT /user/profile` | ✅ |
| **LoginView** | `POST /user/register` · `POST /user/login` | ❌ |

> ¹ 后端暂未实现（见 §4.1），前端用 `try/catch` 静默忽略失败。

---

## 3. 接口详细规范

> 章节顺序按后端模块组织；每个接口包含：基本信息 → 请求参数 → 响应结构 → 字段说明 → 调用场景。

### 3.1 `user` — 用户模块

#### 3.1.1 `POST /user/register`

- **鉴权**：否
- **请求头**：`Content-Type: application/json`
- **请求体**：

| 字段 | 类型 | 必填 | 含义 | 示例 |
|---|---|---|---|---|
| `username` | string | ✅ | 用户名（3-50 字符，唯一） | `"eufan2026"` |
| `password` | string | ✅ | 密码（≥6 字符） | `"CupAI!2026"` |
| `nickname` | string | ✅ | 昵称 | `"球迷E"` |
| `region` | string | ✅ | 国家/地区代码（ISO 3166-1 alpha-2） | `"CN"` |

- **响应**（`code=0` 时 `data` 字段）：

```ts
{
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
    language: string    // 默认 'zh-CN'
    timezone: string    // 默认 'Asia/Shanghai'
    apiKey?: string     // 平台自动生成的 API Key（用于 Agent 调用第三方 AI）
  },
  token: string         // JWT，写入 localStorage.cupai_token
}
```

- **调用场景**：登录页"注册" Tab 提交
- **错误码**：`400` 用户名重复 / 密码长度不足；`500`

#### 3.1.2 `POST /user/login`

- **鉴权**：否
- **请求体**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `username` | string | ✅ | 用户名 |
| `password` | string | ✅ | 密码 |

- **响应**：同 `3.1.1`
- **调用场景**：登录页"登录" Tab
- **错误码**：`401` 用户名或密码错误

#### 3.1.3 `GET /user/profile`

- **鉴权**：✅
- **响应**：

```ts
{
  id: string
  username: string
  nickname: string
  avatar: string
  language: string
  timezone: string
  apiKey?: string
}
```

- **调用场景**：顶栏用户信息加载；个人中心初始化

#### 3.1.4 `PUT /user/profile`

- **鉴权**：✅
- **请求体**（字段均可选）：

| 字段 | 类型 | 含义 |
|---|---|---|
| `nickname` | string | 新昵称 |
| `avatar` | string | 头像 URL |
| `language` | string | 偏好语言（`zh-CN` / `en-US` / ...） |
| `timezone` | string | 时区（IANA） |

- **响应**：更新后的完整用户对象
- **调用场景**：个人中心"保存"按钮

---

### 3.2 `ai` — AI 中转模块

#### 3.2.1 `GET /ai/config`

- **鉴权**：✅
- **响应**：

```ts
Array<{
  id: string                  // 配置 ID
  apiEndpoint: string         // OpenAI 兼容端点
  apiKeyCipher: string        // 加密后的 API Key（前端需调用 decrypt 后传给 AI）
  modelName: string           // 模型名，如 'gpt-4o' / 'claude-3.5-sonnet'
  platformKey: string         // 平台 key（来自 agentPlatform.ts）
  isDefault: boolean
  createdAt: string           // ISO 8601
}>
```

#### 3.2.2 `POST /ai/config`（upsert）

- **鉴权**：✅
- **请求体**：同响应数组中除 `id` / `createdAt` 外的字段；`apiKeyCipher` 为后端加密前的明文 Key
- **响应**：新增或更新后的配置对象

#### 3.2.3 `DELETE /ai/config/{id}`

- **鉴权**：✅
- **响应**：`{ success: boolean }`

#### 3.2.4 `POST /ai/test-connection`

- **鉴权**：✅
- **请求体**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `apiEndpoint` | string | ✅ | OpenAI 兼容端点 |
| `apiKey` | string | ✅ | **明文** API Key（**不持久化**） |

- **响应**：

```ts
{
  success: boolean
  message?: string
  latencyMs?: number
  modelEcho?: string
}
```

- **调用场景**：AI 配置弹窗"测试连通性"

#### 3.2.5 `POST /ai/proxy`

- **鉴权**：✅
- **用途**：服务端中转调用 AI（**不持久化** Key），适用于需要服务端拼接 Prompt 后调 AI 的场景
- **请求体**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `apiEndpoint` | string | ✅ | 端点 |
| `apiKey` | string | ✅ | 明文 Key |
| `payload` | object | ✅ | OpenAI ChatCompletion 兼容请求体 |

- **响应**：OpenAI 兼容响应体

---

### 3.3 `analysis` — 分析报告模块

#### 3.3.1 `POST /analysis/generate`

- **鉴权**：✅
- **完整闭环**：组装 Prompt → 调 AI → 保存报告 → 返回
- **请求体**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `matchId` | string | ✅ | 赛事 ID |
| `aiConfigId` | string | ✅ | AI 配置 ID（已配置好 apiEndpoint / modelName） |
| `weightModelId` | string | ❌ | 权重模型 ID |
| `promptTemplateId` | string | ❌ | 提示词模板 ID |
| `apiKey` | string | ✅ | 明文 API Key（前端解密后传入） |
| `isPublic` | boolean | ❌ | 是否公开（广场可见） |
| `displayLanguage` | string | ❌ | 渲染语言（`zh-CN` / `en-US` / ...） |

- **响应**：完整报告对象（见 `3.3.6`）
- **调用场景**：分析中心"生成分析报告"

#### 3.3.2 `POST /analysis/manual`

- **鉴权**：✅
- **请求体**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `matchId` | string | ✅ | 赛事 ID |
| `modelId` | string | ✅ | AI 配置 ID（前端用 `modelId` 字段名） |
| `weightModelId` | string | ✅ | 权重模型 ID |
| `promptTemplateId` | string | ✅ | 提示词模板 ID |

> ⚠️ 注：前端 `AnalysisCenterView` 传的是 `modelId`（= `aiConfigId`），与 `generate` 接口的 `aiConfigId` 同义；后端 `CreateReportDto` 内部统一。

- **响应**：报告对象

#### 3.3.3 `POST /analysis/agent`

- **鉴权**：✅ + 需先同意 Agent 授权协议（`GET /analysis/agent/agreement`）
- **请求体**：同 `3.3.2`
- **响应**：报告对象（**强制 `isPublic: true`**，不可逆）

#### 3.3.4 `GET /analysis/agent/agreement`

- **鉴权**：否
- **响应**：

```ts
{
  title: string
  version: string
  content: string     // Markdown 文本
}
```

#### 3.3.5 `POST /analysis/agent/trigger`

- **鉴权**：✅
- **触发 Agent 异步分析**（不等待 AI 返回）
- **请求体**：`TriggerAgentDto`

#### 3.3.6 报告对象结构（统一）

```ts
{
  id: string
  matchId: string
  userId: string
  source: 'agent' | 'manual'           // 生成方式
  llmType: string                      // 模型名
  weightSnapshot: string               // JSON 字符串，权重快照
  content: string                      // Markdown 报告内容
  displayLanguage: string
  isPublic: boolean
  likeCount: number
  collectCount: number
  createdAt: string
  updatedAt: string
}
```

#### 3.3.7 `GET /analysis/square`

- **鉴权**：否
- **Query 参数**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `matchId` | string | ❌ | 赛事过滤 |
| `source` | string | ❌ | `agent` / `manual` |
| `page` | number | ❌ | 默认 1 |
| `pageSize` | number | ❌ | 默认 20 |

- **响应**：`{ list: Report[], total, page, pageSize }`
- **调用场景**：分析广场列表

#### 3.3.8 `GET /analysis/my`

- **鉴权**：✅
- **响应**：`Report[]`
- **调用场景**：个人中心 / 我的报告

#### 3.3.9 `PUT /analysis/{id}/visibility`

- **鉴权**：✅
- **请求体**：`{ isPublic: boolean }`
- **响应**：更新后的报告对象
- **注意**：Agent 报告不可设为私密（业务规则）

#### 3.3.10 `DELETE /analysis/{id}`

- **鉴权**：✅
- **响应**：`{ success: boolean }`

#### 3.3.11 `POST /analysis/interaction`（点赞 / 收藏 toggle）

- **鉴权**：✅
- **请求体**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `reportId` | string | ✅ | 报告 ID |
| `type` | string | ✅ | `like` / `collect` |

- **响应**：

```ts
{
  liked: boolean
  collected: boolean
}
```

#### 3.3.12 `POST /analysis/interactions/check`

- **鉴权**：✅
- **请求体**：`{ reportIds: string[] }`
- **响应**：`Record<string, { liked: boolean; collected: boolean }>`

#### 3.3.13 `GET /analysis/interactions/collections`

- **鉴权**：✅
- **响应**：`Report[]`（当前用户收藏的报告列表）

#### 3.3.14 算法服务（`/analysis/algorithm/*`）

| 方法 | 路径 | 鉴权 | 用途 |
|---|---|---|---|
| `POST` | `/analysis/algorithm/weights` | ✅ | 权重自动处理（归一化+制衡+自适应） |
| `POST` | `/analysis/algorithm/denoise` | ✅ | 数据降噪 |
| `POST` | `/analysis/algorithm/sentiment` | ✅ | 舆情情感分析 |

> 这三个接口主要供服务端内部使用，前端通常不直接调用。

---

### 3.4 `prompt` — 提示词模板模块

#### 3.4.1 `GET /prompt/my`

- **鉴权**：✅
- **响应**：`PromptTemplate[]`

#### 3.4.2 `POST /prompt`

- **鉴权**：✅
- **请求体**（`CreatePromptDto`）：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `name` | string | ✅ | 模板名 |
| `scene` | string | ✅ | `match_preview` / `team_compare` / `player_analysis` / `qualification_predict` / `sentiment_analysis` |
| `adaptedModel` | string | ❌ | 适配的模型名 |
| `content` | string | ✅ | 模板内容（含 `{{var}}` 变量） |
| `isPublic` | boolean | ❌ | 是否公开 |

- **响应**：模板对象
- **后端行为**：变量名校验（必须与预定义变量集匹配）

#### 3.4.3 `PUT /prompt/{id}`

- **鉴权**：✅
- **请求体**：同 `3.4.2`
- **响应**：更新后的模板对象

#### 3.4.4 `DELETE /prompt/{id}`

- **鉴权**：✅
- **响应**：`{ success: boolean }`

#### 3.4.5 `PUT /prompt/{id}/visibility`

- **鉴权**：✅
- **请求体**：`{ isPublic: boolean }`
- **响应**：`{ success: boolean }`

#### 3.4.6 `GET /prompt/market`

- **鉴权**：否
- **Query 参数**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `scene` | string | ❌ | 场景过滤 |
| `sortBy` | string | ❌ | `latest` / `popular` |
| `page` | number | ❌ | 默认 1 |
| `pageSize` | number | ❌ | 默认 20 |

- **响应**：`{ list: PromptTemplate[], total, page, pageSize }`
- **调用场景**：提示词市场

#### 3.4.7 `GET /prompt/defaults`

- **鉴权**：否
- **响应**：`PromptTemplate[]`（系统预置模板，新手可用）
- **调用场景**：模板下拉默认值

#### 3.4.8 `POST /prompt/validate`

- **鉴权**：否
- **请求体**：`{ content: string }`
- **响应**：

```ts
{
  valid: boolean
  variables: string[]       // 解析出的变量名
  errors?: string[]
}
```

#### 3.4.9 `POST /prompt/preview`

- **鉴权**：否
- **请求体**：`{ content: string }`
- **响应**：`{ preview: string }`（用示例数据填充后的文本）

#### 3.4.10 `POST /prompt/{id}/collect`

- **鉴权**：否（**注：当前实现无需登录**）
- **响应**：`{ success: boolean }`
- **调用场景**：提示词市场"收藏"按钮

#### 3.4.11 模板对象结构

```ts
{
  id: string
  userId: string
  name: string
  scene: string
  adaptedModel?: string
  content: string
  isPublic: boolean
  isSystem: boolean         // true = 系统预置
  collectCount: number
  useCount: number
  createdAt: string
  updatedAt: string
}
```

---

### 3.5 `ranking` — 排行与权重模型

#### 3.5.1 权重模型 CRUD

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| `GET` | `/ranking/model` | ✅ | 获取当前用户所有权重模型 |
| `POST` | `/ranking/model` | ✅ | 创建（请求体含 `name` / `historicalRecord` / `teamStrength` / `playerStatus` / `isDefault`） |
| `PUT` | `/ranking/model/{id}` | ✅ | 更新 |
| `DELETE` | `/ranking/model/{id}` | ✅ | 删除 |
| `PUT` | `/ranking/model/{id}/default` | ✅ | 设为默认（自动取消其它默认） |

**权重模型结构**：

```ts
{
  id: string
  userId: string
  name: string
  historicalRecord: number   // 历史战绩权重 0-100
  teamStrength: number       // 球队实力权重
  playerStatus: number       // 球员状态权重
  isDefault: boolean
  createdAt: string
}
```

> 三者之和应为 100；后端不强制，前端校验。

#### 3.5.2 排行榜接口

##### `GET /ranking/users`

- **鉴权**：否
- **Query 参数**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `seasonId` | string | ❌ | 赛季 ID |
| `page` / `pageSize` | number | ❌ | 分页（默认 1 / 20） |
| `sort` | string | ❌ | `total`（总准确率） / `exact`（精准比分命中率） / `funny`（趣味数据命中率） |
| `limit` | number | ❌ | 限制返回条数（首页摘要用，**与 page/pageSize 互斥，limit 优先**） |

- **响应**：`{ list: UserRanking[], total, page, pageSize }`

**UserRanking 字段**：

| 字段 | 类型 | 含义 |
|---|---|---|
| `userId` | string | 用户 ID |
| `user` | `{ id, username, nickname, avatar, region }` | 用户基本信息 |
| `totalPredictions` | number | 总预测次数 |
| `totalScore` | number | 总积分 |
| `accuracyRate` | number | 总预测准确率（百分比 0-100） |
| `exactScoreRate` / `exactScoreAccuracyRate` | number | 精准比分命中率（兼容字段） |
| `funnyDataRate` / `funDataAccuracyRate` | number | 趣味数据命中率（兼容字段） |
| `rank` | number | 排名（按 `sort` 字段） |

- **调用场景**：排行榜"用户" tab、首页"高准确率用户"摘要

##### `GET /ranking/models`

- **鉴权**：否
- **Query 参数**：`seasonId` / `page` / `pageSize` / `limit`
- **响应**：`{ list: ModelRanking[], ... }`

**ModelRanking 字段**：

| 字段 | 类型 | 含义 |
|---|---|---|
| `id` | string | 模型 ID |
| `modelName` | string | 模型名 |
| `totalPredictions` | number | 累计预测次数 |
| `accuracyRate` | number | 准确率 |
| `totalScore` | number | 综合得分 |
| `rank` | number | 排名 |

- **调用场景**：排行榜"大模型" tab、首页"热门大模型"摘要

##### `GET /ranking/platforms`

- **鉴权**：否
- **Query 参数**：`limit`
- **数据来源**：聚合 `user_ai_configs.apiEndpoint`，按域名归一化后按用户数降序
- **响应**：`{ list: PlatformRanking[] }`

**PlatformRanking 字段**：

| 字段 | 类型 | 含义 |
|---|---|---|
| `platform` | string | 平台中文名（"通义千问"） |
| `platformKey` | string | 平台 key（`qwen` / `claude` / ...），前端用其匹配 `agentPlatform.ts` 渲染 icon |
| `userCount` | number | 使用该平台的用户数 |
| `totalPredictions` | number | 该平台累计预测次数 |

- **调用场景**：排行榜"Agent 平台" tab、首页"热门 Agent 平台"摘要

##### `GET /ranking/platforms/top`

- **鉴权**：否
- **响应**：硬编码示例数据（开发态用，生产应调用 `/ranking/platforms`）

##### `GET /ranking/my`

- **鉴权**：✅
- **Query 参数**：`seasonId`
- **响应**：当前用户的个人排行（含 `rank`）

##### `GET /ranking/hot-briefs`

- **鉴权**：否
- **Query 参数**：`pageSize`（默认 6）
- **响应**：`{ list: HotBrief[] }`（高赞 / 高收藏公开报告）

---

### 3.6 `match` — 赛事模块

#### 3.6.1 `GET /match`

- **鉴权**：否
- **Query 参数**：

| 字段 | 类型 | 含义 |
|---|---|---|
| `status` | string | `upcoming` / `live` / `finished` |
| `stage` | string | `group`（小组赛） / `round16` / `quarter` / `semi` / `final` |
| `page` | number | 默认 1 |
| `pageSize` | number | 默认 20 |

- **响应**：`{ list: Match[], total, page, pageSize }`
- **调用场景**：赛事数据中心列表

#### 3.6.2 `GET /match/bracket`

- **鉴权**：否
- **响应**：淘汰赛对阵图数据（按 `bracketStage` 分组）
- **调用场景**：对阵图组件

#### 3.6.3 `GET /match/{id}`

- **鉴权**：否
- **响应**：

```ts
{
  id: string
  status: 'upcoming' | 'live' | 'finished'  // 已标准化，BSD 原始状态在 bsStatus
  bsStatus?: string                          // BSD 原始状态：notstarted/inprogress/...
  stage: string                              // group / round16 / quarter / semi / final
  groupName?: string                         // 小组名称（仅小组赛有）
  roundName?: string                         // BSD 原始阶段名
  startTime: string                          // ISO 8601（开赛时间；前端用 formatTime 渲染）
  period?: string                            // 当前时段：1T / HT / 2T / FT / ET / PEN
  currentMinute?: number                     // 进行中时的比赛分钟
  leagueId?: number                          // BSD 联赛 ID
  leagueName: string
  homeTeam: TeamEntity & { fifaRank?, countryCode }
  awayTeam: TeamEntity & { fifaRank?, countryCode }
  homeTeamBsdId?: number
  awayTeamBsdId?: number
  homeScore: number | null
  awayScore: number | null
  halfTimeHome: number | null
  halfTimeAway: number | null
  penaltyShootout?: { home: number, away: number } | null
  venue?: string
  city?: string
  venueId?: number
  refereeId?: number
  refereeName?: string
  refereeNationality?: string
  refereeStyle?: string
  temperature?: number
  humidity?: number
  weatherCondition?: string
  windSpeed?: number
  homeAttendance?: number
  awayAttendance?: number
  totalAttendance?: number
  isLocalDerby?: boolean
  isNeutralGround?: boolean
  liveWebsocket?: boolean
  matchData?: object                         // BSD 完整赛事数据
  lastSyncedAt?: string                      // 最近一次 BSD 同步时间
}
```

- **数据来源**：`matches` 表（由 `BsdcSyncScheduler` 实时写入）
- **调用场景**：赛事详情（`MatchDetailView`）

#### 3.6.4 `GET /match/{id}/prediction`

- **鉴权**：否
- **响应**：

```ts
{
  homeWin: number       // 0-1 概率
  draw: number
  awayWin: number
  reasoning?: string    // AI 解释
  source: string        // 模型名
}
```

- **调用场景**：赛事详情"AI 胜负率预测"

#### 3.6.5 `GET /match/teams/all`

- **鉴权**：否
- **响应**：`TeamBrief[]`
- **调用场景**：球队筛选 / 选择器

#### 3.6.6 `GET /match/teams/{id}`

- **鉴权**：否
- **响应**：

```ts
{
  id: string
  name: string
  countryCode: string
  fifaRank: number
  group?: string
  players: PlayerBrief[]   // **含球员列表**
}
```

#### 3.6.7 `GET /match/players/{id}`

- **鉴权**：否
- **响应**：球员详情

#### 3.6.8 `GET /match/standings`

- **鉴权**：否
- **响应**（由后端 `StandingService.getStandings` 实际返回，Redis 5min 缓存，key = `standings:{groupName|all}`）：

```ts
{
  groups: Record<string, Array<{     // key = 小组名（'A' / 'B' / 'C' / ...）
    teamId: string
    groupName: string
    played: number
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    points: number
    rankPosition: number              // 同组内排名（按 points DESC 等规则）
    team?: { id: string, name: string, countryCode?: string, fifaRank?: number }  // leftJoin denormalize
    advanceProbability?: number       // 出线概率（部分球队已计算）
  }>>,
  total: number                       // 全部小组队伍总数
}
```

> 旧版使用 `groups: Array<{group, standings}>` 结构已废弃。**前端统一按 Record 读取**：`res.groups[groupName]`。

- **调用场景**：积分榜页（[StandingsView](file:///Users/mac/work/cupai/apps/web/src/views/StandingsView.vue)）+ 赛事数据中心"小组积分榜" tab（[MatchDataCenterView](file:///Users/mac/work/cupai/apps/web/src/views/MatchDataCenterView.vue)）
- **数据来源**：`group_standings` 表（由 `bsdSyncScheduler.standings` 任务每 30min 写入）

#### 3.6.9 `GET /match/standings/{group}`

- **鉴权**：否
- **响应**：单个小组积分榜

#### 3.6.10 `GET /match/advance/{group}`

- **鉴权**：否
- **路径参数**：`group`（A / B / C / ...）
- **响应**（由后端 `StandingService.getAdvanceAnalysis` 实际返回）：

```ts
{
  groupName: string                                    // 小组名
  teams: Array<{
    rank: number                                       // 当前排名
    teamId: string
    teamName: string
    points: number
    played: number
    wins: number
    draws: number
    losses: number
    goalDifference: number
    maxPossiblePoints: number                          // 剩余场次理论可拿最高分
    advanceProbability: number                         // 0-100 出线概率
    status: '出线区' | '有望出线' | '基本出局'           // 状态标签
  }>
  analysis?: string                                    // 整组简要分析（可选）
}
```

- **调用场景**：出线形势分析

#### 3.6.11 `GET /match/dynamics`

- **鉴权**：否
- **Query 参数**：

| 字段 | 类型 | 默认 | 含义 |
|---|---|---|---|
| `limit` | number | 6 | 每段（live / upcoming）最多返回多少条 |

- **响应**：

```ts
{
  live: Match[]       // 状态=live，按 startTime 升序
  upcoming: Match[]   // 状态=upcoming 且 startTime 在未来 24h 内，按 startTime 升序
}
```

- **数据来源**：`matches` 表（由 BSD 调度器每 10s 写入 live 状态，每 5min 写入其他状态）
- **调用场景**：首页"赛事动态"列（`HomeView.loadDynamics`）

---

### 3.7 `sentiment` — 舆情数据模块

#### 3.7.1 `GET /sentiment/overview`

- **鉴权**：否
- **响应**：

```ts
{
  totalItems: number
  positiveRate: number
  negativeRate: number
  neutralRate: number
  topTeams: Array<{ teamId: string, teamName: string, sentimentScore: number }>
}
```

#### 3.7.2 `GET /sentiment/timeline`

- **鉴权**：否
- **Query 参数**：

| 字段 | 类型 | 含义 |
|---|---|---|
| `teamId` | string | 球队过滤 |
| `matchId` | string | 赛事过滤 |
| `interval` | string | `hour` / `day`（默认 `hour`） |

- **响应**：

```ts
Array<{
  time: string          // ISO 8601
  positive: number
  negative: number
  neutral: number
}>
```

#### 3.7.3 `GET /sentiment/team/{teamId}` / `GET /sentiment/match/{matchId}`

- **鉴权**：否
- **响应**：单球队 / 单赛事舆情聚合

#### 3.7.4 `POST /sentiment/analyze` / `POST /sentiment/batch`

- **鉴权**：否（**注：建议加鉴权**）
- **用途**：提交并分析单条 / 批量舆情（管理端 / 内部任务用）
- **请求体**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `teamId` / `matchId` | string | ❌ | 关联主体 |
| `sourcePlatform` | string | ✅ | `twitter` / `reddit` / ... |
| `originalText` | string | ✅ | 原文 |
| `language` | string | ❌ | `en` / `es` / ... |
| `region` | string | ❌ | 地区 |
| `publishedAt` | string | ❌ | ISO 8601 |
| `sourceUrl` | string | ❌ | 原文链接 |
| `author` | string | ❌ | 作者 |
| `engagement` | number | ❌ | 互动量 |

#### 3.7.5 `GET /sentiment/charts`¹

- **鉴权**：否
- **预期响应**：

```ts
{
  langDist: Array<{ language: string, count: number }>
  platformDist: Array<{ platform: string, count: number }>
  regionDist: Array<{ region: string, count: number }>
  scoreDist: Array<{ bucket: string, count: number }>
  teamRanking: Array<{ teamId: string, teamName: string, score: number }>
  feedList: Array<SentimentItem>
}
```

> ¹ **后端暂未实现**（见 §4.1），前端 `try/catch` 静默忽略；当前 SentimentView 的分布图与 Feed 列表为空态。

---

### 3.8 `agent/open` — 公开 Agent 接口

> 路由前缀 `/agent/open`，无需登录。**供 Agent 内部 / 第三方工具调用**；前端不直接使用。

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/agent/open/instructions` | 获取待办指令清单 |
| `POST` | `/agent/open/instructions` | 创建指令（Agent 初始化） |
| `GET` | `/agent/open/dimensions?matchId=` | 获取单维度报告（Redis 缓存） |
| `POST` | `/agent/open/dimension/submit` | 提交单维度预测 |
| `POST` | `/agent/open/answer` | 提交 Agent 分析回答 |
| `POST` | `/agent/open/instruction/interaction` | 指令点赞 / 收藏 |

---

### 3.9 `bsd` — BSD 数据中转

> 后端调用 BSD SportsData API 后透传给前端；前端不直接调用 BSD 公共 API。

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/bsd/events` | 赛事列表（带日期 / 联赛 / 球队 / 状态过滤） |
| `GET` | `/bsd/events/live` | 实时进行中赛事 |
| `GET` | `/bsd/events/{id}` | 赛事详情 |
| `GET` | `/bsd/events/{id}/stats` | 赛事统计 |
| `GET` | `/bsd/events/{id}/incidents` | 事件流（进球 / 红黄牌） |
| `GET` | `/bsd/events/{id}/lineups` | 首发阵容 |
| `GET` | `/bsd/events/{id}/odds` | 赔率 |
| `GET` | `/bsd/leagues` | 联赛列表 |
| `GET` | `/bsd/leagues/{id}/standings` | 联赛积分榜 |
| `GET` | `/bsd/teams` | 球队列表 |
| `GET` | `/bsd/teams/{id}` | 球队详情 |
| `GET` | `/bsd/odds/best` | 最佳赔率 |
| `GET` | `/bsd/predictions` | BSD AI 预测 |

> 路径参数 `id` 为 BSD 内部数字 ID，**与 `match` 模块的 UUID 不同**。

---

### 3.10 `risk` — 风控模块

> 前端一般不直接调用；后端 Agent 生成报告后自动过风控。

| 方法 | 路径 | 鉴权 | 用途 |
|---|---|---|---|
| `POST` | `/risk/review` | ❌ | 内容审核 |
| `POST` | `/risk/filter` | ❌ | 内容过滤 |
| `POST` | `/risk/review/ai` | ❌ | AI 二次审核 |
| `GET` | `/risk/sensitive-words` | ✅ | 敏感词列表 |
| `POST` | `/risk/sensitive-words` | ✅ | 新增敏感词 |
| `DELETE` | `/risk/sensitive-words` | ✅ | 移除敏感词 |

---

### 3.11 `app` — 根模块

| 方法 | 路径 | 鉴权 | 用途 |
|---|---|---|---|
| `GET` | `/health` | ❌ | 健康检查（K8s / LB 用） |
| `GET` | `/info` | ❌ | 服务基础信息（版本 / 构建时间） |

---

## 4. 附录

### 4.1 后端暂未实现 / 前端 Mock 占位

| 接口 | 前端调用处 | 后端实现状态 | 影响 | 建议 |
|---|---|---|---|---|
| `GET /match/dynamics` | `HomeView.loadDynamics` | ❌ 未实现 | 首页"赛事动态"列空 | 优先级 P1，建议基于 `GET /match?status=live&stage=` 实现 |
| `GET /sentiment/charts` | `SentimentView.loadCharts` | ❌ 未实现 | 舆情页"语言/平台/地区分布 + 球队排行"为空 | 优先级 P2，可由前端 `GET /sentiment/overview` + 前端聚合临时替代 |

### 4.2 Mock 数据

前端 `apps/web/src/api/mock.ts` 提供开发态 Mock；通过 `VITE_API_MOCK=true` 开启。Mock 路径前缀与后端路由一致。

### 4.3 WebSocket

| 路径 | 用途 | 触发 |
|---|---|---|
| `/ws/square` | 分析广场新报告推送 | Agent 异步分析完成 |

前端封装：`apps/web/src/api/websocket.ts#subscribeSquare(cb)`

### 4.4 字段命名兼容说明

`/ranking/users` 接口的 `exactScoreRate` / `exactScoreAccuracyRate` 与 `funnyDataRate` / `funDataAccuracyRate` 是**历史命名并存**的字段；前端统一 `??` 兜底：

```ts
const exact = row.exactScoreRate ?? row.exactScoreAccuracyRate ?? 0
const funny = row.funnyDataRate ?? row.funDataAccuracyRate ?? 0
```

> 建议后端在后续版本下掉旧字段，前端移除兼容代码。

### 4.5 前端请求层（`apps/web/src/api/request.ts`）

- **Token 注入**：自动从 `localStorage.cupai_token` 读取，写入 `Authorization: Bearer <token>`
- **响应解包**：`code === 0` 时返回 `data` 字段（前端业务拿到的是"已 unwrap"的结构）
- **错误处理**：
  - HTTP `401` → 清 token + 跳 `/login`
  - HTTP `403` → `ElMessage.error('common.noPermission')`
  - HTTP `500` → `ElMessage.error('common.serverError')`
  - 业务 `code !== 0` → `ElMessage.error(message)` + `Promise.reject`

### 4.6 变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-06-07 | v1.5 | 文档与后端/前端三方对齐：① §3.6.4 prediction 补齐 dimensions 字段 ② §3.6.8 standings 改为 Record 结构 ③ §3.6.10 advance 修正 analysis 可选 ④ §3.7.1 overview 改为真实响应（platformStats/languageStats/regionStats/recentTrend）⑤ §3.7.2 timeline 改为真实响应（period/positiveCount/negativeCount/neutralCount）⑥ §3.7.5 charts 标注未实现 ⑦ Mock 层默认关闭（VITE_USE_MOCK 默认 false）⑧ MatchDetailView 移除 isDemoMode 分支，全部走后端 ⑨ userPredictionRanking 改为后端 /ranking/users 接口 |
| 2026-06-07 | v1.3 | 文档与代码/前端三方对齐：① §3.6.3 `matchTime` → `startTime` 并补充 BSD 完整字段 ② §3.6.4 `/match/{id}/prediction` 修复后端返回 `{homeWin, draw, awayWin, reasoning, source, dimensions}` ③ §3.6.8 standings 响应 groups 数组→对象 ④ §3.6.10 advance 响应改为 `{groupName, teams[]}` ⑤ §3.7.1 overview 真实响应、§3.7.2 timeline 真实响应 ⑥ §3.8 `/agent/open/*` → `/analysis/*`（与 `agent.controller.ts` 一致）⑦ §4.1 移除 `match.dynamics` 未实现条目 ⑧ 补全 §3.12 bsd/sync 与 §4.7 BSD 自动同步说明（v1.2 误删） |
| 2026-06-07 | v1.2 | 前端根据文档全面对齐：① SentimentView 改用 `overview` 派生 `langDist` / `platformDist` / `regionDist`，移除对未实现 `/sentiment/charts` 的调用 ② 修复 `overview.avgScore` 字符串→数字转换 ③ 修复 timeline 字段 `time`→`period`、`positive`→`positiveCount` 等 ④ 移除所有 `try/catch {}` 静默吞错（替换为 `console.error`）⑤ 修正 §3.6.10 `advance/{group}` 真实响应、§3.7.1 overview 真实响应、§3.7.2 timeline 真实响应 ⑥ 移除 §2.2 总览矩阵中 RankingView 错误的 `/ranking/platforms` / `/ranking/hot-briefs` |
| 2026-06-07 | v1.1 | 后端实现 `GET /match/dynamics` 并补充详细规范（Query `limit`、响应结构、数据来源） |
| 2026-06-07 | v1.0 | 初版，覆盖全部前端页面与后端 controller |

---

### 4.7 BSD 自动同步说明

`apps/server/src/modules/bsd/bsd-sync.scheduler.ts` 在服务冷启动后自动启动，按数据时效性分多级频率拉取：

| 任务 | 频率 | 写入表 | 说明 |
|---|---|---|---|
| `live` | **10s** | `matches` | 拉取 `/events/live/`，仅更新状态/比分/分钟；新增赛事 fallback 到 `events` upsert |
| `events` | 5min | `matches` | 拉取近 1 天 ~ 未来 30 天所有比赛，写入主表 |
| `aux` | 5min | `event_incidents` / `event_lineups` / `event_odds` / `event_stats` / `event_predictions` | 候选范围：进行中 + 完赛 24h 内 + 即将开始 6h 内，每轮 20 场 |
| `standings` | 30min | `group_standings` | 拉取所有活跃联赛积分榜 |
| `teams` | 6h | `teams` | 球队列表 + 详情补全 |
| `leagues` | 6h | `leagues` | 联赛元数据 + 当前赛季 |

**冷启动**：`onApplicationBootstrap` 钩子触发，按 `leagues → teams → events → standings → aux` 顺序错峰执行，避免瞬时洪峰。

**启停**：`POST /bsd/sync/disable` 暂停整体调度；`POST /bsd/sync/enable` 恢复；`GET /bsd/sync/status` 查看运行状态与下一轮时间。

**单次幂等**：
- `matches` 按 `data_source='bsd_<id>'` 唯一索引 upsert
- `event_incidents` 按 `bs_incident_id` 唯一索引 upsert
- `event_lineups` 每次同步前按 `match_id` 清理后重建
- `event_odds` / `event_stats` 按 `match_id` 唯一索引 upsert
- `event_predictions` 按 `bs_prediction_id` 唯一索引 upsert

**响应字段映射**（BSD → 项目）：

| BSD 字段 | 项目字段 | 映射逻辑 |
|---|---|---|
| `status: notstarted/inprogress/halftime/.../finished` | `status: upcoming/live/finished` | 见 `STATUS_MAP` |
| `round_name: "Group A" / "Quarter-finals" / ...` | `stage: group / round16 / quarter / semi / final / league` | 见 `inferStage()` |
| `home_score` / `away_score` / `home_score_ht` / `away_score_ht` | 同名字段 | 直接写入 |
| `extra_time_score` / `penalty_shootout` | `matchData` JSON | 兼容 120' 后与点球大战 |
| `markets.match_result.{prob_home, prob_draw, prob_away}` | `probHome / probDraw / probAway` | BSD 嵌套字段拍平 |
| `recommendations.favorite` | `favorite` | 取主推结果 |

**关闭调度**：环境变量 `BSD_ENABLED=false`（默认 `true`）会在启动时跳过 BSD 同步，仅保留手动接口。

---

> 📌 **协作约定**
> - 任何接口变更（路径 / 参数 / 响应字段）须同步更新本文档
> - 错误码新增需在 §1.6 中登记
> - 后端 controller 修改须同步前端 `stores/*` 与 `views/*` 调用点

---

## 5. 赛事详情页数据字段 × 接口支持确认

> **生成日期**：2026-06-07
> **确认人**：AI 辅助审查（基于代码静态分析）
> **目的**：逐一核实赛事详情页各模块所需数据字段在后端接口中的支持情况

### 5.1 赛事基本信息

| 字段 | 前端用途 | 接口 | 后端支持 | 备注 |
|---|---|---|---|---|
| `homeTeam.name` | 主队名称 | `GET /match/:id` | ✅ | 关联加载 |
| `homeTeam.countryCode` | 主队国旗 | `GET /match/:id` | ✅ | |
| `homeTeam.fifaRank` | FIFA 排名 | `GET /match/:id` | ✅ | |
| `homeTeam.fifaRankChange` | 排名变化 | `GET /match/:id` | ✅ | |
| `homeTeam.formation` | 阵型 | `GET /match/:id` | ✅ | |
| `homeTeam.playStyle` | 球风 | `GET /match/:id` | ✅ | |
| `homeTeam.avgGoalsScored` | 场均进球 | `GET /match/:id` | ✅ | |
| `homeTeam.avgGoalsConceded` | 场均失球 | `GET /match/:id` | ✅ | |
| `homeTeam.avgPossession` | 场均控球率 | `GET /match/:id` | ✅ | |
| `homeTeam.winRate` | 胜率 | `GET /match/:id` | ✅ | |
| `awayTeam.*` | 客队同上 | `GET /match/:id` | ✅ | |
| `status` | 赛事状态 | `GET /match/:id` | ✅ | upcoming/live/finished |
| `homeScore` / `awayScore` | 比分 | `GET /match/:id` | ✅ | |
| `halfTimeHome` / `halfTimeAway` | 半场比分 | `GET /match/:id` | ✅ | |
| `leagueName` | 联赛名称 | `GET /match/:id` | ✅ | |
| `startTime` | 开赛时间 | `GET /match/:id` | ✅ | |
| `venue` | 比赛场地 | `GET /match/:id` | ✅ | |
| `refereeName` | 裁判 | `GET /match/:id` | ✅ | |
| `refereeNationality` | 裁判国籍 | `GET /match/:id` | ✅ | |
| `refereeStyle` | 裁判风格 | `GET /match/:id` | ✅ | |
| `stage` | 赛事阶段 | `GET /match/:id` | ✅ | |

### 5.2 临场环境

| 字段 | 前端用途 | 接口 | 后端支持 | 备注 |
|---|---|---|---|---|
| `temperature` | 温度(℃) | `GET /match/:id` | ✅ | BSD 同步写入 |
| `humidity` | 湿度(%) | `GET /match/:id` | ✅ | |
| `weatherCondition` | 天气状况 | `GET /match/:id` | ✅ | |
| `windSpeed` | 风速(km/h) | `GET /match/:id` | ✅ | |
| `homeAttendance` | 主队球迷人数 | `GET /match/:id` | ✅ | |
| `awayAttendance` | 客队球迷人数 | `GET /match/:id` | ✅ | |
| `totalAttendance` | 总上座人数 | `GET /match/:id` | ✅ | |

### 5.3 全维度因子分析

| 字段 | 前端用途 | 接口 | 后端支持 | 备注 |
|---|---|---|---|---|
| `dimensionReports[].dimKey` | 维度标识 | `GET /agent/open/dimensions` | ✅ | |
| `dimensionReports[].distribution` | 概率分布 | `GET /agent/open/dimensions` | ✅ | |
| `dimensionReports[].extras.winner` | 最高概率项 | `GET /agent/open/dimensions` | ✅ | |
| `dimensionReports[].extras.confidence` | 置信度 | `GET /agent/open/dimensions` | ✅ | |
| `prediction.homeWin/draw/awayWin` | 胜率预测 | `GET /matches/:id/prediction` | ✅ | 无数据时返回 null |
| `prediction.reasoning` | AI 推理说明 | `GET /matches/:id/prediction` | ✅ | |
| `prediction.source` | 预测来源 | `GET /matches/:id/prediction` | ✅ | |
| `match.matchData` | 因子键值对 | `GET /match/:id` | ✅ | JSON 字段 |
| `match.dataSource` | 数据来源 | `GET /match/:id` | ✅ | |
| `match.dataSourceUrl` | 数据来源链接 | `GET /match/:id` | ✅ | |
| `instructionMap[].id` | 指令 ID | `GET /agent/open/instructions` | ✅ | |

### 5.4 首发阵容与球员信息

| 字段 | 前端用途 | 接口 | 后端支持 | 备注 |
|---|---|---|---|---|
| 球员列表 `players[]` | 球员信息 | `GET /match/teams/:id` | ✅ | 通过 teamId 查询 |
| `player.name` | 球员中文名 | `GET /match/teams/:id` | ✅ | |
| `player.nameEn` | 球员英文名 | `GET /match/teams/:id` | ✅ | |
| `player.position` | 位置 | `GET /match/teams/:id` | ✅ | |
| `player.age` | 年龄 | `GET /match/teams/:id` | ✅ | |
| `player.isKeyPlayer` | 核心球员标记 | `GET /match/teams/:id` | ✅ | |
| `player.seasonGoals` | 赛季进球 | `GET /match/teams/:id` | ✅ | |
| `player.seasonAssists` | 赛季助攻 | `GET /match/teams/:id` | ✅ | |
| `player.yellowCards` | 黄牌 | `GET /match/teams/:id` | ✅ | |
| `player.redCards` | 红牌 | `GET /match/teams/:id` | ✅ | |
| `player.injuryStatus` | 伤病状态 | `GET /match/teams/:id` | ✅ | |
| `player.avatar` | 头像 | `GET /match/teams/:id` | ✅ | |
| 首发阵容 `lineups.home/away` | 首发阵容 | `GET /match/:id/lineups` | ✅ 新增 | 读取 EventLineupEntity |
| `lineup.isStarter` | 是否首发 | `GET /match/:id/lineups` | ✅ 新增 | |
| `lineup.jerseyNumber` | 球衣号 | `GET /match/:id/lineups` | ✅ 新增 | |
| `lineup.formation` | 阵型 | `GET /match/:id/lineups` | ✅ 新增 | |
| `lineup.aiScore` | AI 评分 | `GET /match/:id/lineups` | ✅ 新增 | |
| `lineup.lineupStatus` | 阵容确认状态 | `GET /match/:id/lineups` | ✅ 新增 | confirmed/predicted |

### 5.5 舆情模块

| 字段 | 前端用途 | 接口 | 后端支持 | 备注 |
|---|---|---|---|---|
| `sampleCount` | 样本总数 | `GET /sentiment/match/:id` | ✅ | |
| `avgScore` | 平均得分 | `GET /sentiment/match/:id` | ✅ | |
| `positiveRatio` | 正面比例 | `GET /sentiment/match/:id` | ✅ | |
| `negativeRatio` | 负面比例 | `GET /sentiment/match/:id` | ✅ | |
| `neutralRatio` | 中性比例 | `GET /sentiment/match/:id` | ✅ | |
| `pressureIndex` | 压力指数 | `GET /sentiment/match/:id` | ✅ | |
| `topKeywords` | 热门关键词 | `GET /sentiment/match/:id` | ✅ | |
| `recentItems[]` | 最近舆情条目 | `GET /sentiment/match/:id` | ✅ | |
| `recentItems[].sentimentPolarity` | 情感极性 | `GET /sentiment/match/:id` | ✅ | |
| `recentItems[].sourcePlatform` | 来源平台 | `GET /sentiment/match/:id` | ✅ | |
| `recentItems[].originalText` | 原文内容 | `GET /sentiment/match/:id` | ✅ | |
| 球队舆情 | 主/客队舆情 | `GET /sentiment/team/:teamId` | ✅ | 各调一次 |

### 5.6 用户预测排行

| 字段 | 前端用途 | 接口 | 后端支持 | 备注 |
|---|---|---|---|---|
| `userId/username` | 用户名 | `GET /ranking/users` | ✅ | |
| `countryCode` | 国旗 | `GET /ranking/users` | ✅ | |
| `accuracyRate` | 准确率 | `GET /ranking/users` | ✅ | |
| `platform/modelName` | 使用模型 | `GET /ranking/users` | ✅ | |

### 5.7 实时更新

| 字段 | 前端用途 | 接口 | 后端支持 | 备注 |
|---|---|---|---|---|
| `homeScore` / `awayScore` | 实时比分 | WebSocket `live_update` | ✅ | |
| 全量 match 对象 | 状态更新 | WebSocket `match:update` | ✅ | |

### 5.8 新增接口：赛事阵容

**路径**：`GET /match/:id/lineups`

**响应**：

```json
{
  "home": {
    "starters": [
      {
        "id": "uuid",
        "matchId": "uuid",
        "side": "home",
        "isStarter": true,
        "bsPlayerId": 12345,
        "playerName": "球员名",
        "shortName": "简称",
        "position": "G",
        "jerseyNumber": 1,
        "aiScore": 0.85,
        "lineupStatus": "confirmed",
        "formation": "4-3-3",
        "confidence": 0.9
      }
    ],
    "substitutes": [...],
    "formation": "4-3-3"
  },
  "away": {
    "starters": [...],
    "substitutes": [...],
    "formation": "4-4-2"
  }
}
```

**数据来源**：`event_lineups` 表，由 `BsdSyncService.syncLineups()` 从 BSD API 同步写入

**同步条件**：开赛时间在 6 小时内的赛事

---

### 5.9 总结

| 模块 | 所需字段数 | 接口支持 | 备注 |
|---|---|---|---|
| 赛事基本信息 | 21 | ✅ 全部支持 | `GET /match/:id` |
| 临场环境 | 7 | ✅ 全部支持 | `GET /match/:id` |
| 全维度因子分析 | 11 | ✅ 全部支持 | 多接口组合 |
| 首发阵容/球员 | 17 | ✅ 全部支持 | 新增 `GET /match/:id/lineups` |
| 舆情模块 | 11 | ✅ 全部支持 | `GET /sentiment/match/:id` + `team/:id` |
| 用户预测排行 | 4 | ✅ 全部支持 | `GET /ranking/users` |
| 实时更新 | 2 | ✅ 全部支持 | WebSocket |

**结论**：赛事详情页所有模块所需数据字段均已有后端接口支持，其中阵容接口为本次新增。
