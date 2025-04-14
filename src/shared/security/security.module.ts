import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { securityConfig } from '../config/security.config';

@Module({
  imports: [
    ThrottlerModule.forRoot(securityConfig.throttler),
  ],
})
export class SecurityModule {} 