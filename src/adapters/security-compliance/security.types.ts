import { Options } from 'express-rate-limit';
import { CorsOptions } from 'cors';
import { HelmetOptions } from 'helmet';
import { Request } from 'express';

export interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    max: number;
    headers: boolean;
    [key: string]: unknown;
  };
  cors: Partial<CorsOptions>;
  helmet: Partial<HelmetOptions>;
  headers?: Record<string, string | number | boolean>;
  audit?: {
    enabled: boolean;
    exclude?: string[];
  };
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  dataProtection?: {
    masking: {
      enabled: boolean;
      fields: string[];
    };
  };
}

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
} 