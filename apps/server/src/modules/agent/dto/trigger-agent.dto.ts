import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator'

/**
 * 用户手动触发 Agent 分析 DTO
 * 用户针对单场赛事一键启动 Agent，需同意授权协议
 */
export class TriggerAgentDto {
  /** 赛事ID */
  @IsString()
  @IsNotEmpty({ message: '赛事ID不能为空' })
  matchId: string

  /** 用户 AI 配置ID */
  @IsString()
  @IsNotEmpty({ message: 'AI配置ID不能为空' })
  aiConfigId: string

  /** API Key（前端解密后传入，用完即清） */
  @IsString()
  @IsNotEmpty({ message: 'API Key不能为空' })
  apiKey: string

  /** 权重模型ID（可选） */
  @IsOptional()
  @IsString()
  weightModelId?: string

  /** Prompt 模板ID（可选） */
  @IsOptional()
  @IsString()
  promptTemplateId?: string

  /** 是否同意授权协议（必须为 true） */
  @IsBoolean()
  isAuthorized: boolean

  /** 展示语言 */
  @IsOptional()
  @IsString()
  displayLanguage?: string
}
