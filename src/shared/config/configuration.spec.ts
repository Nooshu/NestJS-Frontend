import configuration from './configuration';

describe('configuration', () => {
  const envKeys = [
    'PORT',
    'NODE_ENV',
    'VIEWS_DIRECTORY',
    'VIEWS_CACHE',
    'PUBLIC_DIRECTORY',
    'CORS_ENABLED',
    'CORS_ORIGIN',
    'CSRF_ENABLED',
    'CSRF_COOKIE_NAME',
    'CSRF_HEADER_NAME',
    'CSRF_COOKIE_HTTP_ONLY',
    'CSRF_COOKIE_SECURE',
    'CSRF_COOKIE_SAME_SITE',
    'CSP_ENABLED',
    'DB_TYPE',
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_SYNCHRONIZE',
    'DB_LOGGING',
    'REDIS_ENABLED',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_PASSWORD',
    'REDIS_DB',
    'LOG_LEVEL',
    'LOG_CONSOLE',
    'LOG_FILE',
    'LOG_FILE_PATH',
    'PERFORMANCE_ENABLED',
    'PERFORMANCE_SAMPLING_RATE',
    'PERFORMANCE_MAX_ENTRIES',
    'PERFORMANCE_REPORT_ON_UNLOAD',
    'npm_package_version',
  ] as const;

  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    for (const key of envKeys) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns defaults when environment variables are unset', () => {
    const config = configuration();

    expect(config.port).toBe(3000);
    expect(config.environment).toBe('development');
    expect(config.views.directory).toBe('src/views');
    expect(config.views.cache).toBe(false);
    expect(config.public.directory).toBe('src/public');
    expect(config.security.cors.enabled).toBe(false);
    expect(config.security.cors.origin).toBe('*');
    expect(config.security.csrf.enabled).toBe(true);
    expect(config.security.csrf.cookieName).toBe('XSRF-TOKEN');
    expect(config.security.csrf.headerName).toBe('X-XSRF-TOKEN');
    expect(config.security.csrf.cookieOptions.httpOnly).toBe(true);
    expect(config.security.csrf.cookieOptions.secure).toBe(true);
    expect(config.security.csrf.cookieOptions.sameSite).toBe('strict');
    expect(config.security.csp.enabled).toBe(true);
    expect(config.database.type).toBe('postgres');
    expect(config.database.host).toBe('localhost');
    expect(config.database.port).toBe(5432);
    expect(config.database.username).toBe('postgres');
    expect(config.database.password).toBe('postgres');
    expect(config.database.database).toBe('nestjs_frontend');
    expect(config.database.synchronize).toBe(false);
    expect(config.database.logging).toBe(false);
    expect(config.redis.enabled).toBe(false);
    expect(config.redis.host).toBe('localhost');
    expect(config.redis.port).toBe(6379);
    expect(config.redis.password).toBeUndefined();
    expect(config.redis.db).toBe(0);
    expect(config.logging.level).toBe('info');
    expect(config.logging.console).toBe(true);
    expect(config.logging.file).toBe(false);
    expect(config.logging.filePath).toBe('logs/app.log');
    expect(config.performance.enabled).toBe(true);
    expect(config.performance.samplingRate).toBe(1);
    expect(config.performance.maxEntries).toBe(100);
    expect(config.performance.reportOnUnload).toBe(true);
    expect(config.nodeEnv).toBe('development');
    expect(config.npmPackageVersion).toBeUndefined();
  });

  it('uses environment variables when set', () => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';
    process.env.VIEWS_DIRECTORY = 'custom/views';
    process.env.VIEWS_CACHE = 'true';
    process.env.PUBLIC_DIRECTORY = 'custom/public';
    process.env.CORS_ENABLED = 'true';
    process.env.CORS_ORIGIN = 'https://example.com';
    process.env.CSRF_ENABLED = 'false';
    process.env.CSRF_COOKIE_NAME = 'custom-csrf';
    process.env.CSRF_HEADER_NAME = 'X-Custom-CSRF';
    process.env.CSRF_COOKIE_HTTP_ONLY = 'false';
    process.env.CSRF_COOKIE_SECURE = 'false';
    process.env.CSRF_COOKIE_SAME_SITE = 'lax';
    process.env.CSP_ENABLED = 'false';
    process.env.DB_TYPE = 'mysql';
    process.env.DB_HOST = 'db.example.com';
    process.env.DB_PORT = '3306';
    process.env.DB_USERNAME = 'dbuser';
    process.env.DB_PASSWORD = 'dbpass';
    process.env.DB_NAME = 'app_db';
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.DB_LOGGING = 'true';
    process.env.REDIS_ENABLED = 'true';
    process.env.REDIS_HOST = 'redis.example.com';
    process.env.REDIS_PORT = '6380';
    process.env.REDIS_PASSWORD = 'redis-pass';
    process.env.REDIS_DB = '2';
    process.env.LOG_LEVEL = 'debug';
    process.env.LOG_CONSOLE = 'false';
    process.env.LOG_FILE = 'true';
    process.env.LOG_FILE_PATH = 'logs/custom.log';
    process.env.PERFORMANCE_ENABLED = 'false';
    process.env.PERFORMANCE_SAMPLING_RATE = '0.5';
    process.env.PERFORMANCE_MAX_ENTRIES = '50';
    process.env.PERFORMANCE_REPORT_ON_UNLOAD = 'false';
    process.env.npm_package_version = '1.2.3';

    const config = configuration();

    expect(config.port).toBe(4000);
    expect(config.environment).toBe('production');
    expect(config.views.directory).toBe('custom/views');
    expect(config.views.cache).toBe(true);
    expect(config.public.directory).toBe('custom/public');
    expect(config.security.cors.enabled).toBe(true);
    expect(config.security.cors.origin).toBe('https://example.com');
    expect(config.security.csrf.enabled).toBe(false);
    expect(config.security.csrf.cookieName).toBe('custom-csrf');
    expect(config.security.csrf.headerName).toBe('X-Custom-CSRF');
    expect(config.security.csrf.cookieOptions.httpOnly).toBe(false);
    expect(config.security.csrf.cookieOptions.secure).toBe(false);
    expect(config.security.csrf.cookieOptions.sameSite).toBe('lax');
    expect(config.security.csp.enabled).toBe(false);
    expect(config.database.type).toBe('mysql');
    expect(config.database.host).toBe('db.example.com');
    expect(config.database.port).toBe(3306);
    expect(config.database.username).toBe('dbuser');
    expect(config.database.password).toBe('dbpass');
    expect(config.database.database).toBe('app_db');
    expect(config.database.synchronize).toBe(true);
    expect(config.database.logging).toBe(true);
    expect(config.redis.enabled).toBe(true);
    expect(config.redis.host).toBe('redis.example.com');
    expect(config.redis.port).toBe(6380);
    expect(config.redis.password).toBe('redis-pass');
    expect(config.redis.db).toBe(2);
    expect(config.logging.level).toBe('debug');
    expect(config.logging.console).toBe(false);
    expect(config.logging.file).toBe(true);
    expect(config.logging.filePath).toBe('logs/custom.log');
    expect(config.performance.enabled).toBe(false);
    expect(config.performance.samplingRate).toBe(0.5);
    expect(config.performance.maxEntries).toBe(50);
    expect(config.performance.reportOnUnload).toBe(false);
    expect(config.nodeEnv).toBe('production');
    expect(config.npmPackageVersion).toBe('1.2.3');
  });
});
