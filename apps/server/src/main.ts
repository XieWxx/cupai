import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

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

  // 跨域配置 - 适配海外用户访问
  app.enableCors({
    origin: true,
    credentials: true,
  })

  const port = process.env.SERVER_PORT || 3001
  await app.listen(port)
  console.log(`[CupAI] 后端服务已启动: http://localhost:${port}`)
}

bootstrap()
