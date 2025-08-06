#!/bin/bash

# Docker configuration validation script
echo "🔍 Validating Docker configuration..."

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found"
    exit 1
else
    echo "✅ Dockerfile found"
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found"
    exit 1
else
    echo "✅ docker-compose.yml found"
fi

# Check if .dockerignore exists
if [ ! -f ".dockerignore" ]; then
    echo "❌ .dockerignore not found"
    exit 1
else
    echo "✅ .dockerignore found"
fi

# Validate Dockerfile syntax
echo ""
echo "🔍 Validating Dockerfile syntax..."
if command -v docker &> /dev/null; then
    if docker build --dry-run -f Dockerfile . &> /dev/null; then
        echo "✅ Dockerfile syntax is valid"
    else
        echo "❌ Dockerfile syntax validation failed"
        exit 1
    fi
else
    echo "⚠️  Docker not available - skipping syntax validation"
fi

# Check docker-compose.yml syntax
echo ""
echo "🔍 Validating docker-compose.yml syntax..."
if command -v docker-compose &> /dev/null; then
    if docker-compose config &> /dev/null; then
        echo "✅ docker-compose.yml syntax is valid"
    else
        echo "❌ docker-compose.yml syntax validation failed"
        exit 1
    fi
elif command -v docker &> /dev/null; then
    if docker compose config &> /dev/null; then
        echo "✅ docker-compose.yml syntax is valid"
    else
        echo "❌ docker-compose.yml syntax validation failed"
        exit 1
    fi
else
    echo "⚠️  Docker Compose not available - skipping syntax validation"
fi

# Check port configuration in main.ts
echo ""
echo "🔍 Checking port configuration..."
if grep -q "process.env.PORT || 3100" src/main.ts; then
    echo "✅ Port 3100 configured correctly in main.ts"
else
    echo "❌ Port 3100 not configured correctly in main.ts"
    exit 1
fi

echo ""
echo "✅ All Docker configuration files are valid!"
echo ""
echo "📋 Next steps:"
echo "1. Install Docker Desktop if not already installed"
echo "2. Run: ./scripts/setup-docker.sh"
echo "3. Run: docker-compose up (or docker compose up)"
echo "4. Visit: https://localhost:3100" 