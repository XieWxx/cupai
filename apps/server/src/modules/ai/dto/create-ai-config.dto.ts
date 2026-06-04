import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max, IsBoolean } from 'class-validator'

/**
 * 创建/更新 AI 配置 DTO
 * 注意：API Key 不在此处传输，仅前端加密存储
 */
export class CreateAiConfigDto {
  @IsString()
  @IsNotEmpty({ message: '模型名称不能为空' })
  modelName: string

  @IsString()
  @IsNotEmpty({ message: 'API接口地址不能为空' })
  apiEndpoint: string

  @IsNumber()
  @Min(0)
  @Max(1)
  temperature: number

  @IsNumber()
  @Min(1)
  maxTokens: number

  @IsOptional()
  @IsNumber()
  contextLength?: number

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
