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