import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator'

/**
 * 生成分析报告 DTO
 * 用于手动分析流程：前端传参 → 后端组装 Prompt → 调 AI 中转 → 保存报告
 */
export class GenerateAnalysisDto {
  /** 赛事ID */
  @IsString()
  @IsNotEmpty({ message: '赛事ID不能为空' })
  matchId: string

  /** 用户 AI 配置ID */
  @IsString()
  @IsNotEmpty({ message: 'AI配置ID不能为空' })
  aiConfigId: string

  /** 权重模型ID */
  @IsOptional()
  @IsString()
  weightModelId?: string

  /** Prompt 模板ID */
  @IsOptional()
  @IsString()
  promptTemplateId?: string

  /** API Key（前端解密后传入，用完即清，不存储） */
  @IsString()
  @IsNotEmpty({ message: 'API Key不能为空' })
  apiKey: string

  /** 是否公开（默认私密） */
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean

  /** 展示语言 */
  @IsOptional()
  @IsString()
  displayLanguage?: string
}
