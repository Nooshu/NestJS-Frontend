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

# Validate Dockerfile expectations (avoid `docker build --check` — it can hang
# waiting on registry metadata when Hub is slow or unreachable).
echo ""
echo "🔍 Validating Dockerfile..."
if grep -qE 'node:26(-[a-z0-9.+]+)?' Dockerfile && grep -q 'EXPOSE 3100' Dockerfile; then
    echo "✅ Dockerfile uses Node 26 base and exposes 3100"
else
    echo "❌ Dockerfile missing expected Node 26 base or EXPOSE 3100"
    exit 1
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
if grep -qE "process\.env\.PORT \|\| 3002" src/main.ts; then
    echo "✅ main.ts defaults to 3002 and honours PORT (Docker/Compose set PORT=3100)"
else
    echo "❌ main.ts port configuration unexpected"
    exit 1
fi

echo ""
echo "✅ All Docker configuration files are valid!"
echo ""
echo "📋 Next steps:"
echo "1. Install Docker Desktop if not already installed"
echo "2. Run: ./scripts/prepare-docker.sh"
echo "3. Run: docker compose up --build frontend"
echo "4. Visit: http://localhost:3100" 