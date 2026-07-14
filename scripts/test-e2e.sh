#!/bin/bash

# End-to-End Test Script
# This script sets up the environment and runs Playwright tests

set -e

echo "🚀 Setting up E2E test environment..."

# Kill any existing processes on port 3002
echo "📋 Checking for existing processes on port 3002..."
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "No processes found on port 3002"

# Install Playwright browsers if not already installed
echo "🌐 Installing Playwright browsers..."
npx playwright install

# Build the application
echo "🔨 Building application..."
npm run build:frontend:dev
npm run build

# Run the tests
echo "🧪 Running E2E tests..."
CI=true NODE_ENV=production npx playwright test --reporter=line --timeout=60000

echo "✅ E2E tests completed!" 