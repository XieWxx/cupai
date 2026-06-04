import { IsString, IsNotEmpty } from 'class-validator'

/**
 * 用户登录 DTO
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string
}
