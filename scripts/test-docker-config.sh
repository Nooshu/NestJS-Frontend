#!/bin/bash

# Test Docker configuration without requiring Docker
echo "🧪 Testing Docker configuration..."

# Test 1: Check if all required files exist
echo "📁 Checking required files..."
required_files=("Dockerfile" "docker-compose.yml" ".dockerignore" "package.json" "package-lock.json")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Test 2: Validate package-lock.json is in sync
echo ""
echo "📦 Testing package dependencies..."
if npm ci --legacy-peer-deps --dry-run &> /dev/null; then
    echo "✅ package-lock.json is in sync"
else
    echo "❌ package-lock.json is out of sync"
    echo "Run: ./scripts/prepare-docker.sh"
    exit 1
fi

# Test 3: Check Dockerfile syntax (basic validation)
echo ""
echo "🔍 Validating Dockerfile..."
if grep -q "FROM node:20-alpine" Dockerfile; then
    echo "✅ Dockerfile has correct base image"
else
    echo "❌ Dockerfile missing correct base image"
    exit 1
fi

if grep -q "EXPOSE 3100" Dockerfile; then
    echo "✅ Dockerfile exposes correct port"
else
    echo "❌ Dockerfile missing port exposure"
    exit 1
fi

# Test 4: Check docker-compose.yml syntax (basic validation)
echo ""
echo "🔍 Validating docker-compose.yml..."
if grep -q "version:" docker-compose.yml; then
    echo "✅ docker-compose.yml has version"
else
    echo "❌ docker-compose.yml missing version"
    exit 1
fi

if grep -q "3100:3100" docker-compose.yml; then
    echo "✅ docker-compose.yml has correct port mapping"
else
    echo "❌ docker-compose.yml missing port mapping"
    exit 1
fi

# Test 5: Check main.ts port configuration
echo ""
echo "🔍 Checking port configuration..."
if grep -q "process.env.PORT || 3100" src/main.ts; then
    echo "✅ main.ts configured for port 3100"
else
    echo "❌ main.ts not configured for port 3100"
    exit 1
fi

echo ""
echo "✅ All Docker configuration tests passed!"
echo ""
echo "📋 Next steps:"
echo "1. Install Docker Desktop"
echo "2. Run: ./scripts/setup-docker.sh"
echo "3. Run: docker-compose up"
echo "4. Visit: https://localhost:3100" 