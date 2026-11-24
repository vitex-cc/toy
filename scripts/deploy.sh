#!/usr/bin/env bash
# Build the app and publish dist/ to the server, replacing what's there.
#
#   npm run deploy
#
# Override the target with DEPLOY_HOST / DEPLOY_DIR if needed.
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-jp}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/service/toy}"

cd "$(dirname "$0")/.."

echo "==> building"
npm run build

echo "==> uploading to ${DEPLOY_HOST}:${DEPLOY_DIR}"
# Order matters so visitors never load a page whose assets aren't there yet
# (asset names are content-hashed, so new ones never clash with old ones):
#   1. add new assets  2. switch index.html  3. prune stale files.
# Plain flags only: macOS ships openrsync, which lacks --chmod etc.
rsync -rlz --checksum dist/assets/ "${DEPLOY_HOST}:${DEPLOY_DIR}/assets/"
rsync -rlz --checksum --delete dist/ "${DEPLOY_HOST}:${DEPLOY_DIR}/"
# nginx runs as another user: make everything world-readable.
ssh "${DEPLOY_HOST}" "chmod -R u=rwX,go=rX '${DEPLOY_DIR}'"

echo "==> deployed $(git rev-parse --short HEAD 2>/dev/null || echo '?') to ${DEPLOY_HOST}:${DEPLOY_DIR}"
ssh "${DEPLOY_HOST}" "ls -la '${DEPLOY_DIR}' '${DEPLOY_DIR}/assets'"
