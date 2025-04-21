import { CorsOptions } from 'cors';
import { Options } from 'express-rate-limit';
import { HelmetOptions } from 'helmet';
import { Request } from 'express';

export interface SecurityConfig {
  helmet: HelmetOptions;
  cors: CorsOptions;
  rateLimit: Options;
  headers: Record<string, string>;
  audit: {
    enabled: boolean;
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  dataProtection: {
    masking: {
      enabled: boolean;
      fields: string[];
    };
  };
}

export interface RequestWithUser extends Request {
  user?: {
    id: string;
  };
} 