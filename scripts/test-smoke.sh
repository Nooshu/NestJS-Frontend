#!/usr/bin/env bash
# Lightweight Playwright smoke suite (chromium only).
# Starts/reuses the app on port 3002 via playwright.config.ts webServer.

set -euo pipefail

echo "Running smoke tests (chromium)..."

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required" >&2
  exit 1
fi

# Ensure browsers exist (no OS deps unless user needs them)
npx playwright install chromium >/dev/null

CI="${CI:-}" NODE_ENV="${NODE_ENV:-production}" \
  npx playwright test tests/smoke.spec.ts --project=chromium --reporter=line

echo "Smoke tests completed."
