#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."   # repo root

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building"
pnpm exec turbo run build --concurrency=1 --ui=stream

echo "==> Applying database migrations"
pnpm --filter @repo/db db:deploy 2>&1 | grep -v '^Datasource'

echo "==> Restarting apps"
pm2 startOrReload "$HOME/ecosystem.config.cjs"

echo "==> Health check"
for i in $(seq 1 20); do
  if curl -fs http://localhost:3001/api/health > /dev/null && curl -fs -o /dev/null http://localhost:3000; then
    echo "Deploy OK"
    exit 0
  fi
  sleep 3
done

echo "Health check FAILED" >&2
pm2 logs --nostream --lines 40 >&2 || true
exit 1