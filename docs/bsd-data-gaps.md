# BSD 数据缺失清单（仅未实现项）

> 本文档**仅列出无法实现**的数据字段。
> 已实现的功能（场馆/球员/球员统计/H2H/元数据/赔率对比/社交/精彩集锦/中文名/头像/湿度等）不在此处重复列出。
> 最后更新：2026-06-08

---

## 真正无法实现的数据（7 项）

| # | 数据 | 缺失原因 | 可能的替代方案（均需成本/合规权衡） |
|---|------|---------|--------------------------------|
| 1 | **裁判姓名** | BSD API 无 `/referees/{id}/` 接口，仅提供 `referee_id` | 无可行方案 |
| 2 | **裁判国籍** | 同上 | 无可行方案 |
| 3 | **裁判执法风格** | 无任何数据源 | 需 AI 基于历史判罚数据生成（开发成本高） |
| 4 | **主队球迷人数** | BSD `event detail.attendance` 仅提供总人数 | 需接入票务 API（如 SeatGeek）或按主客比例估算 |
| 5 | **客队球迷人数** | 同上 | 同上 |
| 6 | **FIFA 排名** | BSD 无此字段 | 需接入 FIFA 官方排名或第三方 API（如 API-Football） |
| 7 | **球队攻防风格** | 无结构化数据 | 需 AI 基于历史统计生成风格标签（高/低位防守、控球/反击等） |

---

## 备注：之前标注为"无法实现"但已修复的项

以下之前标注 ❌ 的项，现已通过新增 BSD v2 接口或外部 API 实现，**不再属于缺失项**：

| 原问题 | 现状 | 实现方式 |
|--------|------|---------|
| 场馆名称/城市/容量 | ✅ | BSD `/venues/{id}/` + `syncVenuesForMatch()` |
| 球员年龄/身价/伤病/评分 | ✅ | BSD `/players/{id}/` + `syncPlayers()` |
| 赛季进球/助攻/红黄牌 | ✅ | BSD `/events/{id}/player-stats/` + `aggregatePlayerSeasonStats()` |
| 主打阵型 | ✅ | 从 `/events/{id}/lineups/`.formation 聚合历史 + `aggregateTeamFormations()` |
| 比赛湿度/详细天气 | ✅ | Open-Meteo API + `WeatherService`（免费无需 key） |
| 球员头像 | ✅ | TheSportsDB API + `PlayerAvatarService`（免费 key） |
| 球员中文名 | ✅ | 本地 200+ 映射表 + `getPlayerChineseName()` |
| 精彩集锦视频 | ✅ | BSD event detail.highlights + `GET :id/highlights` |
| 赛事元数据（球衣/趣味事实） | ✅ | BSD `/events/{id}/metadata/` + `GET :id/metadata` |
| 交锋记录 H2H | ✅ | BSD `/events/{id}/h2h/` + `GET :id/h2h` |
| 赔率对比 | ✅ | BSD `/events/{id}/odds/comparison/` + `GET :id/odds-comparison` |
| 社交媒体内容 | ✅ | BSD `/events/{id}/social/` + `GET :id/social` |
| 赛事统计 stats | ✅ | BSD `/events/{id}/stats/` + `syncStats()` + 回填 `MatchEntity.matchData` |
| 赛事事件流 incidents | ✅ | BSD `/events/{id}/incidents/` + `syncIncidents()`（合成 32 位 hash id，兼容 BSD 不返回稳定 id 的限制） + `GET :id/incidents` |
| 赛事阵容 lineups | ✅ | BSD `/events/{id}/lineups/` + `syncLineups()`（bs_player_id nullable 兼容 BSD 不返回 id） + `GET :id/lineups` |
| 赛事赔率 odds | ✅ | BSD `/events/{id}/odds/` + `syncOdds()` + `GET :id/odds`（完赛 BSD 自动清空 null） |

---

## 数据库现状（2026-06-08）

| 表 | 记录数 | 说明 |
|---|--------|------|
| matches | 202 | 全部为 upcoming 状态（场馆/赛事信息已同步） |
| teams | 1502 | — |
| players | 0 | `/players/` 同步代码已就绪，等待触发 |
| event_stats | 0 | 已验证完整同步链路（端到端测试：6 corners / 11 射门 / 40% 控球等 16 个指标 + 28 shotmap + 92 momentum + 14 xg_per_minute），等待 live/finished 赛事自动写入 |
| event_incidents | 0 | 已验证完整同步链路（端到端测试：15 条事件，含 5 黄牌/2 进球/8 换人，按 minute 升序），等待 live/finished 赛事自动写入 |
| event_lineups | 0 | 已验证完整同步链路（端到端测试：40 条记录，11首发+9替补×2 队，阵型 3-4-2-1/4-2-3-1），等待未来 6h 内赛事自动写入 |
| event_odds | 0 | 已验证完整同步链路（schema 一致），但 BSD API 在赛事结束后清空赔率（null），即将开始/进行中赛事可正常获取 |
| group_standings | 1094 | 101 条已更新为正确小组名 |
| dimension_submissions | 20 | platform 通过 `modelToPlatformKey()` 推断 |
| leagues | 65 | — |
