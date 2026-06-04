import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'

/**
 * TypeORM 数据库配置模块
 * 使用 ConfigService 动态读取环境变量
 */
export const DatabaseModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql' as const,
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME', 'root'),
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_DATABASE', 'cupai'),
    // 自动加载所有实体
    autoLoadEntities: true,
    // 开发环境自动同步表结构，生产环境禁用
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    // 日志级别
    logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
    // 字符集
    charset: 'utf8mb4',
    // 时区
    timezone: '+08:00',
  }),
})
