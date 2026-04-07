#!/usr/bin/env bash
# Build the Windows installer
# Requires: Node.js 18+, npm
# Produces: dist/Be Candid Setup.exe

set -euo pipefail

echo "Building Be Candid for Windows..."
cd "$(dirname "$0")/.."

npm install
npx electron-builder --win --publish never

echo "Build complete! Installer at: dist/"
ls -la dist/*.exe 2>/dev/null || echo "No .exe found — check build output"
