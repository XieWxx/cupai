import { Controller, Post, Get, Put, Body, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserService } from './user.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UpdateUserDto } from './dto/update-user.dto'

/**
 * 用户控制器 - 注册/登录/个人信息管理
 */
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 用户注册
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.userService.register(dto)
  }

  // 用户登录
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.userService.login(dto)
  }

  // 获取当前用户信息（需登录）
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: { user: { id: string } }) {
    return this.userService.getProfile(req.user.id)
  }

  // 更新用户信息（需登录）
  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() req: { user: { id: string } }, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(req.user.id, dto)
  }
}
