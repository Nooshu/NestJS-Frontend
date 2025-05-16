import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { HelmetOptions } from 'helmet';

@Injectable()
export class SecurityConfig {
  constructor(private configService: ConfigService) {}

  get cors() {
    return {
      enabled: this.configService.get<boolean>('security.cors.enabled') ?? false,
      origin: this.configService.get<string>('security.cors.origin') ?? '*',
    };
  }

  get csrf() {
    return {
      enabled: this.configService.get<boolean>('security.csrf.enabled') ?? true,
      cookieName: this.configService.get<string>('security.csrf.cookieName') ?? 'XSRF-TOKEN',
      cookieOptions: {
        httpOnly: this.configService.get<boolean>('security.csrf.cookieOptions.httpOnly') ?? true,
        secure: this.configService.get<boolean>('security.csrf.cookieOptions.secure') ?? true,
        sameSite:
          this.configService.get<string>('security.csrf.cookieOptions.sameSite') ?? 'strict',
      },
    };
  }

  get csp() {
    return {
      enabled: this.configService.get<boolean>('security.csp.enabled') ?? true,
      directives: this.configService.get<any>('security.csp.directives') ?? {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    };
  }

  get helmet(): HelmetOptions {
    return {
      contentSecurityPolicy: this.csp.enabled
        ? {
            directives: this.csp.directives,
          }
        : false,
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    };
  }
}

@Module({
  imports: [ConfigModule],
  providers: [SecurityConfig],
  exports: [SecurityConfig],
})
export class SecurityConfigModule {}
