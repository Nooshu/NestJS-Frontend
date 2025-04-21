export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  prefix?: string;
  store?: 'memory' | 'redis';
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface CacheKey {
  type: 'rate-limit' | 'password-policy' | 'security-headers' | 'audit-log';
  identifier: string;
  timestamp?: number;
} 