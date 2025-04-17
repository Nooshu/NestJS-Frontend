import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiService } from '../shared/services/api.service';
import { CacheModule } from '@nestjs/cache-manager';
import { apiConfig } from '../shared/config/api.config';

/**
 * API Module for handling HTTP requests and caching.
 * This module configures the HTTP client and caching for API requests.
 * 
 * @module ApiModule
 * @description Module for API communication and caching
 */
@Module({
  imports: [
    /**
     * Configure HTTP module with timeout and redirect settings
     */
    HttpModule.register({
      timeout: apiConfig.timeout,
      maxRedirects: 5,
    }),
    /**
     * Configure caching module with TTL and maximum items
     */
    CacheModule.register({
      ttl: apiConfig.caching.ttl,
      max: 100, // Maximum number of items in cache
    }),
  ],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
