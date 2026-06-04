import { IsString, IsNotEmpty } from 'class-validator'

/**
 * 互动操作 DTO（点赞/收藏）
 */
export class InteractionDto {
  /** 分析报告ID */
  @IsString()
  @IsNotEmpty({ message: '报告ID不能为空' })
  reportId: string

  /** 互动类型: like(点赞) / collect(收藏) */
  @IsString()
  @IsNotEmpty({ message: '互动类型不能为空' })
  type: 'like' | 'collect'
}
