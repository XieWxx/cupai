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
    // 日志级别
    logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
    // 字符集
    charset: 'utf8mb4',
    // 时区统一用 UTC（避免容器时区差异导致日期偏移）
    // datetime 列无时区概念，存什么字符串就返回什么字符串
    // 通过 'Z' 强制 mysql2 driver 不做时区转换
    timezone: 'Z',
    // 同步策略：
    // - 默认：dev=true，prod=false
    // - 通过 DB_SYNCHRONIZE 显式覆盖（首次部署可设 true 创建表结构）
    synchronize:
      configService.get<string>('DB_SYNCHRONIZE') !== undefined
        ? configService.get<string>('DB_SYNCHRONIZE') === 'true'
        : configService.get<string>('NODE_ENV') !== 'production',
  }),
})
