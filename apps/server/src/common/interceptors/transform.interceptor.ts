import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, map } from 'rxjs'

/**
 * 统一响应格式拦截器
 * 将所有接口返回值包装为 { code, message, data } 格式
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { code: number; message: string; data: T }> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<{ code: number; message: string; data: T }> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data,
      })),
    )
  }
}
