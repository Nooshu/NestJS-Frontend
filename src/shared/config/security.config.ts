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
    const isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';
    
    return {
      enabled: this.configService.get<boolean>('security.csrf.enabled') ?? true,
      cookieName: this.configService.get<string>('security.csrf.cookieName') ?? 'XSRF-TOKEN',
      cookieOptions: {
        httpOnly: this.configService.get<boolean>('security.csrf.cookieOptions.httpOnly') ?? true,
        secure: isDevelopment ? false : (this.configService.get<boolean>('security.csrf.cookieOptions.secure') ?? true),
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
        imgSrc: ["'self'", 'https:', 'data:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Temporarily allow inline scripts
        fontSrc: ["'self'", 'https:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: [],
      },
    };
  }

  get helmet(): HelmetOptions {
    const isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';
    
    return {
      contentSecurityPolicy: this.csp.enabled
        ? {
            directives: this.csp.directives,
          }
        : false,
      crossOriginEmbedderPolicy: !isDevelopment,
      crossOriginOpenerPolicy: !isDevelopment,
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: isDevelopment ? false : {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: !isDevelopment,
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
