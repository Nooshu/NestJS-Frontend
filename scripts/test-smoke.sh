#!/usr/bin/env bash
# Lightweight Playwright smoke suite (chromium only).
# Ensures browsers are installed, then runs smoke against playwright.config.ts webServer.

set -euo pipefail

echo "Ensuring Playwright browsers are installed..."
npx playwright install chromium

echo "Running smoke tests (chromium)..."
CI="${CI:-}" NODE_ENV="${NODE_ENV:-production}" \
  npx playwright test tests/smoke.spec.ts --project=chromium --reporter=line

echo "Smoke tests completed."
