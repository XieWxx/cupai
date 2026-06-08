import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局前缀
  app.setGlobalPrefix('api/v1')

  // 全局验证管道 - 自动校验请求参数
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剥离未装饰的属性
      forbidNonWhitelisted: true, // 禁止传入未定义的属性
      transform: true, // 自动类型转换
    }),
  )

  // 全局响应格式拦截器 - 统一包装为 { code, message, data }
  app.useGlobalInterceptors(new TransformInterceptor())

  // 全局异常过滤器 - 统一错误响应格式
  app.useGlobalFilters(new AllExceptionsFilter())

  // 跨域配置
  // 生产环境：通过 CORS_ORIGIN 限定白名单（逗号分隔）
  // 开发/默认：放行所有来源
  const corsOrigin = process.env.CORS_ORIGIN
  if (corsOrigin && corsOrigin.trim() !== '') {
    const origins = corsOrigin
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    app.enableCors({
      origin: origins,
      credentials: true,
    })
  } else {
    app.enableCors({
      origin: true,
      credentials: true,
    })
  }

  const port = process.env.SERVER_PORT || 3001
  // 显式监听 IPv4 0.0.0.0，避免 macOS 下 Node.js 默认仅监听 IPv6
  // 导致 Vite 代理（127.0.0.1）ECONNREFUSED
  await app.listen(port, '0.0.0.0')
  console.log(`[CupAI] 后端服务已启动: http://localhost:${port}`)
}

bootstrap()
