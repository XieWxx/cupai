import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { UserService } from './user.service'

/**
 * JWT 认证策略
 * 从请求头 Authorization: Bearer <token> 中提取并验证 JWT
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'cupai-dev-secret'),
    })
  }

  /**
   * 验证 JWT payload，返回用户信息挂载到 req.user
   */
  async validate(payload: { sub: string }) {
    const user = await this.userService.findById(payload.sub)
    if (!user) {
      throw new UnauthorizedException('用户不存在或已失效')
    }
    return { id: user.id, username: user.username }
  }
}
