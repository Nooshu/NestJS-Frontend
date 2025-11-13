# Docker Setup for NestJS Frontend

This document describes the Docker configuration for the NestJS Frontend application.

## Overview

The Docker setup provides containerized deployment for both development and production environments. The application runs on port 3002 and includes:

- Multi-stage Docker build for optimization
- Production and development configurations
- Health checks
- Security best practices (non-root user)
- Asset fingerprinting and caching

## Files Created

### Dockerfile
- **Location**: `./Dockerfile`
- **Purpose**: Multi-stage build configuration
- **Features**:
  - Base stage with Node.js 20 Alpine
  - Development stage with hot reload
  - Production stage with security hardening
  - Non-root user for security
  - Health checks
  - Legacy peer deps support for dependency conflicts

### docker-compose.yml
- **Location**: `./docker-compose.yml`
- **Purpose**: Container orchestration
- **Services**:
  - `frontend`: Production service on port 3002
  - `frontend-dev`: Development service on port 3101 (optional)

### .dockerignore
- **Location**: `./.dockerignore`
- **Purpose**: Exclude unnecessary files from Docker build context
- **Excludes**: node_modules, dist, test files, documentation, etc.

### Scripts
- **Location**: `./scripts/`
- **Files**:
  - `setup-docker.sh`: Docker installation and setup verification
  - `validate-docker.sh`: Configuration validation
  - `prepare-docker.sh`: Prepare project for Docker builds
  - `test-docker-config.sh`: Test Docker configuration without Docker

## Quick Start

### Prerequisites
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Verify installation: `docker --version`
4. Prepare the project: `./scripts/prepare-docker.sh`

### Production Mode
```bash
# Build the Docker image
docker-compose build

# Run the application
docker-compose up

# Or run in detached mode
docker-compose up -d
```

### Development Mode
```bash
# Build and run in development mode
docker-compose --profile dev up frontend-dev

# Or run in detached mode
docker-compose --profile dev up -d frontend-dev
```

### Access the Application
- **Production**: https://localhost:3002
- **Development**: https://localhost:3101

## Configuration Details

### Port Configuration
The application is configured to run on port 3002 by default:
- Updated `src/main.ts` to use port 3002
- Docker containers expose port 3002
- Environment variable `PORT` can override default

### Environment Variables
- `NODE_ENV`: Set to `production` or `development`
- `PORT`: Application port (default: 3002)

### Health Checks
The application includes health checks that verify:
- Application is responding on port 3002
- Health endpoint returns 200 status
- Checks run every 30 seconds with 3 retries

## Docker Commands

### Basic Operations
```bash
# Build image
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up --build
```

### Development Commands
```bash
# Start development service
docker-compose --profile dev up frontend-dev

# Rebuild development image
docker-compose --profile dev build frontend-dev

# View development logs
docker-compose --profile dev logs -f frontend-dev
```

### Maintenance Commands
```bash
# Clean up everything
docker-compose down --rmi all --volumes --remove-orphans

# Remove all images
docker system prune -a

# View resource usage
docker stats
```

## Security Features

### Production Security
- Non-root user (`nestjs:nodejs`)
- Minimal Alpine Linux base image
- No development dependencies in production
- Health checks for monitoring

### Development Security
- Volume mounting for hot reload
- Development dependencies included
- Source code mounted for debugging

## Success Verification

### Testing the Application
```bash
# Test the main application
curl http://localhost:3002

# Test the health endpoint
curl http://localhost:3002/health

# Expected responses:
# - Main page: HTML content with GOV.UK styling
# - Health: {"status":"ok","info":{...},"error":{},"details":{...}}
```

### Verification Checklist
- ✅ Docker container builds successfully
- ✅ Application starts without errors
- ✅ Main page loads with GOV.UK styling
- ✅ Health endpoint returns 200 OK
- ✅ Static assets are served correctly
- ✅ Template rendering works properly
- ✅ Asset fingerprinting is functional

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 3002
lsof -i :3002

# Kill the process or use different port
docker-compose up -p 3003:3002
```

#### Build Failures
```bash
# Clean build cache
docker-compose build --no-cache

# Check Docker logs
docker-compose logs build

# If you see peer dependency conflicts, the Dockerfile uses --legacy-peer-deps
# This is already configured to handle chokidar and other dependency conflicts
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Rebuild with proper permissions
docker-compose build --no-cache
```

### Validation
Run the validation script to check configuration:
```bash
./scripts/validate-docker.sh
```

### Configuration Testing
Test Docker configuration without Docker:
```bash
./scripts/test-docker-config.sh
```

### Setup Verification
Run the setup script to verify Docker installation:
```bash
./scripts/setup-docker.sh
```

## Performance Considerations

### Build Optimization
- Multi-stage builds reduce final image size
- `.dockerignore` excludes unnecessary files
- Layer caching for faster rebuilds
- Legacy peer deps handling for dependency conflicts

### Dependency Management
- Uses `--legacy-peer-deps` to handle peer dependency conflicts
- Resolves issues with chokidar and other conflicting dependencies
- Ensures consistent builds across different environments

### Runtime Performance
- Alpine Linux for smaller image size
- Production-only dependencies
- Asset fingerprinting for caching
- Compression middleware enabled

### Development Performance
- Volume mounting for instant file changes
- Hot reload support
- Development dependencies for debugging

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Docker Build and Test

on: [push, pull_request]

jobs:
  docker-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker-compose build
      - name: Test Docker image
        run: docker-compose up -d && sleep 30 && curl -f http://localhost:3002/health
```

## Monitoring and Logging

### Health Monitoring
- Health checks every 30 seconds
- Automatic restart on failure
- Status endpoint at `/health`

### Logging
- Winston-based logging
- Structured JSON logs
- Log levels: error, warn, info, debug

### Metrics
- Application metrics via `/health`
- Docker stats via `docker stats`
- Resource monitoring via Docker Desktop

## Best Practices

### Development
1. Use development profile for local development
2. Mount source code for hot reload
3. Use volume mounts for node_modules
4. Enable debugging with source maps

### Production
1. Use production profile
2. Implement proper health checks
3. Use non-root user
4. Minimize image size
5. Enable security headers

### Security
1. Regular base image updates
2. Vulnerability scanning
3. Non-root user execution
4. Minimal attack surface
5. Proper .dockerignore

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/deployment)
- [Alpine Linux](https://alpinelinux.org/)
- [Node.js Docker Images](https://hub.docker.com/_/node) 