#!/bin/bash
#
# Convert Be Candid Chrome extension to Safari Web Extension
# Requires: Xcode 14+ with Safari Web Extension support
#
# Usage: ./scripts/convert-safari.sh
#
# This uses Apple's official safari-web-extension-converter tool
# to wrap the Chrome extension in a macOS/iOS app container.
#
# After running, open the generated Xcode project to build and test.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$EXT_DIR/dist"
OUTPUT_DIR="$EXT_DIR/../safari-extension"

# Ensure dist exists
if [ ! -d "$DIST_DIR" ]; then
  echo "Error: dist/ not found. Run 'npm run build' first."
  exit 1
fi

# Check for Xcode CLI tools
if ! command -v xcrun &> /dev/null; then
  echo "Error: Xcode Command Line Tools not found."
  echo "Install with: xcode-select --install"
  exit 1
fi

# Clean previous output
if [ -d "$OUTPUT_DIR" ]; then
  echo "Removing previous Safari extension project..."
  rm -rf "$OUTPUT_DIR"
fi

echo "Converting Chrome extension to Safari Web Extension..."
echo ""

xcrun safari-web-extension-converter "$DIST_DIR" \
  --project-location "$OUTPUT_DIR" \
  --app-name "Be Candid" \
  --bundle-identifier io.becandid.safari \
  --no-open \
  --force

echo ""
echo "Safari extension project created at: apps/safari-extension/"
echo ""
echo "Next steps:"
echo "  1. Open apps/safari-extension/Be Candid.xcodeproj in Xcode"
echo "  2. Select your team in Signing & Capabilities"
echo "  3. Build and run (Cmd+R)"
echo "  4. Enable in Safari > Settings > Extensions > Be Candid"
echo ""
