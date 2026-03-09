#!/bin/bash
# Copy sec.html into the Flutter assets directory before building
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$SCRIPT_DIR/assets"
cp "$SCRIPT_DIR/../sec.html" "$SCRIPT_DIR/assets/sec.html"
echo "✓ sec.html copied to assets/"
