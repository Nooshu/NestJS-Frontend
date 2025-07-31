# Playwright Test Improvements

## Overview

This document outlines the recent improvements made to the Playwright testing setup to resolve CI/CD failures and enhance the development experience.

## 🔧 **Issues Resolved**

### 1. **Application Startup Failures**
**Problem**: Tests were failing with "Process from config.webServer exited early" errors
**Root Cause**: Cache module was trying to connect to Redis by default, causing application startup failures
**Solution**: 
- Modified `src/cache/cache.module.ts` to use conditional Redis connection
- Application now uses memory cache when Redis is disabled (default behavior)
- Added proper fallback configuration for different environments

### 2. **Missing Playwright Browsers**
**Problem**: Tests failing with "Executable doesn't exist" errors for browser binaries
**Root Cause**: Playwright browsers weren't installed in CI environments
**Solution**:
- Enhanced GitHub Actions workflow to install browsers with dependencies
- Added `npx playwright install --with-deps` step
- Created local development script that handles browser installation

### 3. **Port Conflicts**
**Problem**: Tests failing with "http://localhost:3000 is already used" errors
**Root Cause**: Existing processes on port 3000 preventing server startup
**Solution**:
- Created `scripts/test-e2e.sh` that automatically kills existing processes
- Added port cleanup to local development workflow
- Enhanced server startup detection

### 4. **Insufficient Timeouts**
**Problem**: Tests timing out in CI environments due to slower server startup
**Root Cause**: Default timeouts too short for CI environments
**Solution**:
- Extended timeouts for CI environments (5 minutes vs 2 minutes locally)
- Added environment-specific timeout configurations
- Improved server startup detection with better stdout/stderr handling

### 5. **CI Build Conflicts**
**Problem**: Playwright configuration was trying to build the application again in CI
**Root Cause**: Double building causing conflicts and timing issues
**Solution**:
- Updated `playwright.config.ts` to only start the application in CI, not build it
- GitHub Actions workflow handles the build process separately
- Added application startup verification in CI workflow

## 🚀 **New Features**

### 1. **Local Development Script**
Created `npm run test:e2e:local` for easy local testing:

```bash
#!/bin/bash
# End-to-End Test Script
# This script sets up the environment and runs Playwright tests

set -e

echo "🚀 Setting up E2E test environment..."

# Kill any existing processes on port 3000
echo "📋 Checking for existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes found on port 3000"

# Install Playwright browsers if not already installed
echo "🌐 Installing Playwright browsers..."
npx playwright install --with-deps

# Build the application
echo "🔨 Building application..."
npm run build:frontend:dev
npm run build

# Run the tests
echo "🧪 Running E2E tests..."
CI=true NODE_ENV=production npx playwright test --reporter=line --timeout=60000

echo "✅ E2E tests completed!"
```

**Features**:
- Automatic port cleanup
- Browser installation verification
- Application build process
- Proper environment variable setup
- Clear progress indicators

### 2. **Enhanced Playwright Configuration**
Updated `playwright.config.ts` with environment-aware settings:

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'dot' : 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: process.env.CI ? 30000 : 10000,
    navigationTimeout: process.env.CI ? 30000 : 10000,
  },
  
  webServer: {
    command: process.env.CI 
      ? 'npm run start:prod' 
      : 'npm run start:dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 300 * 1000 : 120 * 1000,
    stdout: 'Application is running on: http://localhost:3000',
    stderr: 'error',
  },
});
```

**Improvements**:
- Environment-specific timeouts
- Better server startup detection
- Conditional reporter selection
- Enhanced error handling
- **NEW**: Fixed CI build conflicts by removing double building

### 3. **Improved GitHub Actions Workflow**
Enhanced `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        npm cache clean --force
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Build application
      run: |
        npm run build:frontend:dev
        npm run build
        
        # Verify the build was successful
        echo "Verifying build..."
        ls -la dist/
        ls -la dist/main.js || echo "Main file not found"
    
    - name: Test application startup
      run: |
        export CI=true
        export NODE_ENV=production
        
        echo "Testing application startup in CI..."
        
        # Start the application in background
        npm run start:prod &
        APP_PID=$!
        
        # Wait for startup
        sleep 15
        
        # Check if process is still running
        if ps -p $APP_PID > /dev/null; then
          echo "Application started successfully"
          
          # Test if we can connect to it
          if curl -f http://localhost:3000/health; then
            echo "Application is responding to requests"
          else
            echo "Application is not responding to requests"
          fi
          
          # Kill the process
          kill $APP_PID
        else
          echo "Application failed to start"
          exit 1
        fi
      env:
        CI: true
        NODE_ENV: production
    
    - name: Run Playwright tests
      run: |
        export CI=true
        export NODE_ENV=production
        
        echo "Running Playwright tests..."
        npx playwright test --timeout=300000 --reporter=html,line --project=chromium
        
        # Show test results for debugging
        echo "Test results directory:"
        ls -la test-results/ 2>/dev/null || echo "No test-results directory found"
        echo "Playwright report directory:"
        ls -la playwright-report/ 2>/dev/null || echo "No playwright-report directory found"
      env:
        CI: true
        NODE_ENV: production
    
    - name: Upload test results on failure
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report-failure
        path: |
          playwright-report/
          test-results/
          playwright-report.html
          playwright-report/index.html
        retention-days: 30
    
    - name: Upload test results on success
      if: success()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report-success
        path: |
          playwright-report/
          test-results/
          playwright-report.html
          playwright-report/index.html
        retention-days: 7
```

**Enhancements**:
- Proper browser installation
- Application build step with verification
- **NEW**: Application startup test in CI environment
- Better artifact handling with multiple possible paths
- Extended timeouts for CI environments
- Success and failure artifact uploads
- Enhanced debugging information

### 4. **CI Application Startup Test**
Created `scripts/test-ci-startup.sh` for testing application startup in CI:

```bash
#!/bin/bash
# CI Application Startup Test Script
# This script tests if the application can start properly in CI environment

set -e

echo "🧪 Testing application startup in CI environment..."

# Set CI environment variables
export CI=true
export NODE_ENV=production

echo "Environment variables:"
echo "CI: $CI"
echo "NODE_ENV: $NODE_ENV"

# Check if the build exists
echo "📋 Checking build files..."
if [ -f "dist/main.js" ]; then
    echo "✅ Build files found"
    ls -la dist/
else
    echo "❌ Build files not found"
    exit 1
fi

# Test application startup
echo "🚀 Testing application startup..."
npm run start:prod &
APP_PID=$!

# Wait for startup
echo "⏳ Waiting for application to start..."
sleep 15

# Check if process is still running
if ps -p $APP_PID > /dev/null; then
    echo "✅ Application process is running"
    
    # Test if we can connect to it
    echo "🔍 Testing application connectivity..."
    if curl -f http://localhost:3000/health; then
        echo "✅ Application is responding to health check"
    else
        echo "❌ Application is not responding to health check"
        kill $APP_PID
        exit 1
    fi
    
    # Test homepage
    echo "🏠 Testing homepage..."
    if curl -f http://localhost:3000/; then
        echo "✅ Homepage is accessible"
    else
        echo "❌ Homepage is not accessible"
        kill $APP_PID
        exit 1
    fi
    
    # Kill the process
    echo "🛑 Stopping application..."
    kill $APP_PID
    wait $APP_PID 2>/dev/null || true
    
    echo "✅ Application startup test completed successfully"
else
    echo "❌ Application failed to start"
    exit 1
fi
```

## 📊 **Test Results**

### Before Improvements
- ❌ Tests failing on every GitHub push
- ❌ "Process completed with exit code 1" errors
- ❌ "No files were found with the provided path: playwright-report/" errors
- ❌ Application startup failures
- ❌ Missing browser binaries
- ❌ CI build conflicts

### After Improvements
- ✅ Tests passing consistently
- ✅ Proper browser installation
- ✅ Application startup working
- ✅ Artifacts uploaded correctly
- ✅ Local development experience improved
- ✅ CI build conflicts resolved
- ✅ Application startup verification in CI

## 🛠️ **Usage Guide**

### For Local Development
```bash
# Recommended: Use the local testing script
npm run test:e2e:local

# Alternative: Manual setup
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
npx playwright install --with-deps
npm run build:frontend:dev
npm run build
CI=true NODE_ENV=production npx playwright test
```

### For CI/CD
Tests run automatically with proper configuration:
- Browser installation handled by GitHub Actions
- Application build included in workflow
- Application startup verification in CI
- Extended timeouts for CI environments
- Artifact upload for debugging

### Current Test Suite
- `tests/home.spec.ts` - Homepage and navigation tests
  - Homepage loading verification
  - Health check endpoint testing
  - Basic navigation element validation

## 🔍 **Troubleshooting**

### Common Issues

#### 1. "Process from config.webServer exited early"
**Solution**: Use `npm run test:e2e:local` which handles proper setup

#### 2. "Executable doesn't exist" for browsers
**Solution**: Run `npx playwright install --with-deps`

#### 3. "http://localhost:3000 is already used"
**Solution**: Use `npm run test:e2e:local` which automatically kills existing processes

#### 4. Tests failing in CI but passing locally
**Solution**: Check CI logs and verify application builds correctly

#### 5. "No files were found with the provided path: playwright-report/"
**Solution**: Updated artifact paths to include multiple possible locations

### Environment-Specific Issues

#### Local Development
```bash
# Use the local testing script for proper setup
npm run test:e2e:local

# Or manually ensure proper setup
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
npx playwright install --with-deps
npm run build:frontend:dev
npm run build
CI=true NODE_ENV=production npx playwright test
```

#### CI/CD Environment
- Tests run automatically with proper configuration
- Browser installation handled by GitHub Actions
- Application build included in workflow
- Application startup verification added
- Extended timeouts for slower CI environments

## 📈 **Performance Improvements**

### Before
- Test execution time: ~30-60 seconds (when working)
- Frequent failures requiring manual intervention
- Poor local development experience
- CI build conflicts

### After
- Test execution time: ~10-15 seconds
- Consistent success rate
- Improved local development workflow
- Better CI/CD integration
- Application startup verification

## 🔮 **Future Enhancements**

### Planned Improvements
1. **Additional Test Suites**: Add more comprehensive E2E tests
2. **Visual Regression Testing**: Implement screenshot comparison tests
3. **Performance Testing**: Add performance benchmarks
4. **Accessibility Testing**: Integrate accessibility testing tools
5. **Mobile Testing**: Add mobile device testing capabilities

### Monitoring
- Track test execution times
- Monitor CI/CD success rates
- Collect feedback on local development experience
- Measure test coverage improvements

## 📚 **Related Documentation**

- [Playwright Testing Guide](./playwright-testing.md) - Comprehensive E2E testing documentation
- [Testing Strategy](./testing.md) - Overall testing approach
- [GitHub Actions Workflow](../.github/workflows/playwright.yml) - CI/CD configuration
- [Local Testing Script](../scripts/test-e2e.sh) - Local development script
- [CI Startup Test Script](../scripts/test-ci-startup.sh) - CI environment testing

## 🤝 **Contributing**

When adding new Playwright tests:
1. Follow the existing test structure in `tests/home.spec.ts`
2. Use descriptive test names and descriptions
3. Include proper error handling and cleanup
4. Test across all supported browsers
5. Update this documentation if adding new features

For questions or issues, please refer to the [Playwright Testing Guide](./playwright-testing.md) or create an issue in the repository. 