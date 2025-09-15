# Render.com Deployment Guide

This guide will help you deploy your NestJS application to Render.com.

## Prerequisites

1. A Render.com account
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Node.js 22+ (as specified in package.json engines)

## Deployment Steps

### 1. Create a New Web Service

1. Log in to your Render.com dashboard
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Configure the following settings:

### 2. Service Configuration

**Basic Settings:**
- **Name**: `nestjs-frontend` (or your preferred name)
- **Environment**: `Node`
- **Branch**: `main` (or your default branch)
- **Root Directory**: `.` (leave empty if your app is in the root)

**Build & Deploy:**
- **Build Command**: `npm ci && npm run build:prod`
- **Start Command**: `npm run start:render`

**Instance Type:**
- **Plan**: `Starter` (free tier) or higher based on your needs

### 3. Environment Variables

Add these environment variables in the Render dashboard:

```bash
# Required
NODE_ENV=production
PORT=10000
HOST=0.0.0.0

# Logging
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_FILE=false

# Security
CORS_ENABLED=true
CORS_ORIGIN=*
CSRF_ENABLED=true
CSP_ENABLED=true

# Performance
PERFORMANCE_ENABLED=true
```

### 4. Health Check Configuration

- **Health Check Path**: `/health`
- **Health Check Timeout**: `30 seconds`

### 5. Advanced Configuration (Optional)

If you need a database or Redis:

**For PostgreSQL Database:**
1. Create a PostgreSQL service in Render
2. Add these environment variables:
   ```bash
   DB_TYPE=postgres
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   DB_NAME=your-database
   DB_SYNCHRONIZE=false
   DB_LOGGING=false
   ```

**For Redis:**
1. Create a Redis service in Render
2. Add these environment variables:
   ```bash
   REDIS_ENABLED=true
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   REDIS_DB=0
   ```

## Deployment Process

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm ci`)
   - Build your application (`npm run build:prod`)
   - Start your application (`npm run start:render`)

## Monitoring and Health Checks

Your application includes comprehensive health check endpoints:

- `/health` - Basic health check
- `/health/detailed` - Detailed system information
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe
- `/health/database` - Database health
- `/health/redis` - Redis health
- `/health/system` - System resources

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are properly listed in package.json
2. **Port Issues**: Ensure your application listens on the PORT environment variable
3. **Health Check Failures**: Verify the `/health` endpoint is accessible
4. **Memory Issues**: Consider upgrading to a higher instance type

### Logs

- View deployment logs in the Render dashboard
- Application logs are available in the "Logs" tab
- Use `LOG_LEVEL=debug` for more detailed logging

## Custom Domain (Optional)

1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain and follow the DNS configuration instructions

## Continuous Deployment

By default, Render automatically redeploys when you push to your main branch. You can:
- Disable auto-deploy in service settings
- Deploy specific branches
- Use Render's API for programmatic deployments

## Security Considerations

- Environment variables are encrypted at rest
- Use HTTPS (enabled by default on Render)
- Configure CORS appropriately for your domain
- Enable CSRF protection for production
- Use secure cookies (CSRF_COOKIE_SECURE=true)

## Performance Optimization

- Enable compression (already configured)
- Use CDN for static assets
- Configure appropriate cache headers
- Monitor performance metrics in Render dashboard

### Compression Configuration

The application is configured to exclude binary assets from compression to optimize performance:

**Excluded from compression:**
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.ico`, `.webp`, `.avif`, `.bmp`, `.tiff`
- Fonts: `.woff`, `.woff2`, `.ttf`, `.eot`, `.otf`
- Media: `.mp4`, `.mp3`, `.wav`, `.avi`, `.mov`
- Archives: `.pdf`, `.zip`, `.gz`, `.tar`, `.rar`, `.7z`

**Compression settings:**
- Level: 6 (balanced between speed and compression ratio)
- Threshold: 1KB (only compress responses larger than 1KB)
- Filter: Automatically excludes binary assets based on file extension and MIME type

**Render.com Brotli Compression:**
Render.com automatically applies Brotli compression to all responses. While you cannot disable this at the platform level, the application-level compression filter ensures that binary assets are not double-compressed, which can degrade performance and quality.

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Application-specific issues: Check the application logs and health endpoints
