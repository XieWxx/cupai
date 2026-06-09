# CupAI 项目整体流程文档

> 适用版本：cupai v0.1.0 · pnpm 11.x · Node.js ≥ 18
> 文档作用：从开发到部署的完整端到端流程，以及本次赛事数据问题的整体排查路径

---

## 一、项目概览

### 1.1 项目定位
**世界杯自定义 AI 赛事分析预测平台**——为大型足球赛事（世界杯、欧洲杯、各国联赛、友谊赛等）提供多维度 AI 比赛分析、预测、互动排名的 Web 平台。

### 1.2 仓库结构
```
cupai/
├── apps/
│   ├── server/                 # NestJS 后端服务
│   │   ├── src/
│   │   │   ├── main.ts         # 服务启动入口（全局前缀 /api/v1）
│   │   │   ├── app.module.ts   # 根模块
│   │   │   ├── modules/        # 业务模块
│   │   │   │   ├── bsd/        #  BSD 第三方赛事数据接入 + 同步
│   │   │   │   ├── match/      #  赛事/球队/榜单 实体 + 服务
│   │   │   │   ├── agent/      #  AI 分析代理 + Socket.io 网关
│   │   │   │   ├── ai/         #  AI 配置（多 LLM）
│   │   │   │   ├── prompt/     #  提示词模板
│   │   │   │   ├── ranking/    #  用户/模型 排名
│   │   │   │   ├── risk/       #  敏感词
│   │   │   │   └── user/       #  用户/登录/JWT
│   │   │   ├── common/         #  filter / guard / interceptor
│   │   │   ├── services/       #  球员头像、天气等公共服务
│   │   │   └── utils/          #  球员名翻译等
│   │   ├── scripts/            #  运维脚本（regression.sh 等）
│   │   └── Dockerfile
│   └── web/                    # Vue 3 + Vite 前端
│       ├── src/
│       │   ├── api/            #  Axios 封装 + WebSocket
│       │   ├── components/     #  通用/业务组件
│       │   ├── locales/        #  8 种语言 i18n
│       │   ├── router/         #  Vue Router
│       │   ├── stores/         #  Pinia
│       │   ├── styles/         #  全局样式
│       │   ├── utils/          #  业务工具
│       │   └── views/          #  页面（含 MatchDetailView）
│       ├── Dockerfile
│       └── nginx 配置
├── packages/                   #  pnpm 共享子包
│   ├── constants/              #  全局常量
│   ├── types/                  #  共享类型
│   └── utils/                  #  算法工具（归一化、情感分析等）
├── deploy/init.sql             #  MySQL 初始化脚本
├── docker/                     #  nginx 配置等
├── docker-compose.yml          #  一键部署编排
├── pnpm-workspace.yaml         #  Monorepo 工作区
├── .env.example                #  环境变量模板
└── README.*.md                 #  多语言项目说明
```

### 1.3 技术栈
| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + TypeScript + Pinia + Element Plus + Vue I18n + Socket.io-client |
| 后端 | NestJS 10 + TypeORM + MySQL 8 + Redis 7 + Socket.io + JWT |
| 数据源 | BSD SportsData API（`https://sports.bzzoiro.com`） |
| 部署 | Docker Compose（mysql / redis / server / web 4 容器） |
| 包管理 | pnpm 11（Monorepo） |

---

## 二、本地开发流程

### 2.1 环境准备
```bash
# 1. 安装 pnpm（项目要求 ≥ 8，推荐 11.x）
npm install -g pnpm

# 2. 克隆并进入项目
cd /Users/mac/work/cupai

# 3. 复制环境变量模板
cp .env.example .env
# 编辑 .env，至少配置 BSD_API_KEY（必填，否则同步任务跳过）

# 4. 安装所有子包依赖（Monorepo 一次安装）
pnpm install
```

### 2.2 启动基础设施（MySQL + Redis）
```bash
# 仅启动数据库和缓存，不启动 server/web（用于本地调试后端时）
docker compose up -d mysql redis

# 查看健康状态
docker compose ps
```

数据库默认账号：`root` / `cupai2026`，数据库 `cupai`，端口 `3306`
Redis 默认无密码，端口 `6379`

### 2.3 启动后端（开发模式）
```bash
# 方式 A：使用 pnpm 脚本（自动 watch）
pnpm dev:server
# → 启动 NestJS 在 http://localhost:3001，前缀 /api/v1

# 方式 B：直接进目录启动
cd apps/server && pnpm dev
```

后端启动后会自动：
- TypeORM 按实体定义同步表结构（`synchronize: true`，开发环境）
- 启动 BSD 同步调度器（`BsdcSyncScheduler`，详见第五章）
- 启动情感数据同步（`SentimentService`）

### 2.4 启动前端（开发模式）
```bash
pnpm dev:web
# → Vite 启动在 http://localhost:5173

# 关键环境变量（apps/web/.env.development）：
#   VITE_API_BASE_URL=http://localhost:3001/api/v1
#   VITE_WS_URL=http://localhost:3001
```

### 2.5 常用命令
```bash
# 类型检查
pnpm exec tsc -p apps/server --noEmit
pnpm exec tsc -p apps/web --noEmit

# 构建
pnpm build              # 同时构建 web + server
pnpm build:web          # 仅前端
pnpm build:server       # 仅后端

# 格式化
pnpm format

# Lint
pnpm lint
pnpm lint:fix

# 回归测试（后端）
cd apps/server && bash scripts/regression.sh
```

### 2.6 本地调试 BSD 同步任务
```bash
# 查看后端日志中的同步状态
docker logs -f cupai-server

# 主动触发一次赛事同步（无需等待定时器）
curl -X POST http://localhost:3001/api/v1/bsd/sync/events

# 主动触发一次 live 同步
curl -X POST http://localhost:3001/api/v1/bsd/sync/live

# 查看数据库同步结果
docker exec -it cupai-mysql mysql -uroot -p'cupai2026' cupai \
  -e "SELECT id, status, home_coach, venue, last_synced_at FROM matches ORDER BY last_synced_at DESC LIMIT 5"
```

---

## 三、生产部署流程

### 3.1 一键 Docker Compose 部署
```bash
# 在服务器上（推荐 2 核 4G 以上）
cd /opt/cupai
cp .env.example .env
vim .env   # 至少配置：DB_PASSWORD / JWT_SECRET / BSD_API_KEY

# 拉起全部服务
docker compose up -d --build

# 检查状态
docker compose ps
```

启动顺序：mysql → redis → server（depends_on healthcheck）→ web

### 3.2 端口规划
| 容器 | 内部端口 | 宿主机端口 | 备注 |
|------|---------|-----------|------|
| cupai-mysql | 3306 | 3306 | 数据库 |
| cupai-redis | 6379 | 6379 | 缓存 |
| cupai-server | 3001 | 3001 | 后端 API + WebSocket |
| cupai-web | 80 / 443 | 80 / 443 | 前端（含 nginx 反向代理） |

### 3.3 反向代理规则（已内嵌 web 容器 nginx）
- `/api/*` → `cupai-server:3001`
- `/socket.io/*` → `cupai-server:3001`（WebSocket 升级）
- 其它 → 前端 SPA

### 3.4 关键环境变量（生产 .env）
| 变量 | 必填 | 说明 |
|------|------|------|
| `DB_PASSWORD` | ✅ | MySQL root 密码 |
| `JWT_SECRET` | ✅ | JWT 签名密钥（务必修改） |
| `BSD_API_KEY` | ✅ | BSD SportsData Token |
| `BSD_BASE_URL` | ❌ | 默认 `https://api.bzzoiro.com` |
| `BSD_ENABLED` | ❌ | 默认 `true`，关闭后跳过同步 |
| `CORS_ORIGIN` | ❌ | 逗号分隔白名单，缺省放行所有 |
| `DB_SYNCHRONIZE` | ❌ | 默认 `true`，生产建议 `false`（手动 migrate） |
| `DATA_SYNC_INTERVAL` | ❌ | 同步周期（分钟），默认 60 |
| `SENTIMENT_SYNC_INTERVAL` | ❌ | 情感数据周期（分钟），默认 30 |

### 3.5 代码更新与热部署
```bash
# 本地修改代码后同步到生产
rsync -avz --delete apps/server/src/ root@<server>:/opt/cupai/apps/server/src/
rsync -avz --delete apps/web/src/    root@<server>:/opt/cupai/apps/web/src/

# 重新构建并滚动重启
ssh root@<server> "cd /opt/cupai && docker compose up -d --build server web"
```

---

## 四、核心数据流

### 4.1 赛事数据同步链路
```
BSD API (sports.bzzoiro.com)
        │
        │  HTTP + Token
        ▼
BsdcBusinessService (HTTP 客户端，axios + 重试)
        │
        ▼
BsdcSyncService (同步业务)
  ├── syncEvents()            # 定时拉取 过去180天 ~ 未来30天
  ├── syncLiveEvents()        # 5s 拉取 live 比赛
  ├── syncMatchAuxData()      # 补齐 lineups/stats/odds 等
  ├── syncStandings()         # 积分榜
  ├── syncLineups()           # 阵容（/lineups/ 失败回退 detail.lineups）
  ├── syncVenuesForMatch()    # 场馆
  ├── syncRefereeForMatch()   # 裁判
  ├── upsertMatch()           # 写入 matches 表
  ├── getOrCreateTeam()       # 写入 teams 表
  └── computeTeamStats()      # 从本地已完赛比赛计算场均数据
        │
        ▼
TypeORM → MySQL（cupai-mysql）
        │
        │  WebSocket: gateway.broadcastMatchUpdate()
        ▼
前端 (Vue 3) → MatchDetailView.vue
```

### 4.2 WebSocket 实时推送
- 后端 `MatchGateway` 提供 Socket.io 服务，挂在 `/socket.io/`
- 前端 `apps/web/src/api/websocket.ts` 的 `subscribeMatch(matchId, cb)` 订阅
- 数据更新来源：
  - `syncLiveEvents` 每 5 秒执行
  - `agent` 模块用户提交维度时
  - `ai` 分析报告生成完成时
- 推送载荷（`broadcastMatchUpdate`）：
  ```ts
  { matchId, homeScore, awayScore, currentMinute, period, status,
    bsStatus, halfTimeHome, halfTimeAway, venue, refereeName,
    homeCoach, awayCoach, temperature, humidity, weatherCondition,
    windSpeed, totalAttendance, timestamp }
  ```
- 前端回调：直接 `Object.assign(match, payload)`（不再依赖 type 字段）

### 4.3 AI 分析流程
1. 用户在比赛详情页点击"触发 AI 分析"
2. 前端 POST `/agent/trigger` → `AgentService.triggerAgent()`
3. 后端调用 `AlgorithmService` 计算多维度数据
4. 异步调用 LLM（OpenAI 兼容协议）生成分析报告
5. 通过 `SquareGateway` 推送到分析广场
6. 报告持久化到 `analysis_reports` 表

---

## 五、BSD 同步调度器详解

> 这是本次修复的核心模块，单独一节说明

### 5.1 调度器位置
`apps/server/src/modules/bsd/bsd-sync.scheduler.ts`

### 5.2 调度周期
| 任务 | 周期 | 实现位置 |
|------|------|---------|
| 同步赛事列表（含历史完赛） | 60 min | `syncEvents()` |
| 同步实时赛事 | 5 s | `syncLiveEvents()` |
| 同步积分榜 | 60 min | `syncStandings()` |
| 同步辅助数据 | 60 min | `syncMatchAuxData()` |
| 情感数据 | 30 min | `SentimentService` |

### 5.3 syncEvents 时间范围
**修复前**：`today - 1天 ~ today + 30天`
**修复后**：`today - 180天 ~ today + 30天`
**原因**：扩到 180 天才能拿到完赛比赛，让 `computeTeamStats` 有数据可聚合（场均进球/失球/胜率）。

### 5.4 关键同步方法

#### `upsertMatch(bsEvent, leagueNameMap, teamCache)`
将单条 BSD 赛事写入 `matches` 表：
1. **基础字段**：`home_team_id` / `away_team_id` / `status` / `current_minute` / `home_score` / `away_score` 等
2. **教练姓名**（优先级）：
   - `bsEvent.home_coach.name`（顶级字段，list/detail 端点）
   - `bsEvent.home_team_obj.coach.name`（球队对象）
3. **场馆名**（优先级）：
   - `bsEvent.home_team_obj.venue.name`（球队对象）
   - `bsEvent.venue`（顶级字符串）
   - 通过 `venue_id` 调 `/api/venues/{id}/`（已在 `syncVenuesForMatch`）
4. **裁判**：通过 `referee_id` 调 `/api/referees/{id}/`（已在 `syncRefereeForMatch`），或顶级 `referee` 字符串
5. **天气/温度/湿度**：从 `bsEvent.weather` 提取
6. **null 保护**：`Object.assign` 后，null 值不能覆盖已有非 null 值

#### `syncLiveEvents()`
每 5 秒执行：
1. 拉取 `/api/v2/events/live/`（v2 精简版，无 team_obj/venue/coach）
2. 对每条 live 赛事：
   - `upsertMatch` 更新基础字段
   - **`getEventDetail` 补齐缺失字段**（场馆/裁判/教练/天气）
   - `syncLineups` 同步阵容（`/lineups/` 端点 404 时回退到 detail.lineups）
   - `syncPlayerStats` 同步球员统计
3. **WebSocket 推送** `broadcastMatchUpdate`

#### `syncLineups(match, bsEventId)`
1. 优先 `GET /api/events/{id}/lineups/`
2. 404 时回退 `GET /api/events/{id}/` 的 `lineups` 字段
3. 删除旧记录，重新写入 `event_lineups` 表

#### `getOrCreateTeam(bsdId, name, cache)`
1. 查找已有 team（按 `dataSource = bsd_{id}`）
2. 不存在时调 `/api/teams/{id}/` 创建基础记录
3. **新**：调用 `computeTeamStats` 计算统计字段
4. 缓存到 `teamCache` 避免重复查询

#### `computeTeamStats(team)` (新增)
1. 查 `matches` 表中 `status='finished'` 且含该 team 的完赛比赛
2. 聚合：`avg_goals_scored` / `avg_goals_conceded` / `win_rate`
3. 控球率（BSD API 不提供，跳过）
4. 24h 内不重算

### 5.5 同步状态监控
```bash
# 后端日志
docker logs cupai-server 2>&1 | grep -E "sync|Bsdc|error"

# 健康指标：syncRun 表（每次同步的状态）
docker exec cupai-mysql mysql -uroot -p'xxxx' cupai \
  -e "SELECT task_name, success, duration_ms, finished_at FROM sync_runs ORDER BY id DESC LIMIT 10"
```

---

## 六、本次修复的赛事数据问题（e61f5e58 完整复盘）

### 6.1 问题描述
生产赛事 `e61f5e58-1def-4010-a830-16235765e5c3`（即 BSD `bsd_209487`，Sri Lanka vs Bhutan 国际友谊赛）详情页数据缺失：
- ❌ 场馆、裁判、临场环境
- ❌ 教练、首发阵容
- ❌ 球队统计（场均进球/失球/控球率/胜率）
- ❌ 赛事时长不自动更新

### 6.2 排查路径（5 步定位法）

#### 步骤 1：查生产数据库真实状态
```bash
ssh root@<server>
docker exec cupai-mysql mysql -uroot -p'xxxx' cupai \
  -e "SELECT id, status, venue, referee_name, home_coach, away_coach,
             temperature, humidity, weatherCondition, current_minute,
             last_synced_at
      FROM matches WHERE id='e61f5e58-...'"
```
**结果**：除 `data_source=bsd_209487 / status=live / current_minute=59` 外，其余字段全 NULL。

#### 步骤 2：直接调 BSD API 比对
```bash
# 列表端点（v2 live 精简版）
curl -H "Authorization: Token ..." \
  "https://sports.bzzoiro.com/api/v2/events/live/" | jq '.[0] | keys'
# → 只有 16 个字段：id/league_id/home_team/home_team_id/...
#   无 home_team_obj/away_team_obj/venue/coach/weather/referee

# 详情端点
curl -H "Authorization: Token ..." \
  "https://sports.bzzoiro.com/api/events/209487/" | jq 'keys'
# → 30+ 字段：含 home_coach.name/away_coach.name/lineups/weather 等

# 阵容端点
curl -H "Authorization: Token ..." \
  "https://sports.bzzoiro.com/api/events/209487/lineups/"
# → {"error": 404, "detail": "Not found"}
```

#### 步骤 3：定位代码层 5 个独立根因
| # | 根因 | 证据 |
|---|------|------|
| 1 | **`/api/events/{id}/lineups/` 对低级别赛事返回 404** | curl 验证 |
| 2 | **教练姓名应从顶级 `bsEvent.home_coach.name` 提取** | list 端点有顶级字段，team_obj.coach 可能为空 |
| 3 | **v2 live 端点字段精简**（无 venue/coach/weather） | curl 返回 16 个字段 |
| 4 | **`syncLiveEvents` 早先用 `needsDetail` 守护逻辑**——字段为空才补 | 导致已存在但有缺失的赛事永远不补 |
| 5 | **`upsertMatch` 中 `Object.assign` 时 null 覆盖已有值** | 缺少 null 保护 |

#### 步骤 4：编写并部署修复

修改文件清单（仅列本轮新增/修改）：
```
apps/server/src/modules/bsd/bsd-sync.service.ts
  - 导入 BsEventDetail 类型
  - 注入 MatchGateway（forwardRef 解决循环依赖）
  - syncLineups 增加 detail.lineups 回退
  - syncLiveEvents 改为每次都调 detail 端点
  - upsertMatch 补 null 保护
  - getOrCreateTeam 调用 computeTeamStats
  - 新增 computeTeamStats
  - syncEvents 时间范围 1→180 天

apps/server/src/modules/bsd/bsd.module.ts
  - 导入 forwardRef(() => MatchModule)

apps/server/src/modules/bsd/bsd.interfaces.ts
  - BsEvent / BsEventDetail 补顶级字段

apps/server/src/modules/match/match.module.ts
  - BsdcModule 改 forwardRef

apps/web/src/views/MatchDetailView.vue
  - WebSocket 回调不再依赖 type 字段
  - 4 个统计指标 null 时显示 "—"
```

#### 步骤 5：部署与验证
```bash
# 同步代码到生产
rsync -avz --delete apps/server/src/ root@<server>:/opt/cupai/apps/server/src/
rsync -avz --delete apps/web/src/    root@<server>:/opt/cupai/apps/web/src/

# 重建容器
ssh root@<server> "cd /opt/cupai && docker compose up -d --build server web"

# 等待 5~30 秒，验证
docker exec cupai-mysql mysql -uroot -p'xxxx' cupai \
  -e "SELECT home_coach, away_coach, current_minute FROM matches WHERE id='e61f5e58-...';
      SELECT COUNT(*) FROM event_lineups WHERE match_id='e61f5e58-...';"
# → home_coach='Andy Morrison', away_coach='Pema Dorji', 46 条 lineup
```

### 6.3 修复结果
| 字段 | 修复前 | 修复后 | 数据来源 |
|------|-------|-------|---------|
| 教练 | NULL | Andy Morrison / Pema Dorji | BSD detail 顶级字段 |
| 首发阵容 | 0 条 | 46 条（home 11+12, away 11+12） | detail.lineups 回退 |
| 赛事时长 | 59（静止） | 73+（实时） | live 端点 + WS 推送 |
| 场馆 | NULL | NULL | **BSD 无数据**（低级别友谊赛） |
| 裁判 | NULL | NULL | **BSD 无数据** |
| 天气 | NULL | NULL | **BSD 无数据** |
| 场均进球 | NULL → 0.00 | NULL → "—"（友好提示） | **该队 6 个月内只有 1 场比赛** |

### 6.4 不可解项说明
- **BSD SportsData API 对该国际友谊赛不提供** 场馆 / 裁判 / 天气 / 控球率等数据
- **Sri Lanka 和 Bhutan 在 BSD 系统中过去 180 天仅此一场比赛**，无法聚合场均数据
- 前端通过"显示 —"做友好兜底

---

## 七、运维与排错速查

### 7.1 容器健康检查
```bash
docker compose ps           # 容器状态
docker logs --tail 50 cupai-server
docker logs --tail 50 cupai-web
docker exec cupai-mysql mysql -uroot -p'xxx' -e "SHOW DATABASES;"
docker exec cupai-redis redis-cli ping
```

### 7.2 常见故障

| 现象 | 原因 | 处理 |
|------|------|------|
| 前端 502 | server 容器未就绪 | `docker compose logs server` |
| 同步任务全失败 | BSD API Key 失效 | 检查 `BSD_API_KEY` 是否过期 |
| WebSocket 断连 | nginx 升级头未配置 | 检查 `docker/nginx/frontend.conf` |
| MySQL 表结构异常 | `synchronize=true` 误改 | 备份后 `synchronize=false` + 手动 migrate |
| 端口冲突 | 80/443 被占用 | 修改 `docker-compose.yml` ports 段 |

### 7.3 数据修复流程
> 严禁直接 UPDATE 生产数据库！

1. **代码层修复**：在 `bsd-sync.service.ts` 增加/调整同步逻辑
2. **本地验证**：`pnpm dev:server`，手动调同步接口验证
3. **类型检查**：`npx tsc --noEmit`
4. **同步到生产**：`rsync` 推代码 + `docker compose up -d --build server web`
5. **生产验证**：等同步周期（5s~60min）后查数据库
6. **前端刷新**：用户强刷或 WebSocket 自动推

### 7.4 紧急回滚
```bash
# 代码回滚
ssh root@<server> "cd /opt/cupai && git checkout HEAD~1 -- apps/"
ssh root@<server> "cd /opt/cupai && docker compose up -d --build server web"

# 数据库回滚（仅在自动同步造成数据污染时）
docker exec cupai-mysql mysqldump -uroot -p'xxx' cupai > backup_$(date +%F).sql
```

---

## 八、目录级关键文件索引

| 文件路径 | 作用 |
|---------|------|
| `docker-compose.yml` | 4 容器编排 |
| `pnpm-workspace.yaml` | Monorepo 工作区 |
| `.env.example` | 环境变量模板（生产前必读） |
| `apps/server/src/main.ts` | 后端启动入口 |
| `apps/server/src/app.module.ts` | 根模块（聚合所有业务模块） |
| `apps/server/src/modules/bsd/bsd-sync.scheduler.ts` | 同步定时器 |
| `apps/server/src/modules/bsd/bsd-sync.service.ts` | 同步业务逻辑（本次修复核心） |
| `apps/server/src/modules/bsd/bsd.interfaces.ts` | BSD API 类型定义 |
| `apps/server/src/modules/match/match.gateway.ts` | WebSocket 网关 |
| `apps/server/src/modules/match/match.service.ts` | 赛事 CRUD + 关联 |
| `apps/web/src/views/MatchDetailView.vue` | 赛事详情页（最复杂页面） |
| `apps/web/src/api/websocket.ts` | 前端 WS 订阅封装 |
| `apps/web/src/locales/zh-CN.ts` | 中文 i18n |
| `packages/utils/src/algorithms/` | 跨因子归一化、情感分析算法 |
| `deploy/init.sql` | MySQL 初始化（数据库/字符集） |

---

## 九、BSD 服务操作全量梳理

### 9.1 架构分层

| 层级 | 文件 | 职责 |
|------|------|------|
| HTTP 客户端层 | `bsd.service.ts` | 底层 API 请求、鉴权（Token Header）、内存缓存（300s TTL） |
| 业务映射层 | `bsd.business.service.ts` | 将 BSD API 端点封装为业务方法 |
| 数据同步层 | `bsd-sync.service.ts` | 拉取 BSD 数据并写入本地数据库 |
| 调度层 | `bsd-sync.scheduler.ts` | 定时任务调度、冷启动编排 |
| 控制器层 | `bsd.controller.ts` / `bsd-sync.controller.ts` | HTTP API 暴露 |

### 9.2 同步方法详情

| 方法名 | 功能 | BSD API 端点 | 触发条件 | 执行频率 | 缓存 TTL |
|--------|------|-------------|---------|---------|---------|
| `syncTeams()` | 拉取球队列表，新建时补详情 | `/api/teams/` + `/api/teams/{id}/` | 调度器 / 手动 / 冷启动 | 3h（`BSD_SYNC_TEAMS_INTERVAL_MS`） | 300s |
| `syncLeagues()` | 拉取联赛列表 | `/api/v2/leagues/` | 调度器 / 手动 / 冷启动 | 3h（`BSD_SYNC_LEAGUES_INTERVAL_MS`） | 300s |
| `syncEvents()` | 同步近1天~未来30天赛事 | `/api/events/` + `/api/teams/{id}/` + `/api/v2/venues/{id}/` + `/api/v2/referees/{id}/` | 调度器 / 手动 / 冷启动 | 3min（`BSD_SYNC_EVENTS_INTERVAL_MS`） | 300s |
| `syncLiveEvents()` | 同步进行中赛事（状态/比分/分钟） | `/api/v2/events/live/` + 状态变化时调详情/阵容/统计等 | 调度器 / 手动 / 冷启动 | 5s（`BSD_SYNC_LIVE_INTERVAL_MS`） | 300s |
| `syncMatchAuxData()` | 批量同步赛事子数据 | 详情 + incidents + lineups + odds + stats + predictions + h2h + metadata + playerStats + oddsComparison + social | 调度器 / 手动 / 冷启动 | 3min（`BSD_SYNC_AUX_INTERVAL_MS`） | 300s |
| `syncStandings()` | 积分榜同步 | `/api/v2/leagues/` + `/api/leagues/{id}/standings/` | 调度器 / 手动 / 冷启动 | 15min（`BSD_SYNC_STANDINGS_INTERVAL_MS`） | 300s |
| `syncPlayers()` | 球员同步 | `/api/players/` | 仅手动触发 | 无定时 | 300s |
| `aggregateTeamFormations()` | 阵型聚合（本地） | 无 | 仅手动触发 | 无定时 | 无 |
| `fixTeamCountryCodes()` | 国家代码修复（本地） | 无 | 仅手动触发 | 一次性 | 无 |
| `aggregateTeamStats()` | 球队统计聚合（本地） | 无 | `syncMatchAuxData` 完成后自动调用 | 跟随 aux（3min） | 无 |

### 9.3 子数据同步方法（内部调用）

| 方法名 | 功能 | BSD API 端点 | 写入实体 | 调用方 |
|--------|------|-------------|---------|--------|
| `syncIncidents()` | 事件流（进球/红黄牌/换人） | `/api/events/{id}/incidents/` | `EventIncidentEntity` | syncLiveEvents, syncMatchAuxData |
| `syncLineups()` | 首发阵容（fallback detail.lineups） | `/api/events/{id}/lineups/` | `EventLineupEntity` | syncLiveEvents, syncMatchAuxData |
| `syncOdds()` | 赔率 | `/api/events/{id}/odds/` | `EventOddsEntity` | syncMatchAuxData |
| `syncStats()` | 赛事统计（射门/控球/xG/shotmap） | `/api/events/{id}/stats/` | `EventStatsEntity` + `MatchEntity.matchData` | syncLiveEvents, syncMatchAuxData |
| `syncPredictions()` | AI 预测 | `/api/predictions/` | `EventPredictionEntity` | syncMatchAuxData |
| `syncH2H()` | 交锋记录 | `/api/events/{id}/h2h/` | `MatchEntity.h2hData` | syncMatchAuxData |
| `syncMetadata()` | 元数据（球衣/趣味事实） | `/api/events/{id}/metadata/` | `MatchEntity.metadata` | syncLiveEvents, syncMatchAuxData |
| `syncPlayerStats()` | 球员统计 | `/api/events/{id}/player-stats/` | `MatchEntity.playerStatsData` + `PlayerEntity` | syncLiveEvents, syncMatchAuxData |
| `syncOddsComparison()` | 赔率对比 | `/api/events/{id}/odds/comparison/` | `MatchEntity.oddsComparison` | syncMatchAuxData |
| `syncSocial()` | 社交媒体 | `/api/events/{id}/social/` | `MatchEntity.socialData` | syncMatchAuxData |
| `syncVenuesForMatch()` | 场馆信息 | `/api/v2/venues/{id}/` | `MatchEntity` | syncLiveEvents, syncMatchAuxData |
| `syncRefereeForMatch()` | 裁判信息 | `/api/v2/referees/{id}/` | `MatchEntity` | syncLiveEvents, syncMatchAuxData |
| `syncCoachesForMatch()` | 教练信息 | 从 event detail 嵌套对象提取 | `MatchEntity` | syncLiveEvents, syncMatchAuxData |

### 9.4 调度器配置

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `BSD_SYNC_LIVE_INTERVAL_MS` | 5000 | 实时赛事同步间隔 |
| `BSD_SYNC_EVENTS_INTERVAL_MS` | 180000 | 赛事列表同步间隔 |
| `BSD_SYNC_AUX_INTERVAL_MS` | 180000 | 辅助数据同步间隔 |
| `BSD_SYNC_STANDINGS_INTERVAL_MS` | 900000 | 积分榜同步间隔 |
| `BSD_SYNC_TEAMS_INTERVAL_MS` | 10800000 | 球队同步间隔 |
| `BSD_SYNC_LEAGUES_INTERVAL_MS` | 10800000 | 联赛同步间隔 |
| `BSD_SYNC_TICK_INTERVAL_MS` | 15000 | 中频任务 tick 检查间隔 |

**冷启动顺序**：leagues → teams → events → standings → aux（错峰串行）
**互斥机制**：每个任务有 `running` 标志，上一次未结束时跳过本次触发

### 9.5 HTTP API 端点

**数据代理**（`/bsd`）：

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/bsd/events` | 赛事列表 |
| GET | `/bsd/events/live` | 实时赛事 |
| GET | `/bsd/events/:id` | 赛事详情 |
| GET | `/bsd/events/:id/stats` | 赛事统计 |
| GET | `/bsd/events/:id/incidents` | 事件流 |
| GET | `/bsd/events/:id/lineups` | 阵容 |
| GET | `/bsd/events/:id/odds` | 赔率 |
| GET | `/bsd/leagues` | 联赛列表 |
| GET | `/bsd/leagues/:id/standings` | 积分榜 |
| GET | `/bsd/teams` | 球队列表 |
| GET | `/bsd/teams/:id` | 球队详情 |
| GET | `/bsd/odds/best` | 最佳赔率 |
| GET | `/bsd/predictions` | AI 预测 |

**同步管理**（`/bsd/sync`）：

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/bsd/sync/status` | 同步状态 |
| POST | `/bsd/sync/enable` | 启用调度 |
| POST | `/bsd/sync/disable` | 停用调度 |
| POST | `/bsd/sync/teams` | 手动触发球队同步 |
| POST | `/bsd/sync/leagues` | 手动触发联赛同步 |
| POST | `/bsd/sync/events` | 手动触发赛事同步 |
| POST | `/bsd/sync/live` | 手动触发实时同步 |
| POST | `/bsd/sync/standings` | 手动触发积分榜同步 |
| POST | `/bsd/sync/aux` | 手动触发辅助数据同步 |
| POST | `/bsd/sync/players` | 手动触发球员同步 |
| POST | `/bsd/sync/formations` | 手动触发阵型聚合 |
| POST | `/bsd/sync/full` | 一键全量同步 |
| POST | `/bsd/sync/fix-team-country-codes` | 修复国家代码 |

### 9.6 BSD API 端点完整清单

| 端点 | 用途 | 调用方 |
|------|------|--------|
| `/api/events/` | 赛事列表 | syncEvents, controller |
| `/api/v2/events/live/` | 实时赛事 | syncLiveEvents, controller |
| `/api/events/{id}/` | 赛事详情 | syncLiveDataForMatch, syncMatchAuxData, syncCoachesForMatch |
| `/api/events/{id}/stats/` | 赛事统计 | syncStats, controller |
| `/api/events/{id}/incidents/` | 事件流 | syncIncidents, controller |
| `/api/events/{id}/lineups/` | 阵容 | syncLineups, controller |
| `/api/events/{id}/odds/` | 赔率 | syncOdds, controller |
| `/api/events/{id}/predictions/` | 预测 | syncPredictions, controller |
| `/api/events/{id}/h2h/` | 交锋记录 | syncH2H |
| `/api/events/{id}/metadata/` | 元数据 | syncMetadata |
| `/api/events/{id}/player-stats/` | 球员统计 | syncPlayerStats |
| `/api/events/{id}/odds/comparison/` | 赔率对比 | syncOddsComparison |
| `/api/events/{id}/social/` | 社交媒体 | syncSocial |
| `/api/events/{id}/broadcasts/` | 转播信息 | business service |
| `/api/v2/leagues/` | 联赛列表 | syncLeagues, syncStandings |
| `/api/leagues/{id}/standings/` | 积分榜 | syncStandings |
| `/api/teams/` | 球队列表 | syncTeams |
| `/api/teams/{id}/` | 球队详情 | getOrCreateTeam |
| `/api/players/` | 球员列表 | syncPlayers |
| `/api/players/{id}/` | 球员详情 | controller |
| `/api/players/{id}/stats/` | 球员赛季统计 | controller |
| `/api/v2/venues/{id}/` | 场馆详情 | syncVenuesForMatch |
| `/api/v2/referees/{id}/` | 裁判详情 | syncRefereeForMatch |
| `/api/odds/best/` | 最佳赔率 | controller |
| `/api/predictions/` | 预测列表 | syncPredictions |
| `/api/bookmakers/` | 博彩公司 | business service |

---

## 十、WebSocket 应用场景全量梳理

### 10.1 架构总览

项目使用 **Socket.IO**（非原生 WebSocket），分为两个独立命名空间：

| 命名空间 | 服务端文件 | 客户端连接函数 | 注册模块 |
|----------|-----------|---------------|---------|
| `/match` | `match.gateway.ts` | `getMatchSocket()` | MatchModule |
| `/square` | `square.gateway.ts` | `getSquareSocket()` | AgentModule |

客户端管理文件：`apps/web/src/api/websocket.ts`

### 10.2 赛事频道（`/match` namespace）

#### 客户端 → 服务端事件

| 事件名 | 功能 | 数据格式 |
|--------|------|----------|
| `subscribe:match` | 订阅特定赛事 | `matchId: string` |
| `unsubscribe:match` | 取消订阅赛事 | `matchId: string` |

#### 服务端 → 客户端事件

| 事件名 | 方法 | 功能 | 数据格式 |
|--------|------|------|----------|
| `match:update` | `broadcastMatchUpdate()` | 赛事状态更新 | `{ matchId, homeScore, awayScore, currentMinute, period, status, bsStatus, halfTimeHome, halfTimeAway, venue, refereeName, homeCoach, awayCoach, temperature, humidity, weatherCondition, windSpeed, totalAttendance, timestamp }` |
| `match:score` | `broadcastScoreChange()` | 比分变更 | `{ matchId, homeScore, awayScore, timestamp }` |
| `match:status` | `broadcastMatchStatusChange()` | 全局赛事状态变更 | `{ matchId, status, timestamp }` |
| `standings:update` | `broadcastStandingsUpdate()` | 积分榜更新 | `{ ...data, timestamp }` |

> **注意**：`MatchGateway` 的 `broadcast*` 方法目前由 `bsd-sync.service.ts` 中的 `syncLiveEvents` 调用，用于实时推送赛事状态变化。

### 10.3 分析广场频道（`/square` namespace）

#### 服务端 → 客户端事件

| 事件名 | 方法 | 功能 | 数据格式 | 调用位置 |
|--------|------|------|----------|----------|
| `report:new` | `broadcastNewReport()` | 新分析报告 / 实时比分推送 | 见下方 | `agent-scheduler.service.ts` |
| `report:interaction` | `broadcastReportInteraction()` | 报告互动更新 | `{ reportId, ...data, timestamp }` | 未被调用 |

#### `report:new` 事件的两种数据格式

**格式 A — 实时比分推送**：
```json
{
  "type": "live_update",
  "matchId": "<match_id>",
  "homeScore": 2,
  "awayScore": 1,
  "timestamp": "2026-06-09T12:00:00.000Z"
}
```

**格式 B — 新分析报告通知**：
```json
{
  "type": "new_report",
  "reportId": "<report_id>",
  "matchId": "<match_id>",
  "timestamp": "2026-06-09T12:00:00.000Z"
}
```

### 10.4 客户端订阅场景

| 页面 | 订阅频道 | 处理逻辑 |
|------|---------|---------|
| `MatchDetailView.vue` | `subscribeMatch(matchId, cb)` | `live_update` → 更新比分/分钟/period；`match:update` → `Object.assign` 全量合并 |
| `AnalysisSquareView.vue` | `subscribeSquare(cb)` | `new_report` → 列表顶部插入新报告 |

### 10.5 定时任务与推送触发

| Cron 表达式 | 方法 | 功能 | WebSocket 推送 |
|-------------|------|------|---------------|
| `*/30 * * * *` | 每 30 分钟 | Agent 自动分析 | `squareGateway.broadcastNewReport({ type: 'new_report' })` |
| `*/5 * * * *` | 每 5 分钟 | 检查进行中赛事 | `squareGateway.broadcastNewReport({ type: 'live_update' })` |
| BSD live 同步（5s） | `syncLiveEvents` | 实时赛事状态变化 | `matchGateway.broadcastMatchUpdate()` |

### 10.6 WebSocket 连接配置

**客户端**（`websocket.ts`）：
- 连接地址：`VITE_WS_URL` 环境变量，默认 `ws://localhost:3001`
- 传输方式：`websocket`（仅 WebSocket，不使用 polling）
- 自动重连：最多 5 次，间隔 1 秒
- 连接缓存：单例模式，`matchSocket` 和 `squareSocket` 各一个

**服务端**（两个 Gateway）：
- CORS：`origin: '*'`（生产环境需限制）
- 命名空间：`/match` 和 `/square`

### 10.7 前端比赛时长自动更新机制

赛事详情页采用 **定时 API 校准 + WebSocket 即时更新** 双层策略：

1. **定时 API 校准**：当赛事状态为 `live` 时，每 60 秒重新 fetch 赛事详情，更新 `currentMinute`、`period`、`homeScore`、`awayScore`、`status` 等实时字段
2. **WebSocket 即时更新**：`live_update` 事件同时处理 `currentMinute` 和 `period`，比分变化即时反映
3. **自动启停**：赛事结束或离开页面时自动停止轮询

---

## 十一、版本历史

| 日期 | 变更 |
|------|------|
| 2026-06-08 | 修复赛事 e61f5e58 详情数据缺失（场馆/裁判/教练/天气/阵容/统计/时长） |
| 2026-06-08 | `syncEvents` 时间范围扩展到 180 天 |
| 2026-06-08 | 新增 `computeTeamStats` 自计算球队统计 |
| 2026-06-08 | WebSocket 回调修复 + 字段缺失时前端显示 "—" |
| 2026-06-09 | 赛事详情页信息补全（球员统计15列/身高体重/阵容状态/球衣颜色/临场环境/教练等） |
| 2026-06-09 | BSD 同步 fallback 修复（venue/referee 从嵌套对象提取） |
| 2026-06-09 | 比赛时长每分钟自动更新机制 |
| 2026-06-09 | skill.md 维度选项修正 + 新增6个API端点 + 分析规则章节 |
| 2026-06-09 | 复制分析指令精简（引用 skill.md / 移除冗余数据） |
| 2026-06-09 | BSD 服务操作全量梳理 + WebSocket 应用场景梳理 |

---

**文档结束**
