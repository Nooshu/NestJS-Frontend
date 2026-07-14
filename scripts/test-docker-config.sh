#!/bin/bash

# Test Docker configuration without requiring a full image build
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

# Test 3: Check Dockerfile base image and port
echo ""
echo "🔍 Validating Dockerfile..."
if grep -qE 'node:26(-[a-z0-9.+]+)?' Dockerfile; then
    echo "✅ Dockerfile uses Node 26 base image"
else
    echo "❌ Dockerfile missing Node 26 base image (expected node:26...)"
    exit 1
fi

if grep -q "EXPOSE 3100" Dockerfile; then
    echo "✅ Dockerfile exposes port 3100"
else
    echo "❌ Dockerfile missing EXPOSE 3100"
    exit 1
fi

# Test 4: Check docker-compose.yml port mapping
echo ""
echo "🔍 Validating docker-compose.yml..."
if grep -q "3100:3100" docker-compose.yml; then
    echo "✅ docker-compose.yml maps host 3100 → container 3100"
else
    echo "❌ docker-compose.yml missing 3100:3100 port mapping"
    exit 1
fi

if command -v docker &> /dev/null; then
    if docker compose config &> /dev/null; then
        echo "✅ docker compose config is valid"
    else
        echo "❌ docker compose config failed"
        exit 1
    fi
fi

# Test 5: Check main.ts supports container PORT override
echo ""
echo "🔍 Checking port configuration..."
if grep -qE "process\.env\.PORT \|\| 3002" src/main.ts; then
    echo "✅ main.ts defaults to 3002 locally and respects PORT (Compose sets 3100)"
else
    echo "❌ main.ts port configuration unexpected"
    exit 1
fi

echo ""
echo "✅ All Docker configuration tests passed!"
echo ""
echo "📋 Next steps:"
echo "1. Install Docker Desktop if needed"
echo "2. Run: ./scripts/prepare-docker.sh"
echo "3. Run: docker compose up --build frontend"
echo "4. Visit: http://localhost:3100"
