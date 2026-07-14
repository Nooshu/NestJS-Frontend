#!/bin/bash

# Prepare project for Docker build
echo "🔧 Preparing project for Docker build..."

# Check if package-lock.json exists
if [ ! -f "package-lock.json" ]; then
    echo "❌ package-lock.json not found. Running npm install..."
    npm install
fi

# Ensure package-lock.json is up to date
echo "📦 Updating package-lock.json..."
npm install --legacy-peer-deps

# Verify npm ci works
echo "✅ Testing npm ci..."
npm ci --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Package dependencies are in sync"
    echo ""
echo "🚀 Ready for Docker build!"
echo "Run: docker compose build frontend"
else
    echo "❌ Package dependencies are not in sync"
    echo "Please run: npm install"
    exit 1
fi