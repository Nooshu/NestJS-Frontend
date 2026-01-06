import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CompressionMiddleware } from './compression.middleware';

@Module({
  imports: [ConfigModule],
  providers: [CompressionMiddleware],
  exports: [CompressionMiddleware],
})
export class CompressionModule {}
