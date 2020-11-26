import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  CACHE_MANAGER,
  HttpServer,
  Optional,
} from '@nestjs/common'
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils'
import { CACHE_KEY_METADATA } from '@nestjs/common/cache/cache.constants'
import { CACHE_TTL_METADATA } from '@nestjs/common/cache/cache.constants'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'

const HTTP_ADAPTER_HOST = 'HttpAdapterHost'
const REFLECTOR = 'Reflector'

export interface HttpAdapterHost<T extends HttpServer = any> {
  httpAdapter: T
}

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  @Optional()
  @Inject(HTTP_ADAPTER_HOST)
  protected readonly httpAdapterHost: HttpAdapterHost

  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: any,
    @Inject(REFLECTOR) protected readonly reflector: any
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const key = this.trackBy(context)
    const ttlValueOrFactory = this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) || null

    if (!key) {
      return next.handle()
    }
    try {
      const value = await this.cacheManager.get(key)
      if (!isNil(value)) {
        return of(value)
      }
      const ttl = isFunction(ttlValueOrFactory)
        ? await ttlValueOrFactory(context)
        : ttlValueOrFactory
      return next.handle().pipe(
        tap((response) => {
          const args = isNil(ttl) ? [key, response] : [key, response, { ttl }]
          this.cacheManager.set(...args)
        })
      )
    } catch {
      return next.handle()
    }
  }

  trackBy(context: ExecutionContext): string | undefined {
    const httpAdapter = this.httpAdapterHost.httpAdapter
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod
    const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler())

    if (!isHttpApp || cacheMetadata) {
      return cacheMetadata
    }

    const request = context.getArgByIndex(0)
    if (httpAdapter.getRequestMethod(request) !== 'GET') {
      return undefined
    }
    return httpAdapter.getRequestUrl(request)
  }
}
