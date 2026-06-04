import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'

/**
 * 全局异常过滤器
 * 统一错误响应格式: { code, message, timestamp }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>).message as string || exception.message
    } else if (exception instanceof Error) {
      message = exception.message
    }

    // 记录错误日志
    this.logger.error(`[${status}] ${message}`, exception instanceof Error ? exception.stack : '')

    response.status(status).json({
      code: status,
      message,
      timestamp: new Date().toISOString(),
    })
  }
}
