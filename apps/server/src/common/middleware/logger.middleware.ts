import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

/**
 * HTTP 请求日志中间件
 * 记录每个请求的方法、路径、耗时、状态码
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req
    const startTime = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - startTime
      const { statusCode } = res
      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`)
    })

    next()
  }
}
