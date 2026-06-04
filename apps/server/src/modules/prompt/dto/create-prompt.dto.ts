import { IsString, IsNotEmpty, IsOptional, MaxLength, IsBoolean } from 'class-validator'

/**
 * 创建 Prompt 模板 DTO
 */
export class CreatePromptDto {
  @IsString()
  @IsNotEmpty({ message: '模板名称不能为空' })
  @MaxLength(100)
  name: string

  @IsString()
  @IsNotEmpty({ message: '适配场景不能为空' })
  scene: string

  @IsString()
  @IsNotEmpty({ message: '模板内容不能为空' })
  content: string

  @IsOptional()
  @IsString()
  adaptedModel?: string

  @IsOptional()
  @IsString()
  adaptedStage?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
