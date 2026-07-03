#!/usr/bin/env bash
set -euo pipefail

# Convert all PNG assets to WebP using GraphicsMagick
find assets -name '*.png' -exec gm mogrify -format webp {} \;
