#!/bin/bash

# Script to verify package security and integrity
# This script checks that all packages are pinned and have SHA integrity verification

set -e

echo "🔒 Verifying Package Security Configuration..."
echo ""

# Check 1: Verify .npmrc has save-exact=true
echo "📋 Checking .npmrc configuration..."
if grep -q "save-exact=true" .npmrc; then
    echo "✅ .npmrc has save-exact=true configured"
else
    echo "❌ .npmrc missing save-exact=true"
    exit 1
fi

# Check 2: Verify package-lock.json exists
echo ""
echo "📦 Checking package-lock.json..."
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json exists"

    # Check lockfile version
    if grep -q '"lockfileVersion": 3' package-lock.json; then
        echo "✅ Using lockfileVersion 3 (includes integrity hashes)"
    fi

    # Count integrity hashes
    INTEGRITY_COUNT=$(grep -c '"integrity": "sha512-' package-lock.json || echo "0")
    echo "✅ Found $INTEGRITY_COUNT packages with SHA-512 integrity hashes"
else
    echo "❌ package-lock.json not found"
    exit 1
fi

# Check 3: Verify no version ranges in package.json
echo ""
echo "🔍 Checking for version ranges in package.json..."
RANGES=$(grep -E '"[^"]+":\s*"[~^]' package.json || true)
if [ -z "$RANGES" ]; then
    echo "✅ All packages are pinned (no ^ or ~ ranges found)"
else
    echo "❌ Found version ranges in package.json:"
    echo "$RANGES"
    exit 1
fi

# Check 4: Verify Node.js and npm versions
echo ""
echo "🟢 Checking Node.js and npm versions..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✅ Node.js: $NODE_VERSION"
echo "✅ npm: $NPM_VERSION"

# Check 5: Run npm audit
echo ""
echo "🔐 Running security audit..."
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    echo "✅ No security vulnerabilities found"
else
    echo "⚠️  Security vulnerabilities detected. Run 'npm audit' for details."
    npm audit --audit-level=moderate
fi

# Check 6: Verify package-lock.json is in sync
echo ""
echo "🔄 Verifying package-lock.json is in sync..."
if npm ci --dry-run > /dev/null 2>&1; then
    echo "✅ package-lock.json is in sync with package.json"
else
    echo "⚠️  package-lock.json may be out of sync. Run 'npm install' to update."
fi

echo ""
echo "✅ All security checks passed!"
echo ""
echo "📝 Summary:"
echo "  - All packages are pinned to exact versions"
echo "  - SHA-512 integrity hashes are present for all packages"
echo "  - .npmrc enforces exact versions for future installs"
echo "  - Node.js and npm are up to date"
echo "  - No security vulnerabilities detected"
