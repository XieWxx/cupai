import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { UserEntity } from './entities/user.entity'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UpdateUserDto } from './dto/update-user.dto'

/**
 * 用户服务 - 注册、登录、JWT鉴权、个人信息管理
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   * @param dto 注册参数
   * @returns 注册成功的用户信息（含 token）
   */
  async register(dto: RegisterDto) {
    // 检查用户名是否已存在
    const existing = await this.userRepository.findOne({ where: { username: dto.username } })
    if (existing) {
      throw new ConflictException('用户名已存在')
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // 创建用户
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      language: dto.language || 'zh-CN',
      timezone: dto.timezone || 'Asia/Shanghai',
    })
    await this.userRepository.save(user)

    // 生成 JWT Token
    const token = this.generateToken(user.id)

    return {
      user: this.sanitizeUser(user),
      token,
    }
  }

  /**
   * 用户登录
   * @param dto 登录参数
   * @returns 登录成功的用户信息（含 token）
   */
  async login(dto: LoginDto) {
    // 查找用户（需要包含 password 字段）
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username: dto.username })
      .addSelect('user.password')
      .getOne()

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    const token = this.generateToken(user.id)

    return {
      user: this.sanitizeUser(user),
      token,
    }
  }

  /**
   * 获取用户信息
   * @param userId 用户ID
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }
    return this.sanitizeUser(user)
  }

  /**
   * 更新用户信息
   * @param userId 用户ID
   * @param dto 更新参数
   */
  async updateProfile(userId: string, dto: UpdateUserDto) {
    await this.userRepository.update(userId, dto)
    return this.getProfile(userId)
  }

  /**
   * 根据 ID 查找用户（供 Guard 使用）
   * @param userId 用户ID
   */
  async findById(userId: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id: userId } })
  }

  /**
   * 生成 JWT Token
   */
  private generateToken(userId: string): string {
    return this.jwtService.sign({ sub: userId })
  }

  /**
   * 脱敏用户信息（移除密码等敏感字段）
   */
  private sanitizeUser(user: UserEntity) {
    const { password: _, ...result } = user
    return result
  }
}
