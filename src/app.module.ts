import { Module,CacheModule, CacheInterceptor } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      db:0
    }),
    ArticleModule,
    UserModule,
    ProfileModule,
    TagModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class ApplicationModule {
  constructor(private readonly connection: Connection) {}
}
