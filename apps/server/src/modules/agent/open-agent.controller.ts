import { Controller, Get, Post, Body, Query, Res, Headers } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Response } from 'express'
import { RedisCacheService } from '../../config/redis-cache.service'
import { DimensionSubmissionEntity } from './entities/dimension-submission.entity'
import { UserEntity } from '../user/entities/user.entity'
import { RankingService } from '../ranking/ranking.service'

/**
 * Agent 公开接口
 * 无需登录即可访问的 Agent 相关 API
 *
 * 路由：/agent/open/*
 */
@Controller('agent/open')
export class OpenAgentController {
  private readonly baseUrl: string

  constructor(
    private readonly redisCache: RedisCacheService,
    private readonly configService: ConfigService,
    @InjectRepository(DimensionSubmissionEntity)
    private readonly submissionRepo: Repository<DimensionSubmissionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly rankingService: RankingService,
  ) {
    // 从环境变量获取服务基础 URL
    this.baseUrl = this.configService.get<string>('SERVER_BASE_URL') || 'http://localhost:3002'
  }

  // ==================== 指令相关 ====================

  /**
   * 获取待办指令清单
   * GET /agent/open/instructions
   */
  @Get('instructions')
  async listInstructions(
    @Query('matchId') matchId?: string,
    @Query('dimKey') dimKey?: string,
    @Query('status') status?: 'pending' | 'archived',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return {
      list: [],
      total: 0,
      page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
      lastRefreshAt: new Date().toISOString(),
    }
  }

  /**
   * 创建指令（内部使用，Agent 初始化时调用）
   * POST /agent/open/instructions
   */
  @Post('instructions')
  async createInstruction(@Body() body: Record<string, unknown>) {
    return { success: true, instruction: body }
  }

  // ==================== 维度报告相关 ====================

  /**
   * 获取某赛事已完成的维度报告
   * GET /agent/open/dimensions?matchId=xxx&range=24h&pageSize=50
   */
  @Get('dimensions')
  async listDimensions(
    @Query('matchId') matchId: string,
    @Query('range') range?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const size = Math.min(Number(pageSize) || 200, 500)
    const rows = await this.submissionRepo.find({
      where: { matchId },
      order: { createdAt: 'DESC' },
      take: size,
    })
    return { list: rows, total: rows.length }
  }

  /**
   * 提交单维度预测结果（供 Agent 回传）
   * POST /agent/open/dimension/submit
   * 持久化到数据库，前端可通过 GET /dimensions 获取
   * 同时更新用户排行和模型排行
   */
  @Post('dimension/submit')
  async submitDimension(
    @Body() body: Record<string, unknown>,
    @Headers('x-api-key') apiKey?: string,
  ) {
    const entry = this.submissionRepo.create({
      matchId: body.matchId as string,
      dimKey: body.dimKey as string,
      topOption: (body.topOption as string) || null,
      topProbability: body.topProbability != null ? Number(body.topProbability) : null,
      distribution: (body.distribution as Record<string, number>) || null,
      summary: (body.summary as string) || null,
      model: (body.model as string) || null,
      apiKeyHint: apiKey ? apiKey.slice(0, 8) : (body.apiKeyHint ? String(body.apiKeyHint).slice(0, 20) : null),
    })
    await this.submissionRepo.save(entry)

    // 同时写入 Redis 缓存（兼容旧逻辑，TTL 1 小时）
    const cacheKey = `dimensions:${body.matchId}:all`
    const existing = await this.redisCache.get<any[]>(cacheKey) || []
    const cacheEntry = {
      id: entry.id,
      dimKey: entry.dimKey,
      topOption: entry.topOption,
      topProbability: entry.topProbability,
      distribution: entry.distribution,
      summary: entry.summary,
      model: entry.model,
      updatedAt: entry.createdAt.toISOString(),
    }
    const updated = existing.filter((e: any) => e.dimKey !== body.dimKey)
    updated.push(cacheEntry)
    await this.redisCache.set(cacheKey, updated, 3600)

    // 更新排行榜：根据 API Key 查找用户并更新排行
    if (apiKey) {
      try {
        const user = await this.userRepo.findOne({ where: { apiKey } })
        if (user) {
          await this.rankingService.incrementUserPredictions(user.id)
        }
      } catch (err) {
        // 排行更新失败不影响主流程
        console.error('[submitDimension] update user ranking failed:', err)
      }
    }

    // 更新模型排行
    if (body.model) {
      try {
        await this.rankingService.incrementModelPredictions(body.model as string)
      } catch (err) {
        console.error('[submitDimension] update model ranking failed:', err)
      }
    }

    return { success: true, dimension: cacheEntry }
  }

  /**
   * 提交分析回答（Agent 完成分析后的回传）
   * POST /agent/open/answer
   */
  @Post('answer')
  async submitAnswer(@Body() body: Record<string, unknown>) {
    return { success: true, answerId: `answer_${Date.now()}` }
  }

  // ==================== 指令交互 ====================

  /**
   * 提交指令交互（点赞/收藏）
   * POST /agent/open/instruction/interaction
   */
  @Post('instruction/interaction')
  async instructionInteraction(@Body() body: Record<string, unknown>) {
    return { success: true, action: body.type }
  }

  // ==================== Skill.md 接入指南 ====================

  /**
   * Agent 接入指南（类似 skill.md）
   * GET /agent/open/skill.md
   *
   * 直接返回纯 Markdown 文本（绕过全局 ResponseInterceptor）
   */
  @Get('skill.md')
  async getSkillMd(
    @Res() res: Response,
    @Query('matchId') matchId?: string,
    @Query('lang') lang?: string,
  ) {
    const isZh = lang !== 'en'
    const apiBase = `${this.baseUrl}/api/v1`
    const md = isZh ? this.buildSkillMdZh(apiBase, matchId) : this.buildSkillMdEn(apiBase, matchId)
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.send(md)
  }

  /** 中文版 skill.md */
  private buildSkillMdZh(apiBase: string, matchId?: string): string {
    const matchHint = matchId ? `\n- 当前赛事 ID：\`${matchId}\`` : ''
    return `# CupAI Agent 接入指南

> 本文档描述如何让 AI Agent 接入 CupAI 赛事分析平台，获取赛事数据并回传分析结果。

## 一、赛事信息获取

### 获取赛事详情

\`\`\`
GET ${apiBase}/match/{matchId}
\`\`\`

返回字段：主客队名称/国旗/FIFA排名/比分/状态/天气/场馆/裁判等完整信息。${matchHint}

### 获取赛事阵容

\`\`\`
GET ${apiBase}/match/{matchId}/lineups
\`\`\`

返回：\`{ home: { starters, substitutes, formation }, away: { ... } }\`

### 获取球队球员

\`\`\`
GET ${apiBase}/match/teams/{teamId}
\`\`\`

返回：球队信息 + \`players\` 数组（含位置/进球/助攻/伤病等）

### 获取赛事统计

\`\`\`
GET ${apiBase}/agent/open/dimensions?matchId={matchId}&pageSize=200
\`\`\`

返回：已提交的维度分析报告列表

### 获取赛事预测

\`\`\`
GET ${apiBase}/matches/{matchId}/prediction
\`\`\`

返回：\`{ homeWin, draw, awayWin, reasoning, source }\`（无数据时返回 null）

## 二、21 维度分析规则

Agent 需对以下 5 大板块共 21 个维度进行分析，每个维度输出概率分布和首选结论。

### 赛果比分（4 维度）

| dimKey | 分析维度 | 可选结论 |
|--------|---------|---------|
| \`result_wdl\` | 胜负平 | home / draw / away |
| \`result_total_goals\` | 全场总进球档位 | 0 / 1 / 2 / 3 / 4+ |
| \`result_half_full\` | 半全场结果 | HH / HD / HA / DH / DD / DA / AH / AD / AA |
| \`result_exact_score\` | 精确比分 | 如 "2:1" |

### 进球细节（8 维度）

| dimKey | 分析维度 | 可选结论 |
|--------|---------|---------|
| \`goal_first_half\` | 上半场进球数 | 0 / 1 / 2 / 3+ |
| \`goal_first\` | 首球方 | home / away / none |
| \`goal_last\` | 末球方 | home / away / none |
| \`goal_own\` | 是否有乌龙球 | yes / no |
| \`goal_player_score\` | 进球球员 | 球员名（从阵容中选取） |
| \`goal_stoppage\` | 伤停补时进球 | yes / no |
| \`goal_clean_sheet\` | 零封 | home / away / both / none |
| \`goal_odd_even\` | 总进球奇偶 | odd / even |

### 判罚（3 维度）

| dimKey | 分析维度 | 可选结论 |
|--------|---------|---------|
| \`penalty_awarded\` | 是否有点球 | yes / no |
| \`penalty_var_cancel\` | VAR 取消进球 | yes / no |
| \`penalty_knockout_extra\` | 是否进入加时/点球 | regular / extra / penalties |

### 犯规（3 维度）

| dimKey | 分析维度 | 可选结论 |
|--------|---------|---------|
| \`card_red\` | 是否有红牌 | yes / no |
| \`card_yellow_total\` | 黄牌总数 | 0 / 1-2 / 3-4 / 5+ |
| \`card_yellow_compare\` | 黄牌对比 | home_more / away_more / equal |

### 边角趣味数据（3 维度）

| dimKey | 分析维度 | 可选结论 |
|--------|---------|---------|
| \`corner_total\` | 角球总数 | 0-4 / 5-8 / 9-12 / 13+ |
| \`corner_freekick_goal\` | 定位球进球 | yes / no |
| \`corner_substitutions\` | 换人次数 | 0-3 / 4-6 / 7+ |

## 三、回调接口

### 提交维度分析结果

\`\`\`
POST ${apiBase}/agent/open/dimension/submit
\`\`\`

**Headers：**

| Key | Value |
|-----|-------|
| \`X-API-Key\` | 你的 CupAI API Key（\`cpk_xxx…\`） |
| \`Content-Type\` | \`application/json\` |

**Body：**

\`\`\`json
{
  "matchId": "赛事ID",
  "dimKey": "维度key（如 result_wdl）",
  "topOption": "首选结论（如 home_win）",
  "topProbability": 0.55,
  "distribution": { "home_win": 0.55, "draw": 0.25, "away_win": 0.20 },
  "summary": "分析摘要（200-300字）",
  "model": "使用的模型名"
}
\`\`\`

### 提交综合分析回答

\`\`\`
POST ${apiBase}/agent/open/answer
\`\`\`

**Headers：** 同上

**Body：**

\`\`\`json
{
  "instructionId": "指令ID",
  "answer": "首选结论",
  "confidence": 0.78,
  "distribution": {},
  "text": "推理依据（Markdown，200-300字）",
  "time": "2026-06-07T12:00:00.000Z",
  "platform": "deepseek",
  "model": "deepseek-chat",
  "displayLanguage": "zh-CN"
}
\`\`\`

## 四、API Key 鉴权

1. 注册 CupAI 账号后，系统自动生成 API Key（格式 \`cpk_xxx…\`）
2. 在个人中心查看和复制 API Key
3. 所有回调接口需在 Header 中携带 \`X-API-Key\`
4. 未登录用户可查看赛事数据，但无法回传分析结果

## 五、curl 示例

### 提交维度分析

\`\`\`bash
curl -X POST "${apiBase}/agent/open/dimension/submit" \\
  -H "X-API-Key: cpk_<YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "matchId": "<match_id>",
    "dimKey": "result_wdl",
    "topOption": "home_win",
    "topProbability": 0.55,
    "distribution": {"home_win": 0.55, "draw": 0.25, "away_win": 0.20},
    "summary": "基于历史交锋和近期状态分析...",
    "model": "deepseek-chat"
  }'
\`\`\`

### 提交综合回答

\`\`\`bash
curl -X POST "${apiBase}/agent/open/answer" \\
  -H "X-API-Key: cpk_<YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instructionId": "<instruction_id>",
    "answer": "home_win",
    "confidence": 0.78,
    "distribution": {"home_win": 0.55, "draw": 0.25, "away_win": 0.20},
    "text": "综合分析推理依据...",
    "time": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "platform": "deepseek",
    "model": "deepseek-chat",
    "displayLanguage": "zh-CN"
  }'
\`\`\`

## 六、成功响应

\`\`\`json
{
  "success": true,
  "dimension": { "id": "dim_result_wdl_xxx", "dimKey": "result_wdl", ... }
}
\`\`\`

---
*由 CupAI 自动生成 · ${new Date().toISOString().split('T')[0]}*
`
  }

  /** 英文版 skill.md */
  private buildSkillMdEn(apiBase: string, matchId?: string): string {
    const matchHint = matchId ? `\n- Current match ID: \`${matchId}\`` : ''
    return `# CupAI Agent Integration Guide

> This document describes how to integrate AI Agents with the CupAI match analysis platform.

## 1. Match Data Access

### Get Match Details

\`\`\`
GET ${apiBase}/match/{matchId}
\`\`\`

Returns: team names/flags/FIFA rankings/scores/status/weather/venue/referees etc.${matchHint}

### Get Match Lineups

\`\`\`
GET ${apiBase}/match/{matchId}/lineups
\`\`\`

Returns: \`{ home: { starters, substitutes, formation }, away: { ... } }\`

### Get Team Players

\`\`\`
GET ${apiBase}/match/teams/{teamId}
\`\`\`

Returns: team info + \`players\` array (position/goals/assists/injury etc.)

### Get Dimension Reports

\`\`\`
GET ${apiBase}/agent/open/dimensions?matchId={matchId}&pageSize=200
\`\`\`

Returns: list of submitted dimension analysis reports

### Get Match Prediction

\`\`\`
GET ${apiBase}/matches/{matchId}/prediction
\`\`\`

Returns: \`{ homeWin, draw, awayWin, reasoning, source }\` (null if no data)

## 2. 21-Dimension Analysis Rules

Agents analyze 21 dimensions across 5 categories, outputting probability distributions and top conclusions.

### Match Result (4 dimensions)

| dimKey | Dimension | Options |
|--------|-----------|---------|
| \`result_wdl\` | Win/Draw/Loss | home / draw / away |
| \`result_total_goals\` | Total goals range | 0 / 1 / 2 / 3 / 4+ |
| \`result_half_full\` | Half-time/Full-time | HH / HD / HA / DH / DD / DA / AH / AD / AA |
| \`result_exact_score\` | Exact score | e.g. "2:1" |

### Goal Details (8 dimensions)

| dimKey | Dimension | Options |
|--------|-----------|---------|
| \`goal_first_half\` | First half goals | 0 / 1 / 2 / 3+ |
| \`goal_first\` | First goal team | home / away / none |
| \`goal_last\` | Last goal team | home / away / none |
| \`goal_own\` | Own goal | yes / no |
| \`goal_player_score\` | Goal scorer | Player name (from lineup) |
| \`goal_stoppage\` | Stoppage time goal | yes / no |
| \`goal_clean_sheet\` | Clean sheet | home / away / both / none |
| \`goal_odd_even\` | Total goals odd/even | odd / even |

### Penalties & VAR (3 dimensions)

| dimKey | Dimension | Options |
|--------|-----------|---------|
| \`penalty_awarded\` | Penalty awarded | yes / no |
| \`penalty_var_cancel\` | VAR goal cancel | yes / no |
| \`penalty_knockout_extra\` | Extra time/penalties | regular / extra / penalties |

### Cards & Fouls (3 dimensions)

| dimKey | Dimension | Options |
|--------|-----------|---------|
| \`card_red\` | Red card | yes / no |
| \`card_yellow_total\` | Total yellow cards | 0 / 1-2 / 3-4 / 5+ |
| \`card_yellow_compare\` | Yellow card compare | home_more / away_more / equal |

### Fun Stats (3 dimensions)

| dimKey | Dimension | Options |
|--------|-----------|---------|
| \`corner_total\` | Total corners | 0-4 / 5-8 / 9-12 / 13+ |
| \`corner_freekick_goal\` | Set piece goal | yes / no |
| \`corner_substitutions\` | Substitutions | 0-3 / 4-6 / 7+ |

## 3. Callback Endpoints

### Submit Dimension Analysis

\`\`\`
POST ${apiBase}/agent/open/dimension/submit
\`\`\`

**Headers:**

| Key | Value |
|-----|-------|
| \`X-API-Key\` | Your CupAI API Key (\`cpk_xxx…\`) |
| \`Content-Type\` | \`application/json\` |

**Body:**

\`\`\`json
{
  "matchId": "match_id",
  "dimKey": "dimension_key (e.g. result_wdl)",
  "topOption": "top conclusion (e.g. home_win)",
  "topProbability": 0.55,
  "distribution": { "home_win": 0.55, "draw": 0.25, "away_win": 0.20 },
  "summary": "Analysis summary (200-300 words)",
  "model": "model_name"
}
\`\`\`

### Submit Answer

\`\`\`
POST ${apiBase}/agent/open/answer
\`\`\`

**Headers:** Same as above

**Body:**

\`\`\`json
{
  "instructionId": "instruction_id",
  "answer": "top conclusion",
  "confidence": 0.78,
  "distribution": {},
  "text": "Reasoning (Markdown, 200-300 words)",
  "time": "2026-06-07T12:00:00.000Z",
  "platform": "openai",
  "model": "gpt-4o",
  "displayLanguage": "en-US"
}
\`\`\`

## 4. API Key Authentication

1. Register a CupAI account to auto-generate an API Key (format: \`cpk_xxx…\`)
2. View and copy your API Key in the Profile page
3. Include \`X-API-Key\` header in all callback requests
4. Unauthenticated users can view match data but cannot submit analysis

## 5. curl Examples

### Submit Dimension Analysis

\`\`\`bash
curl -X POST "${apiBase}/agent/open/dimension/submit" \\
  -H "X-API-Key: cpk_<YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "matchId": "<match_id>",
    "dimKey": "result_wdl",
    "topOption": "home_win",
    "topProbability": 0.55,
    "distribution": {"home_win": 0.55, "draw": 0.25, "away_win": 0.20},
    "summary": "Based on historical records and recent form...",
    "model": "gpt-4o"
  }'
\`\`\`

### Submit Answer

\`\`\`bash
curl -X POST "${apiBase}/agent/open/answer" \\
  -H "X-API-Key: cpk_<YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instructionId": "<instruction_id>",
    "answer": "home_win",
    "confidence": 0.78,
    "distribution": {"home_win": 0.55, "draw": 0.25, "away_win": 0.20},
    "text": "Comprehensive analysis reasoning...",
    "time": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "platform": "openai",
    "model": "gpt-4o",
    "displayLanguage": "en-US"
  }'
\`\`\`

## 6. Success Response

\`\`\`json
{
  "success": true,
  "dimension": { "id": "dim_result_wdl_xxx", "dimKey": "result_wdl", ... }
}
\`\`\`

---
*Auto-generated by CupAI · ${new Date().toISOString().split('T')[0]}*
`
  }
}

