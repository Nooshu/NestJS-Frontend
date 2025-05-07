import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheMiddleware } from './cache.middleware';

@Module({
  imports: [ConfigModule],
  providers: [CacheMiddleware],
  exports: [CacheMiddleware],
})
export class CacheModule {} 