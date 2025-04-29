import type { CorsOptions } from 'cors';
import type { Request, Response } from 'express';
import type { HelmetOptions } from 'helmet';

/**
 * Interface defining the structure of a request with user information.
 * Extends the standard Express Request type with user-specific properties.
 */
export interface RequestWithUser extends Request {
  /** The authenticated user's information */
  user?: {
    /** The user's unique identifier */
    id: string;
    /** The user's roles or permissions */
    roles?: string[];
  };
}

/**
 * Interface defining password policy requirements.
 * Specifies the rules that passwords must follow.
 */
export interface PasswordPolicy {
  /** Minimum length required for passwords */
  minLength: number;
  /** Whether passwords must contain uppercase letters */
  requireUppercase: boolean;
  /** Whether passwords must contain lowercase letters */
  requireLowercase: boolean;
  /** Whether passwords must contain numbers */
  requireNumbers: boolean;
  /** Whether passwords must contain special characters */
  requireSpecialChars: boolean;
}

export type MaxValue = number | ((req: Request, res: Response) => Promise<number> | number);

/**
 * Interface defining rate limiting configuration.
 * Controls how many requests a client can make within a time window.
 */
export interface RateLimitOptions {
  enabled: boolean;
  max: number;
  windowMs: number;
  message?: string;
  statusCode?: number;
}

/**
 * Interface defining audit logging configuration.
 * Specifies what information should be logged and how.
 */
export interface AuditConfig {
  /** Whether audit logging is enabled */
  enabled: boolean;
  /** Fields to exclude from audit logs */
  excludeFields?: string[];
}

/**
 * Interface defining data masking configuration.
 * Controls which fields should be masked in responses.
 */
export interface DataMaskingConfig {
  /** Whether data masking is enabled */
  enabled: boolean;
  /** Fields to mask in responses */
  fields: string[];
}

/**
 * Interface defining data protection configuration.
 * Controls how sensitive data is handled and protected.
 */
export interface DataProtectionConfig {
  /** Whether data protection is enabled */
  enabled: boolean;
  /** Encryption key for data encryption */
  encryptionKey: string;
  /** Data masking configuration */
  masking: DataMaskingConfig;
}

export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Interface defining the complete security configuration.
 * Combines all security-related settings into a single configuration object.
 */
export interface SecurityConfig {
  cors?: CorsOptions;
  helmet?: HelmetOptions | boolean;
  rateLimit?: RateLimitOptions;
  cache?: CacheStore;
  audit?: AuditConfig;
  passwordPolicy?: PasswordPolicy;
  dataProtection?: DataProtectionConfig;
  headers?: Record<string, string>;
}
