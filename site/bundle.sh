#!/usr/bin/env bash
# Bundle the page script (site/src/main.js, no libraries) into site/js.
set -e; cd "$(dirname "$0")/.."; rm -rf site/js
npx esbuild site/src/main.js --bundle --format=esm --minify --outdir=site/js
