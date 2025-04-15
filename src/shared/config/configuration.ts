export default () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  environment: process.env.NODE_ENV || 'development',
  views: {
    directory: process.env.VIEWS_DIRECTORY || 'src/views',
    cache: process.env.VIEWS_CACHE === 'true',
  },
  public: {
    directory: process.env.PUBLIC_DIRECTORY || 'src/public',
  },
  security: {
    cors: {
      enabled: process.env.CORS_ENABLED === 'true',
      origin: process.env.CORS_ORIGIN || '*',
    },
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  npmPackageVersion: process.env.npm_package_version,
}); 