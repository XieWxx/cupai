import { IsString, IsOptional, MaxLength } from 'class-validator'

/**
 * 更新用户信息 DTO
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称最多50个字符' })
  nickname?: string

  @IsOptional()
  @IsString()
  avatar?: string

  @IsOptional()
  @IsString()
  language?: string

  @IsOptional()
  @IsString()
  timezone?: string
}
