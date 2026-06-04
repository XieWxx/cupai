import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

/**
 * 创建分析报告 DTO
 */
export class CreateReportDto {
  @IsString()
  @IsNotEmpty({ message: '赛事ID不能为空' })
  matchId: string

  @IsOptional()
  @IsString()
  modelId?: string

  @IsOptional()
  @IsString()
  promptTemplateId?: string

  @IsString()
  @IsNotEmpty({ message: '大模型类型不能为空' })
  llmType: string

  @IsOptional()
  weightSnapshot?: Record<string, number>

  @IsString()
  @IsNotEmpty({ message: '报告内容不能为空' })
  content: string

  @IsOptional()
  @IsString()
  displayLanguage?: string
}
