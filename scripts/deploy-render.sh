#!/bin/bash

# Render.com Deployment Script
# This script helps prepare and deploy the NestJS application to Render.com

set -e

echo "🚀 Preparing NestJS application for Render.com deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js version is compatible
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Run tests
echo "🧪 Running tests..."
npm run test

# Build the application
echo "🔨 Building application..."
npm run build:prod

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully"

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please ensure it exists in the project root."
    exit 1
fi

echo "✅ render.yaml configuration found"

# Display deployment information
echo ""
echo "🎉 Application is ready for Render.com deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to your Git repository"
echo "2. Go to https://render.com/dashboard"
echo "3. Create a new Web Service"
echo "4. Connect your repository"
echo "5. Use the following configuration:"
echo "   - Build Command: npm ci && npm run build:prod"
echo "   - Start Command: npm run start:render"
echo "   - Health Check Path: /health"
echo ""
echo "📋 Environment variables to set in Render dashboard:"
echo "   NODE_ENV=production"
echo "   PORT=10000"
echo "   HOST=0.0.0.0"
echo "   LOG_LEVEL=info"
echo "   LOG_CONSOLE=true"
echo "   CORS_ENABLED=true"
echo "   CSRF_ENABLED=true"
echo "   CSP_ENABLED=true"
echo ""
echo "📖 For detailed instructions, see RENDER_DEPLOYMENT.md"
echo ""
echo "🔗 Health check endpoints available:"
echo "   - /health (basic)"
echo "   - /health/detailed (comprehensive)"
echo "   - /health/ready (readiness probe)"
echo "   - /health/live (liveness probe)"
echo ""
echo "✨ Happy deploying!"
